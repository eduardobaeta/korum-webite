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
  successRedirect: thankYouPath('newsletter-subscription'),
});
