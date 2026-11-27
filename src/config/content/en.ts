/**
 * English copy, mirroring `pt.ts`. Brand and place names stay as they are (Korum, A Pauta, Atrium, Maringá) and prices
 * stay in reais.
 */
import type { LinkItem } from '@/components/types';
import { VISIT_INTERESTS, VISIT_PERIODS, type LeadType, type VisitInterest, type VisitPeriod } from '@/features/leads';
import { formatBrl } from '@/lib/currency';
import { localizePath } from '../i18n';
import { takePrices } from '../prices';
import { anchorTo, contact, sectionIds, whatsappLink } from '../site';
import type { MessagePageContent } from './pt';

const bookVisitAnchor = anchorTo(sectionIds.bookVisit);
const home = localizePath('/', 'en');
const whatsappGreetingUrl = whatsappLink('Hi Korum! I saw your website and would like to book a studio visit.');

export const siteText = {
  title: 'Korum · Content and brand studio in Maringá, Brazil',
  description:
    'Content and brand studio in Maringá, Brazil. Strategy, filming, editing and design under one roof. Creativity with criteria. Ideas with purpose.',
  slogan: ['Creativity with criteria.', 'Ideas with purpose.'],
  socialImageAlt: 'Korum — From “no idea what to say” to posted.',
  navigation: [
    { href: anchorTo(sectionIds.services), label: 'Services' },
    { href: anchorTo(sectionIds.takes), label: 'Takes' },
    { href: anchorTo(sectionIds.howItWorks), label: 'How it works' },
    { href: anchorTo(sectionIds.studio), label: 'Studio' },
    { href: anchorTo(sectionIds.faq), label: 'FAQ' },
  ],
  callToAction: { href: bookVisitAnchor, label: 'Book a visit' },
  footerLinks: [
    { href: contact.instagramUrl, label: 'Instagram' },
    { href: whatsappGreetingUrl, label: 'WhatsApp' },
  ],
  interface: {
    skipToContent: 'Skip to content',
    homeLink: 'Korum, back to top',
    primaryNavigation: 'Main',
    mobileNavigation: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    otherLanguage: 'Ler em português',
  },
};

export const heroContent = {
  id: sectionIds.top,
  intro:
    'Content and brand studio in Maringá, Brazil. Strategy, filming, editing and design under one roof. You just show up.',
  primaryAction: { href: bookVisitAnchor, label: 'Book a visit' },
  secondaryAction: { href: anchorTo(sectionIds.takes), label: 'See the takes' },
  titleLines: ['From “no idea', 'what to say”', 'to posted.'],
  meta: { year: '© 2026', location: 'Maringá, PR', venue: 'Atrium · Sala 31' },
};

export const problemContent = {
  id: sectionIds.problem,
  eyebrow: 'The problem',
  titleLines: ['Your competitor', 'shows up every day.', 'Do you?'],
  statementLines: ['You’re better.', 'It’s just that', 'nobody sees it.'],
};

export const manifestoContent = {
  id: sectionIds.manifesto,
  segments: [
    { text: 'No camera rolls until we know who you’re talking to and what you want to sell.' },
    { text: 'Creativity with criteria.', emphasis: true },
    { text: 'Every piece has a reason: starting business conversations, not collecting views.' },
    { text: 'Ideas with purpose.', emphasis: true },
  ],
};

export const servicesContent = {
  id: sectionIds.services,
  intro: {
    eyebrow: 'Services',
    titleLines: ['From script to', 'brand, one', 'team.'],
    description: 'Strategy, filming, editing and design under one roof.',
    action: { href: bookVisitAnchor, label: 'Book a visit' },
  },
  items: [
    {
      index: 'A',
      title: 'Planning',
      text: 'Everything is set with the strategist before the camera rolls.',
      tags: ['Editorial line', 'Topics', 'Scripts'],
    },
    {
      index: 'B',
      title: 'Filming',
      text: 'Our in-house operator is at every session.',
      tags: ['4 sets', '3 Sony cameras', '4 microphones'],
    },
    {
      index: 'C',
      title: 'Podcast',
      text: 'We also produce your company’s podcast.',
      tags: ['Multi-camera videocast', 'From format to published episode'],
    },
    {
      index: 'D',
      title: 'Editing',
      text: 'No raw files.',
      tags: ['Episodes', 'Vertical clips', 'Short videos ready to post'],
    },
    {
      index: 'E',
      title: 'Design',
      text: 'Your brand comes already applied to the content. Brand projects on proposal.',
      tags: ['Covers', 'Graphics', 'Carousels', 'Brand identity'],
    },
  ],
};

