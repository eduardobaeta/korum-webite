import { thankYouPath } from '@/config/routes';
import {
  createConfiguredRateLimiter,
  createLeadRoute,
  visitRequestSchema,
  resolveConfiguredLeadGateway,
} from '@/features/leads';

export const prerender = false;

export const POST = createLeadRoute({
  schema: visitRequestSchema,
  toLead: (data) => ({ type: 'visit-request', data }),
  resolveGateway: resolveConfiguredLeadGateway,
  rateLimiter: createConfiguredRateLimiter('visit-requests'),
  successRedirect: thankYouPath('visit-request'),
});
