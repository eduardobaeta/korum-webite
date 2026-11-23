import { z } from 'astro/zod';
import { VISIT_INTERESTS, VISIT_PERIODS, type VisitRequest } from '../domain/lead';
import { brazilianPhone, optionalEmailAddress, optionalText, requiredText } from './field-rules';

export const visitRequestSchema = z.object({
  name: requiredText(2, 120),
  company: requiredText(1, 160),
  whatsapp: brazilianPhone,
  email: optionalEmailAddress,
  interest: z.enum(VISIT_INTERESTS),
  period: z.enum(VISIT_PERIODS),
  message: optionalText(1000),
}) satisfies z.ZodType<VisitRequest, unknown>;