export const howItWorksContent = {
  id: sectionIds.howItWorks,
  eyebrow: 'How it works',
  titleLines: ['Come without a topic.', 'Leave with content ready.'],
  steps: [
    {
      index: '01',
      title: 'You arrive without a topic.',
      text: 'The topic comes out of a conversation with the strategist: who you’re talking to and what you want to sell.',
      tags: ['Audience', 'Theme', 'Topic', 'Script'],
    },
    {
      index: '02',
      title: 'We pick the theme, film and edit.',
      text: 'With the script ready, you film in the studio with our in-house operator. Editing is on us.',
      tags: ['4 sets', '3 Sony cameras', '4 microphones'],
    },
    {
      index: '03',
      title: 'You leave with content ready.',
      text: 'Episode, clips and graphics ready to post. No raw files.',
      tags: ['Episode', 'Vertical clips', 'Covers'],
    },
  ],
};

export const takesContent = {
  id: sectionIds.takes,
  intro: {
    eyebrow: 'Takes',
    titleLines: ['Three takes', 'to get started.'],
    description: 'Fixed price, no overtime.',
    action: { href: bookVisitAnchor, label: 'Book a visit' },
  },
  takeAction: { href: bookVisitAnchor, label: 'Book a visit' },
  takes: [
    {
      index: '01',
      title: 'Pilot Episode',
      lead: 'Film one episode and get a feel for the process.',
      price: formatBrl(takePrices['pilot-episode']),
      note: 'Credited toward your first month on the plan',
      tags: ['45 to 60 min of filming', 'Briefing with the strategist', '2 edited clips'],
    },
    {
      index: '02',
      title: 'Korum Day',
      lead: 'One studio day. The month sorted.',
      price: formatBrl(takePrices['studio-day']),
      note: 'Paid upfront or in 2 installments',
      tags: [
        '6 h of scripted studio time',
        '1 edited episode',
        '10 clips from the episode',
        '6 scripted videos',
        'Cover',
      ],
    },
    {
      index: '03',
      title: 'Authority Plan',
      lead: '1 episode a week, at a fixed time.',
      price: formatBrl(takePrices['authority-plan']),
      priceSuffix: '/month',
      note: '6-month contract',
      tags: [
        '4 episodes, 16 clips and 4 covers a month',
        'Topics and scripts',
        'Monthly report',
        '[Coming soon] Korum Circle',
      ],
    },
  ],
  extras: {
    titleLines: ['Add-ons', 'and one-offs'],
    conditions:
      'Korum Day booked with a 50% deposit, rescheduling up to 24 h in advance and 1 round of revisions per delivery.',
    items: [
      { name: 'Single episode', detail: '1 h edited + 3 clips', price: 'R$ 1.290' },
      { name: '5 extra clips', price: 'R$ 395' },
      { name: '4 covers', price: 'R$ 280' },
      { name: 'Graphics pack', price: 'R$ 350' },
      { name: 'Interviewer on set', price: 'R$ 300' },
      { name: 'Premium editing', detail: 'Color, motion, B-roll', price: 'R$ 520/ep.' },
      { name: 'Strategic onboarding', detail: '12 topics', price: 'R$ 1.900' },
      { name: '4 carousels', detail: 'Per month', price: 'R$ 600/month' },
    ],
  },
};

