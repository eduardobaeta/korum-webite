export const VISIT_INTERESTS = ['undecided', 'pilot-episode', 'studio-day', 'authority-plan', 'brand-design'] as const;

export const VISIT_PERIODS = ['morning', 'afternoon'] as const;

export type VisitInterest = (typeof VISIT_INTERESTS)[number];
export type VisitPeriod = (typeof VISIT_PERIODS)[number];

export interface VisitRequest {
  name: string;
  company: string;
  /** Digits only, including the area code. */
  whatsapp: string;
  email?: string;
  interest: VisitInterest;
  period: VisitPeriod;
  message?: string;
}

export interface NewsletterSubscription {
  email: string;
}

export type Lead =
  { type: 'visit-request'; data: VisitRequest } | { type: 'newsletter-subscription'; data: NewsletterSubscription };

export type LeadType = Lead['type'];
