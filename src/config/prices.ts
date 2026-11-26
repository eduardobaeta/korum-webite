import type { VisitInterest } from '@/features/leads';

/** Single source for prices the site shows and the CRM records as deal value (BRL; the plan is per month). */
export const takePrices = {
  'pilot-episode': 590,
  'studio-day': 3900,
  'authority-plan': 4900,
} as const satisfies Partial<Record<VisitInterest, number>>;
