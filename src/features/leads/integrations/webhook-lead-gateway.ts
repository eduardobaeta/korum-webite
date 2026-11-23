import { createHttpClient } from '@/server/http/create-http-client';
import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

export const DEFAULT_WEBHOOK_TIMEOUT_MS = 8000;

export interface WebhookLeadGatewayOptions {
  /** Server-only. Apps Script reads its shared secret from the query string. */
  url: string;
  token?: string;
  timeoutMs?: number;
  now?: () => Date;
}

/**
 * Apps Script answers HTTP 200 even on errors, so only `{ "ok": true }` counts as accepted
 * (contract: docs/integrations/google-sheets-lead-webhook.md).
 */
export function createWebhookLeadGateway({
  url,
  token,
  timeoutMs = DEFAULT_WEBHOOK_TIMEOUT_MS,
  now = () => new Date(),
}: WebhookLeadGatewayOptions): LeadGateway {
  const client = createHttpClient({
    timeout: timeoutMs,
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

  return {
    async submit(lead: Lead): Promise<void> {
      const response = await client.post<unknown>(url, {
        type: lead.type,
        submittedAt: now().toISOString(),
        idempotencyKey: await idempotencyKeyFor(lead),
        ...lead.data,
      });

      if (!isConfirmation(response.data)) throw new Error('Lead webhook did not confirm the submission');
    },
  };
}

/** Same validated content, same key: the destination drops repeated submissions. */
export async function idempotencyKeyFor(lead: Lead): Promise<string> {
  const content = new TextEncoder().encode(JSON.stringify({ type: lead.type, data: lead.data }));
  const digest = await crypto.subtle.digest('SHA-256', content);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isConfirmation(data: unknown): boolean {
  const body = typeof data === 'string' ? parseJson(data) : data;
  return typeof body === 'object' && body !== null && 'ok' in body && body.ok === true;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
