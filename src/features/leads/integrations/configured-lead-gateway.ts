import { LEAD_WEBHOOK_TOKEN, LEAD_WEBHOOK_URL } from 'astro:env/server';
import type { LeadGateway } from '../domain/lead-gateway';
import { createWebhookLeadGateway } from './webhook-lead-gateway';

export function resolveConfiguredLeadGateway(): LeadGateway | null {
  if (!LEAD_WEBHOOK_URL) return null;
  return createWebhookLeadGateway({ url: LEAD_WEBHOOK_URL, token: LEAD_WEBHOOK_TOKEN });
}
