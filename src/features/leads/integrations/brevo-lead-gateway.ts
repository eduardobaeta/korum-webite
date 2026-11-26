import { createHttpClient } from '@/server/http/create-http-client';
import type { Lead, LeadType } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

const BREVO_API_URL = 'https://api.brevo.com/v3';
const DEFAULT_TIMEOUT_MS = 8000;

export interface BrevoLeadGatewayOptions {
  apiKey: string;
  /** Brevo list per lead type; lead types without a list are not sent to Brevo. */
  listIds: Partial<Record<LeadType, number>>;
  baseUrl?: string;
  timeoutMs?: number;
}

export function createBrevoLeadGateway({
  apiKey,
  listIds,
  baseUrl = BREVO_API_URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: BrevoLeadGatewayOptions): LeadGateway {
  const client = createHttpClient({ baseURL: baseUrl, timeout: timeoutMs, headers: { 'api-key': apiKey } });

  return {
    async submit(lead: Lead): Promise<void> {
      const listId = listIds[lead.type];
      if (listId === undefined || !lead.data.email) return;
      // `updateEnabled` turns a repeated e-mail into an update instead of a duplicate error.
      await client.post('/contacts', { email: lead.data.email, listIds: [listId], updateEnabled: true });
    },
  };
}
