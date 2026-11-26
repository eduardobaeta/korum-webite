import { ATTIO_API_TOKEN, ATTIO_DEAL_OWNER_EMAIL, BREVO_API_TOKEN, BREVO_NEWSLETTER_LIST_ID } from 'astro:env/server';
import { takePrices } from '@/config/prices';
import type { LeadGateway } from '../domain/lead-gateway';
import { createAttioLeadGateway } from './attio-lead-gateway';
import { createBrevoLeadGateway } from './brevo-lead-gateway';
import { createFanOutLeadGateway } from './fan-out-lead-gateway';

/** Every lead reaches the Attio CRM; newsletter sign-ups also join the Brevo list that sends "A Pauta". */
export function resolveConfiguredLeadGateway(): LeadGateway | null {
  if (!ATTIO_API_TOKEN || !ATTIO_DEAL_OWNER_EMAIL || !BREVO_API_TOKEN || BREVO_NEWSLETTER_LIST_ID === undefined) {
    return null;
  }

  return createFanOutLeadGateway([
    createAttioLeadGateway({
      token: ATTIO_API_TOKEN,
      dealOwnerEmail: ATTIO_DEAL_OWNER_EMAIL,
      productPrices: takePrices,
    }),
    createBrevoLeadGateway({
      apiKey: BREVO_API_TOKEN,
      listIds: { 'newsletter-subscription': BREVO_NEWSLETTER_LIST_ID },
    }),
  ]);
}
