import type { LeadType } from '@/features/leads';
import { localizePath, type Locale } from './i18n';

export const thankYouPath = (form: LeadType, locale: Locale): string => localizePath(`/thank-you/${form}/`, locale);
