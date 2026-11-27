import BrandLogo from '@/assets/brand/logo.svg';
import { DEFAULT_LOCALE, localizePath, type Locale } from './i18n';

export const sectionIds = {
  top: 'top',
  problem: 'problem',
  manifesto: 'manifesto',
  services: 'services',
  howItWorks: 'how-it-works',
  takes: 'takes',
  studio: 'studio',
  circle: 'circle',
  comparison: 'comparison',
  faq: 'faq',
  bookVisit: 'book-visit',
  newsletter: 'newsletter',
  contact: 'contact',
} as const;

export const anchorTo = (id: string): string => `#${id}`;

/** Section anchors exist only on the home page, so other pages point them back to the home of their language. */
export function linkFrom(pathname: string, href: string, locale: Locale = DEFAULT_LOCALE): string {
  const home = localizePath('/', locale);
  return href.startsWith('#') && pathname !== home ? `${home}${href}` : href;
}

export const siteConfig = {
  name: 'Korum',
  logo: BrandLogo,
  themeColor: '#ffffff',
  copyright: '© 2026 Korum',
  /** Open Graph / Twitter image; source in ~/Design/Korum/design/social-preview/. */
  socialImage: { path: '/social-preview.jpg', width: 1200, height: 630 },
  smoothScroll: true,
} as const;

const WHATSAPP_NUMBER = '554498539056';

export const contact = {
  whatsappDisplay: '(44) 9853-9056',
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
  instagramHandle: '@studiokorum',
  instagramUrl: 'https://instagram.com/studiokorum',
  /** Always written uppercase by brand rule. */
  address: 'ATRIUM · TÉRREO – SALA 31 · MARINGÁ – PR',
  city: 'Maringá, PR',
} as const;

export const whatsappLink = (message: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
