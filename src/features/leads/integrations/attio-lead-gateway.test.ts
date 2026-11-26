import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Lead, VisitRequest } from '../domain/lead';
import { createAttioLeadGateway, LEAD_SOURCES, NEWSLETTER_LIST, toE164 } from './attio-lead-gateway';

const BASE_URL = 'https://attio.example/v2';
const OWNER = 'owner@example.com';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const record = (recordId: string) => HttpResponse.json({ data: { id: { record_id: recordId } } });

interface Captured {
  method: string;
  path: string;
  body: unknown;
}

interface Workspace {
  existingCompanyId?: string;
  personByPhone?: string;
  deals?: { id: string; stage: string }[];
  newsletterEntry?: boolean;
}

function attio({ existingCompanyId, personByPhone, deals = [], newsletterEntry = false }: Workspace = {}) {
  const requests: Captured[] = [];
  const capture = async (request: Request) => {
    const url = new URL(request.url);
    const body: unknown = request.method === 'GET' ? undefined : await request.json();
    requests.push({ method: request.method, path: url.pathname.replace('/v2', '') + url.search, body });
  };
  const records = (ids: (string | undefined)[]) =>
    HttpResponse.json({ data: ids.flatMap((id) => (id ? [{ id: { record_id: id } }] : [])) });
  server.use(
    http.put(`${BASE_URL}/objects/people/records`, async ({ request }) => (await capture(request), record('person-1'))),
    http.post(
      `${BASE_URL}/objects/people/records`,
      async ({ request }) => (await capture(request), record('person-new')),
    ),
    http.patch(
      `${BASE_URL}/objects/people/records/:id`,
      async ({ request }) => (await capture(request), record('person')),
    ),
    http.post(
      `${BASE_URL}/objects/people/records/query`,
      async ({ request }) => (await capture(request), records([personByPhone])),
    ),
    http.get(`${BASE_URL}/objects/people/records/:id/entries`, async ({ request }) => {
      await capture(request);
      return HttpResponse.json({
        data: newsletterEntry ? [{ list_api_slug: NEWSLETTER_LIST, entry_id: 'entry-1' }] : [],
      });
    }),
    http.post(
      `${BASE_URL}/objects/companies/records/query`,
      async ({ request }) => (await capture(request), records([existingCompanyId])),
    ),
    http.post(
      `${BASE_URL}/objects/companies/records`,
      async ({ request }) => (await capture(request), record('company-new')),
    ),
    http.post(`${BASE_URL}/objects/deals/records/query`, async ({ request }) => {
      await capture(request);
      return HttpResponse.json({
        data: deals.map(({ id, stage }) => ({
          id: { record_id: id },
          values: { stage: [{ status: { title: stage } }] },
        })),
      });
    }),
    http.post(`${BASE_URL}/objects/deals/records`, async ({ request }) => (await capture(request), record('deal-new'))),
    http.patch(
      `${BASE_URL}/objects/deals/records/:id`,
      async ({ request }) => (await capture(request), record('deal')),
    ),
    http.post(
      `${BASE_URL}/lists/:list/entries`,
      async ({ request }) => (await capture(request), HttpResponse.json({})),
    ),
  );
  return requests;
}

const calls = (requests: Captured[]) => requests.map(({ method, path }) => `${method} ${path}`);
const bodyOf = (requests: Captured[], method: string, path: string): unknown =>
  requests.find((request) => request.method === method && request.path === path)?.body;

const gateway = (timeoutMs?: number) =>
  createAttioLeadGateway({
    token: 'test-token',
    dealOwnerEmail: OWNER,
    productPrices: { 'studio-day': 3900, 'authority-plan': 4900 },
    baseUrl: BASE_URL,
    timeoutMs,
  });

const visit: VisitRequest = {
  name: 'Ana Maria Souza',
  company: 'Empresa',
  whatsapp: '44999990000',
  email: 'ana@example.com',
  interest: 'studio-day',
  period: 'morning',
  message: 'Quero gravar um podcast',
};
const visitLead = (data: Partial<VisitRequest> = {}): Lead => ({ type: 'visit-request', data: { ...visit, ...data } });

