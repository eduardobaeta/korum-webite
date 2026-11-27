import { toLocale } from '@/config/i18n';
import { thankYouPath } from '@/config/routes';
import {
  createConfiguredRateLimiter,
  createLeadRoute,
  newsletterSubscriptionSchema,
  resolveConfiguredLeadGateway,
} from '@/features/leads';

export const prerender = false;

export const POST = createLeadRoute({
  schema: newsletterSubscriptionSchema,
  toLead: (data) => ({ type: 'newsletter-subscription', data }),
  resolveGateway: resolveConfiguredLeadGateway,
  rateLimiter: createConfiguredRateLimiter('newsletter-subscriptions'),
  // Forms on localized pages add `?locale=` to their action, so the confirmation page matches their language.
  successRedirect: (request) =>
    thankYouPath('newsletter-subscription', toLocale(new URL(request.url).searchParams.get('locale'))),
});
