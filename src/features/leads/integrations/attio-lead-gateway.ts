import type { AxiosInstance } from 'axios';
import { createHttpClient } from '@/server/http/create-http-client';
import type { Lead, LeadType, VisitInterest, VisitPeriod, VisitRequest } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

const ATTIO_API_URL = 'https://api.attio.com/v2';
const DEFAULT_TIMEOUT_MS = 8000;

/** Titles and slugs configured in the Attio workspace (docs/integrations/leads.md). */
export const LEAD_SOURCES: Record<LeadType, string> = {
  'visit-request': 'Visit request (site)',
  'newsletter-subscription': 'Newsletter',
};

/** Options of the deal `product` select; "undecided" opens a deal without a product. */
const PRODUCTS: Record<VisitInterest, string | undefined> = {
  undecided: undefined,
  'pilot-episode': 'Episódio Piloto',
  'studio-day': 'Dia Korum',
  'authority-plan': 'Plano Autoridade',
  'brand-design': 'Design de marca',
};

const PERIODS: Record<VisitPeriod, string> = { morning: 'Morning', afternoon: 'Afternoon' };

const DEAL_STAGES = { new: 'New lead', closed: ['Won 🎉', 'Lost'] };

export const NEWSLETTER_LIST = 'newsletter';

export interface AttioLeadGatewayOptions {
  token: string;
  /** Workspace member who owns new deals; Attio requires an owner on every deal. */
  dealOwnerEmail: string;
  /** Deal value in BRL per product; products without a price open deals without value. */
  productPrices: Partial<Record<VisitInterest, number>>;
  baseUrl?: string;
  timeoutMs?: number;
}

type AttioValues = Record<string, unknown>;

interface AttioRecord {
  id: string;
  stage?: string;
}