export const studioContent = {
  id: sectionIds.studio,
  eyebrow: 'The studio',
  titleLines: ['Built for', 'batch filming.'],
  description: 'Set up for batch filming: one studio day becomes a month of content.',
  action: { href: bookVisitAnchor, label: 'Book a visit' },
  features: [
    {
      title: '4 filming sets',
      text: 'Meeting room, interview room, coffee corner and the office mezzanine. Each one adapts to the format of your content.',
    },
    { title: '3 Sony cameras', text: 'Our in-house operator is at every session.' },
    { title: '4 desk microphones', text: 'Multi-camera videocast, from format to published episode.' },
    { title: 'Strategy, filming and design', text: 'From script to brand, one team.' },
  ],
};

export const circleContent = {
  id: sectionIds.circle,
  eyebrow: 'Coming soon · Korum Circle',
  titleLines: ['Those who film here', 'know each other.'],
  lead: {
    emphasis: 'The recording ends, the conversation goes on.',
    text: 'Once a month, the people who film at Korum sit at the same table to swap contacts, referrals and deals.',
  },
  action: { href: anchorTo(sectionIds.takes), label: 'See the Authority Plan' },
  pillars: [
    { title: 'Once a month', text: 'A monthly meetup, only for business owners who film at Korum.' },
    { title: 'Curated', text: 'Everyone at the table is selected by Korum.' },
    {
      title: 'Included in the Authority Plan',
      text: 'Your seat comes with the plan. The first tables open soon.',
    },
  ],
};

export const comparisonContent = {
  id: sectionIds.comparison,
  eyebrow: 'Comparison',
  baselineTitleLines: ['An hourly studio', 'delivers files.'],
  ourTitleLines: ['Korum delivers', 'positioning.'],
  tableLabel: 'Hourly studio compared with Korum',
  columns: { baseline: 'Hourly studio', ours: 'Korum' },
  rows: [
    { baseline: 'You arrive with your topic ready', ours: 'The topic comes out of a conversation with the strategist' },
    { baseline: 'You leave with raw files', ours: 'You leave with episode, clips and graphics ready to post' },
    { baseline: 'One camera operator', ours: 'Strategist, videomaker and designer' },
    { baseline: 'Overtime billed separately', ours: 'Fixed price per take' },
    { baseline: 'You film and leave', ours: 'You join a circle of business owners' },
  ],
};

export const faqContent = {
  id: sectionIds.faq,
  intro: {
    eyebrow: 'FAQ',
    titleLines: ['Questions before', 'you film.'],
    description: 'Prefer WhatsApp?',
    action: { href: contact.whatsappUrl, label: contact.whatsappDisplay },
  },
  items: [
    {
      question: 'I don’t know what to film. Can I start like that?',
      answer:
        'Yes, and most people do. Before the camera rolls, the strategist talks with you and comes away with a theme, topic and script. You only need to talk about your business.',
    },
    {
      question: 'Do I need to bring equipment or a crew?',
      answer:
        'No. The studio, cameras, audio, lighting and our in-house team (strategist, videomaker and designer) are included in the price.',
    },
    {
      question: 'Does the Authority Plan have a minimum term?',
      answer:
        'Yes, 6 months. Positioning is built through consistency, and anything shorter is too little to measure results. Every month you get a report on what was published and what came back.',
    },
    {
      question: 'Do you create my brand identity?',
      answer:
        'We do. The brand project is made by the same team that produces your content, so the brand comes already applied to episodes, clips and social media. Pricing is on proposal.',
    },
    {
      question: 'Can I just rent the studio?',
      answer:
        'Yes, on request, with an operator and a 2-hour minimum. But our focus is delivering finished content, not raw files.',
    },
    {
      question: 'Where is Korum?',
      answer: 'At Atrium, ground floor, room 31, in Maringá (PR), Brazil. Book a visit and come see the studio.',
    },
  ],
};

const visitInterestLabels: Record<VisitInterest, string> = {
  undecided: 'Not sure yet',
  'pilot-episode': 'Pilot Episode',
  'studio-day': 'Korum Day',
  'authority-plan': 'Authority Plan',
  'brand-design': 'Brand design',
};

