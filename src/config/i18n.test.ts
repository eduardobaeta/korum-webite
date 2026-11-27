import { describe, expect, it } from 'vitest';
import { localizePath, toLocale, unlocalizePath } from './i18n';

describe('i18n paths', () => {
  it('keeps Portuguese at the root and prefixes English', () => {
    expect(localizePath('/', 'pt')).toBe('/');
    expect(localizePath('/', 'en')).toBe('/en/');
    expect(localizePath('/thank-you/visit-request/', 'en')).toBe('/en/thank-you/visit-request/');
  });

  it('strips the locale prefix to find the same page in another language', () => {
    expect(unlocalizePath('/en/')).toBe('/');
    expect(unlocalizePath('/en/thank-you/visit-request/')).toBe('/thank-you/visit-request/');
    expect(unlocalizePath('/thank-you/visit-request/')).toBe('/thank-you/visit-request/');
  });

  it('falls back to Portuguese for unknown or missing locales', () => {
    expect(toLocale('en')).toBe('en');
    expect(toLocale('fr')).toBe('pt');
    expect(toLocale(null)).toBe('pt');
  });
});