describe('createAttioLeadGateway', () => {
  it('records the company, the person and a deal priced by the chosen product', async () => {
    const requests = attio();

    await gateway().submit(visitLead());

    expect(calls(requests)).toEqual([
      'POST /objects/companies/records/query',
      'POST /objects/companies/records',
      'PUT /objects/people/records?matching_attribute=email_addresses',
      'POST /objects/deals/records/query',
      'POST /objects/deals/records',
    ]);
    expect(bodyOf(requests, 'PUT', '/objects/people/records?matching_attribute=email_addresses')).toEqual({
      data: {
        values: {
          name: [{ first_name: 'Ana', last_name: 'Maria Souza', full_name: 'Ana Maria Souza' }],
          phone_numbers: [{ original_phone_number: '+5544999990000', country_code: 'BR' }],
          company: [{ target_object: 'companies', target_record_id: 'company-new' }],
          lead_source: LEAD_SOURCES['visit-request'],
          email_addresses: ['ana@example.com'],
        },
      },
    });
    expect(bodyOf(requests, 'POST', '/objects/deals/records')).toEqual({
      data: {
        values: {
          stage: 'New lead',
          owner: OWNER,
          associated_people: [{ target_object: 'people', target_record_id: 'person-1' }],
          name: 'Visit · Empresa',
          lead_source: LEAD_SOURCES['visit-request'],
          associated_company: [{ target_object: 'companies', target_record_id: 'company-new' }],
          preferred_period: 'Morning',
          product: 'Dia Korum',
          message: 'Quero gravar um podcast',
          value: 3900,
        },
      },
    });
  });

  it('opens a deal without product or value when the visitor is undecided', async () => {
    const requests = attio({ existingCompanyId: 'company-1' });

    await gateway().submit(visitLead({ interest: 'undecided', message: undefined }));

    const deal = bodyOf(requests, 'POST', '/objects/deals/records');
    expect(deal).not.toHaveProperty('data.values.product');
    expect(deal).not.toHaveProperty('data.values.value');
    expect(deal).not.toHaveProperty('data.values.message');
  });

  it('matches a visitor without e-mail by WhatsApp and updates that person', async () => {
    const requests = attio({ existingCompanyId: 'company-1', personByPhone: 'person-phone' });

    await gateway().submit(visitLead({ email: undefined }));

    expect(bodyOf(requests, 'POST', '/objects/people/records/query')).toEqual({
      filter: { phone_numbers: '+5544999990000' },
      limit: 1,
    });
    expect(calls(requests)).toContain('PATCH /objects/people/records/person-phone');
    expect(calls(requests)).not.toContain('PUT /objects/people/records?matching_attribute=email_addresses');
  });

  it('creates the person when no one has that WhatsApp yet', async () => {
    const requests = attio({ existingCompanyId: 'company-1' });

    await gateway().submit(visitLead({ email: undefined }));

    expect(calls(requests)).toContain('POST /objects/people/records');
  });

  it('updates the open deal instead of opening a second one', async () => {
    const requests = attio({ existingCompanyId: 'company-1', deals: [{ id: 'deal-open', stage: 'Visit scheduled' }] });

    await gateway().submit(visitLead({ interest: 'authority-plan' }));

    expect(calls(requests)).toContain('PATCH /objects/deals/records/deal-open');
    expect(calls(requests)).not.toContain('POST /objects/deals/records');
    expect(bodyOf(requests, 'PATCH', '/objects/deals/records/deal-open')).toMatchObject({
      data: { values: { product: 'Plano Autoridade' } },
    });
  });

  it('opens a new deal when the earlier ones are closed', async () => {
    const requests = attio({ existingCompanyId: 'company-1', deals: [{ id: 'deal-won', stage: 'Won 🎉' }] });

    await gateway().submit(visitLead());

    expect(calls(requests)).toContain('POST /objects/deals/records');
  });

  it('adds a newsletter subscriber to the newsletter list once', async () => {
    const requests = attio();
    await gateway().submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } });

    expect(bodyOf(requests, 'POST', `/lists/${NEWSLETTER_LIST}/entries`)).toEqual({
      data: { parent_record_id: 'person-1', parent_object: 'people', entry_values: {} },
    });

    const repeated = attio({ newsletterEntry: true });
    await gateway().submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } });

    expect(calls(repeated)).not.toContain(`POST /lists/${NEWSLETTER_LIST}/entries`);
  });

  it('rejects when Attio answers without a record', async () => {
    server.use(http.put(`${BASE_URL}/objects/people/records`, () => HttpResponse.json({ data: {} })));

    await expect(
      gateway().submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toThrow('did not confirm');
  });

  it('rejects with a normalized error when Attio fails or times out', async () => {
    server.use(http.put(`${BASE_URL}/objects/people/records`, () => new HttpResponse(null, { status: 500 })));
    await expect(
      gateway().submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toEqual({ code: 'unavailable' });

    server.use(
      http.put(`${BASE_URL}/objects/people/records`, async () => {
        await delay(200);
        return record('late');
      }),
    );
    await expect(
      gateway(20).submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toEqual({ code: 'timeout' });
  });
});

describe('toE164', () => {
  it('adds the Brazilian country code only when it is missing', () => {
    expect(toE164('44999990000')).toBe('+5544999990000');
    expect(toE164('5544999990000')).toBe('+5544999990000');
  });
});
