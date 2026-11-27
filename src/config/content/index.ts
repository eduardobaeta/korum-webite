import type { Locale } from '../i18n';
import * as en from './en';
import * as pt from './pt';

export type { MessagePageContent } from './pt';

export type SiteContent = typeof pt;

/** `satisfies` makes a missing or misshaped English entry a type error. */
const contentByLocale = { pt, en } satisfies Record<Locale, SiteContent>;

export function getContent(locale: Locale): SiteContent {
  return contentByLocale[locale];
}
