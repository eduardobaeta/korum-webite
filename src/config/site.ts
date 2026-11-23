import BrandLogo from '@/assets/brand/logo.svg';
import type { LinkItem } from '@/components/types';

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

export const siteConfig = {
  name: 'Korum',
  logo: BrandLogo,
  language: 'pt-BR',
  openGraphLocale: 'pt_BR',
  title: 'Korum · Estúdio de conteúdo e marca em Maringá',
  description:
    'Estúdio de conteúdo e marca em Maringá. Estratégia, gravação, edição e design no mesmo lugar. Criatividade com critério. Ideias com propósito.',
  themeColor: '#ffffff',
  slogan: ['Criatividade com critério.', 'Ideias com propósito.'],
  copyright: '© 2026 Korum',
  /** Open Graph / Twitter image; source in ~/Design/Korum/design/social-preview/. */
  socialImage: {
    path: '/social-preview.jpg',
    width: 1200,
    height: 630,
    alt: 'Korum — Do “não sei o que falar” ao post no ar.',
  },
  smoothScroll: true,
} as const;

const WHATSAPP_NUMBER = '554498539056';
const WHATSAPP_GREETING = 'Olá, Korum! Vi o site e quero agendar uma visita ao estúdio.';

export const contact = {
  whatsappDisplay: '(44) 9853-9056',
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
  whatsappGreetingUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_GREETING)}`,
  instagramHandle: '@studiokorum',
  instagramUrl: 'https://instagram.com/studiokorum',
  /** Always written uppercase by brand rule. */
  address: 'ATRIUM · TÉRREO – SALA 31 · MARINGÁ – PR',
  city: 'Maringá, PR',
} as const;

export const primaryNavigation: readonly LinkItem[] = [
  { href: anchorTo(sectionIds.services), label: 'Serviços' },
  { href: anchorTo(sectionIds.takes), label: 'Takes' },
  { href: anchorTo(sectionIds.howItWorks), label: 'Como funciona' },
  { href: anchorTo(sectionIds.studio), label: 'Estúdio' },
  { href: anchorTo(sectionIds.faq), label: 'Dúvidas' },
];

export const primaryCallToAction: LinkItem = { href: anchorTo(sectionIds.bookVisit), label: 'Agendar visita' };

export const footerLinks: readonly LinkItem[] = [
  { href: contact.instagramUrl, label: 'Instagram' },
  { href: contact.whatsappGreetingUrl, label: 'WhatsApp' },
];

export const interfaceText = {
  skipToContent: 'Pular para o conteúdo',
  homeLink: 'Korum, voltar ao topo',
  primaryNavigation: 'Principal',
  mobileNavigation: 'Menu',
  openMenu: 'Abrir menu',
  closeMenu: 'Fechar menu',
} as const;