const visitPeriodLabels: Record<VisitPeriod, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
};

const formMessages = {
  invalid: 'Check the highlighted fields.',
  rateLimited: `Too many attempts in a row. Wait a few minutes or message us on WhatsApp at ${contact.whatsappDisplay}.`,
  error: `We couldn’t send it right now. Try again or message us on WhatsApp at ${contact.whatsappDisplay}.`,
};

export const visitBookingContent = {
  id: sectionIds.bookVisit,
  eyebrow: 'Book a visit',
  titleLines: ['Come', 'see the', 'studio.'],
  lead: 'A 20-minute visit at Atrium. You see the set, talk with the strategist and leave knowing where to start.',
  address: contact.address,
  action: { href: contact.whatsappUrl, label: `Prefer WhatsApp? ${contact.whatsappDisplay}` },
  form: {
    action: '/api/visit-requests/?locale=en',
    fields: {
      name: { label: 'Name*', placeholder: 'Your name', error: 'Enter your name.' },
      company: { label: 'Company*', placeholder: 'Company name', error: 'Enter the company name.' },
      whatsapp: {
        label: 'WhatsApp*',
        placeholder: '(44) 90000-0000',
        error: 'Enter a WhatsApp number with area code.',
      },
      email: { label: 'Email', placeholder: 'you@company.com', error: 'Check the email address.' },
      interest: { label: 'What are you looking for', error: 'Choose an option.' },
      period: { label: 'Best time for the visit', error: 'Choose a time.' },
      message: {
        label: 'Message',
        placeholder: 'Tell us in one line what you want to film (optional)',
        error: 'Use 1,000 characters at most.',
      },
    },
    interestOptions: VISIT_INTERESTS.map((value) => ({ value, label: visitInterestLabels[value] })),
    periodOptions: VISIT_PERIODS.map((value) => ({ value, label: visitPeriodLabels[value] })),
    submitLabel: 'Book my visit',
    note: 'We reply on WhatsApp to set the time.',
    messages: { ...formMessages, success: 'Request received. We’ll message you on WhatsApp to set the time.' },
  },
};

export const newsletterContent = {
  id: sectionIds.newsletter,
  eyebrow: 'A Pauta · weekly newsletter',
  description: 'Every Monday, a video idea ready to film, written for business owners.',
  titleLines: ['One topic', 'a week.'],
  form: {
    action: '/api/newsletter-subscriptions/?locale=en',
    emailLabel: 'Email',
    emailPlaceholder: 'you@email.com',
    submitLabel: 'Send me the topic',
    note: 'Unsubscribe anytime, in one click.',
    messages: { ...formMessages, success: 'You’re in. The first topic arrives on Monday.' },
  },
};

const backToSite: LinkItem = { href: home, label: 'Back to the site' };

export const thankYouContent: Record<LeadType, MessagePageContent> = {
  'visit-request': {
    title: 'Request received · Korum',
    eyebrow: 'Book a visit',
    headingLines: ['Request', 'received.'],
    lead: `We’ll message you on WhatsApp to set the visit time. Want to speed things up? Talk to us: ${contact.whatsappDisplay}.`,
    actions: [backToSite, { href: whatsappGreetingUrl, label: 'Message us on WhatsApp' }],
  },
  'newsletter-subscription': {
    title: 'You’re in · Korum',
    eyebrow: 'A Pauta · weekly newsletter',
    headingLines: ['You’re', 'in.'],
    lead: 'The first topic arrives on Monday. Unsubscribe anytime, in one click.',
    actions: [backToSite],
  },
};

export const notFoundContent: MessagePageContent = {
  title: 'Page not found · Korum',
  eyebrow: 'Error 404',
  headingLines: ['Page', 'not found.'],
  lead: 'This address doesn’t exist or has moved. Go back to the start or book a studio visit.',
  actions: [backToSite, { href: `${home}${bookVisitAnchor}`, label: 'Book a visit' }],
};
