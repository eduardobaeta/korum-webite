export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Portuguese stays at the root so existing links keep working; other locales get a path prefix. */
export const DEFAULT_LOCALE: Locale = 'pt';

export const localeSettings: Record<
  Locale,
  { language: string; openGraphLocale: string; label: string; name: string }
> = {
  pt: { language: 'pt-BR', openGraphLocale: 'pt_BR', label: 'PT', name: 'Português' },
  en: { language: 'en', openGraphLocale: 'en_US', label: 'EN', name: 'English' },
};

export function toLocale(value: string | null | undefined): Locale {
  return LOCALES.find((locale) => locale === value) ?? DEFAULT_LOCALE;
}

/** `/visit/` → `/en/visit/`; paths for the default locale are returned unchanged. */
export function localizePath(path: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

/** The same page without its locale prefix, e.g. `/en/thank-you/x/` → `/thank-you/x/`. */
export function unlocalizePath(pathname: string): string {
  const prefix = LOCALES.find((locale) => locale !== DEFAULT_LOCALE && pathname.startsWith(`/${locale}/`));
  return prefix ? pathname.slice(prefix.length + 1) : pathname;
}
