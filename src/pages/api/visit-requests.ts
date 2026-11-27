import { toLocale } from '@/config/i18n';
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
  // Forms on localized pages add `?locale=` to their action, so the confirmation page matches their language.
  successRedirect: (request) =>
    thankYouPath('visit-request', toLocale(new URL(request.url).searchParams.get('locale'))),
});
