import { describe, expect, it } from 'vitest';
import { visitRequestSchema } from './visit-request-schema';

const validInput = {
  name: 'Test Person',
  company: 'Example Company',
  whatsapp: '(44) 90000-0000',
  email: '',
  interest: 'pilot-episode',
  period: 'morning',
  message: '',
};

describe('visitRequestSchema', () => {
  it('accepts a complete visit request and normalizes the phone to digits', () => {
    const result = visitRequestSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data?.whatsapp).toBe('44900000000');
  });

  it('turns blank optional fields into undefined', () => {
    const result = visitRequestSchema.safeParse(validInput);

    expect(result.data?.email).toBeUndefined();
    expect(result.data?.message).toBeUndefined();
  });

  it('trims text and lowercases a provided e-mail', () => {
    const result = visitRequestSchema.safeParse({ ...validInput, name: '  Test Person ', email: ' Test@Example.COM ' });

    expect(result.data?.name).toBe('Test Person');
    expect(result.data?.email).toBe('test@example.com');
  });

  it('accepts a phone with the Brazilian country code', () => {
    expect(visitRequestSchema.safeParse({ ...validInput, whatsapp: '+55 44 90000-0000' }).success).toBe(true);
  });

  it.each([
    ['name', ''],
    ['name', 'A'],
    ['company', '   '],
    ['whatsapp', '9000-0000'],
    ['email', 'not-an-email'],
    ['interest', 'something-else'],
    ['period', 'night'],
    ['message', 'x'.repeat(1001)],
  ])('rejects an invalid %s', (field, value) => {
    const result = visitRequestSchema.safeParse({ ...validInput, [field]: value });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path[0]).toBe(field);
  });

  it('rejects a request without required fields', () => {
    expect(visitRequestSchema.safeParse({}).success).toBe(false);
  });
});