export function createAttioLeadGateway({
  token,
  dealOwnerEmail,
  productPrices,
  baseUrl = ATTIO_API_URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: AttioLeadGatewayOptions): LeadGateway {
  const client = createHttpClient({
    baseURL: baseUrl,
    timeout: timeoutMs,
    headers: { authorization: `Bearer ${token}` },
  });

  /** The visit form makes e-mail optional, so a person without one is matched by WhatsApp. */
  async function upsertPerson(values: AttioValues, email?: string, phone?: string): Promise<string> {
    if (email) {
      return writeRecord(client, 'put', '/objects/people/records?matching_attribute=email_addresses', {
        ...values,
        email_addresses: [email],
      });
    }
    const existing = phone ? await findPersonByPhone(client, phone) : undefined;
    if (existing) {
      await client.patch(`/objects/people/records/${existing}`, { data: { values } });
      return existing;
    }
    return writeRecord(client, 'post', '/objects/people/records', values);
  }

  /** A person keeps a single open deal: a second visit request updates it instead of opening another. */
  async function upsertOpenDeal(visit: VisitRequest, personId: string, companyId: string): Promise<void> {
    const openDealId = await findOpenDeal(client, personId);
    if (openDealId) {
      await client.patch(`/objects/deals/records/${openDealId}`, {
        data: { values: dealUpdateValues(visit, companyId) },
      });
      return;
    }
    await writeRecord(
      client,
      'post',
      '/objects/deals/records',
      dealValues(visit, personId, companyId, dealOwnerEmail, productPrices[visit.interest]),
    );
  }

  async function addToNewsletter(personId: string): Promise<void> {
    const response = await client.get<unknown>(`/objects/people/records/${personId}/entries`);
    const entries = dataOf(response.data);
    const listed =
      Array.isArray(entries) && entries.some((entry: unknown) => field(entry, 'list_api_slug') === NEWSLETTER_LIST);
    if (listed) return;
    await client.post(`/lists/${NEWSLETTER_LIST}/entries`, {
      data: { parent_record_id: personId, parent_object: 'people', entry_values: {} },
    });
  }

  return {
    async submit(lead: Lead): Promise<void> {
      if (lead.type === 'newsletter-subscription') {
        const personId = await upsertPerson({ lead_source: LEAD_SOURCES[lead.type] }, lead.data.email);
        await addToNewsletter(personId);
        return;
      }

      const visit = lead.data;
      const companyId = await findOrCreateCompany(client, visit.company);
      const phone = toE164(visit.whatsapp);
      const personId = await upsertPerson(personValues(visit, companyId), visit.email, phone);
      await upsertOpenDeal(visit, personId, companyId);
    },
  };
}

async function findOrCreateCompany(client: AxiosInstance, name: string): Promise<string> {
  const response = await client.post<unknown>('/objects/companies/records/query', {
    filter: { name: { $eq: name } },
    limit: 1,
  });
  return recordsOf(response.data)[0]?.id ?? writeRecord(client, 'post', '/objects/companies/records', { name });
}

async function findPersonByPhone(client: AxiosInstance, phone: string): Promise<string | undefined> {
  const response = await client.post<unknown>('/objects/people/records/query', {
    filter: { phone_numbers: phone },
    limit: 1,
  });
  return recordsOf(response.data)[0]?.id;
}

async function findOpenDeal(client: AxiosInstance, personId: string): Promise<string | undefined> {
  const response = await client.post<unknown>('/objects/deals/records/query', {
    filter: { associated_people: { target_object: 'people', target_record_id: personId } },
    limit: 20,
  });
  return recordsOf(response.data).find(({ stage }) => !stage || !DEAL_STAGES.closed.includes(stage))?.id;
}

async function writeRecord(client: AxiosInstance, method: 'put' | 'post', path: string, values: AttioValues) {
  const response = await client[method]<unknown>(path, { data: { values } });
  const recordId = recordsOf({ data: [dataOf(response.data)] })[0]?.id;
  if (!recordId) throw new Error('Attio did not confirm the record');
  return recordId;
}

function personValues(visit: VisitRequest, companyId: string): AttioValues {
  return {
    name: [personalName(visit.name)],
    phone_numbers: [{ original_phone_number: toE164(visit.whatsapp), country_code: 'BR' }],
    company: [{ target_object: 'companies', target_record_id: companyId }],
    lead_source: LEAD_SOURCES['visit-request'],
  };
}

function dealValues(
  visit: VisitRequest,
  personId: string,
  companyId: string,
  ownerEmail: string,
  price: number | undefined,
): AttioValues {
  const values: AttioValues = {
    stage: DEAL_STAGES.new,
    owner: ownerEmail,
    associated_people: [{ target_object: 'people', target_record_id: personId }],
    ...dealUpdateValues(visit, companyId),
  };
  if (price !== undefined) values.value = price;
  return values;
}

/** What a later visit request adds to an open deal; stage, owner and value stay as the team left them. */
function dealUpdateValues(visit: VisitRequest, companyId: string): AttioValues {
  const values: AttioValues = {
    name: `Visit · ${visit.company}`,
    lead_source: LEAD_SOURCES['visit-request'],
    associated_company: [{ target_object: 'companies', target_record_id: companyId }],
    preferred_period: PERIODS[visit.period],
  };
  const product = PRODUCTS[visit.interest];
  if (product) values.product = product;
  if (visit.message) values.message = visit.message;
  return values;
}

function personalName(fullName: string) {
  const [firstName = fullName, ...rest] = fullName.trim().split(/\s+/);
  return { first_name: firstName, last_name: rest.join(' '), full_name: fullName.trim() };
}

/** The form keeps digits only; a 12+ digit number already carries Brazil's country code (55). */
export function toE164(digits: string): string {
  return digits.length >= 12 && digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
}

function field(value: unknown, key: string): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  const entries: [string, unknown][] = Object.entries(value);
  return entries.find(([name]) => name === key)?.[1];
}

function dataOf(body: unknown): unknown {
  return field(body, 'data');
}

function recordsOf(body: unknown): AttioRecord[] {
  const records = dataOf(body);
  if (!Array.isArray(records)) return [];
  return records.flatMap((record: unknown) => {
    const id = field(field(record, 'id'), 'record_id');
    if (typeof id !== 'string') return [];
    const stageValues = field(field(record, 'values'), 'stage');
    const stage = Array.isArray(stageValues) ? field(field(stageValues[0], 'status'), 'title') : undefined;
    return [{ id, stage: typeof stage === 'string' ? stage : undefined }];
  });
}
