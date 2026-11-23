import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Lead } from '../domain/lead';
import { createWebhookLeadGateway, idempotencyKeyFor } from './webhook-lead-gateway';

const WEBHOOK_URL = 'https://hooks.example/leads';
const lead: Lead = { type: 'newsletter-subscription', data: { email: 'reader@example.com' } };
const fixedNow = () => new Date('2026-11-23T12:00:00.000Z');

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function recordRequests(respond: () => Response | Promise<Response>) {
  const requests: Request[] = [];
  server.use(
    http.post(WEBHOOK_URL, ({ request }) => {
      requests.push(request.clone());
      return respond();
    }),
  );
  return requests;
}

const confirmed = () => HttpResponse.json({ ok: true });

describe('createWebhookLeadGateway', () => {
  it('posts the lead as JSON with its type, submission time and idempotency key', async () => {
    const requests = recordRequests(confirmed);

    await createWebhookLeadGateway({ url: WEBHOOK_URL, now: fixedNow }).submit(lead);

    expect(requests).toHaveLength(1);
    expect(requests[0]?.headers.get('content-type')).toContain('application/json');
    expect(await requests[0]?.json()).toEqual({
      type: 'newsletter-subscription',
      submittedAt: '2026-11-23T12:00:00.000Z',
      idempotencyKey: await idempotencyKeyFor(lead),
      email: 'reader@example.com',
    });
  });

  it('sends a bearer token only when configured', async () => {
    const requests = recordRequests(confirmed);

    await createWebhookLeadGateway({ url: WEBHOOK_URL, token: 'test-token' }).submit(lead);
    await createWebhookLeadGateway({ url: WEBHOOK_URL }).submit(lead);

    expect(requests[0]?.headers.get('authorization')).toBe('Bearer test-token');
    expect(requests[1]?.headers.has('authorization')).toBe(false);
  });

  it('rejects with a normalized error when the webhook answers with an error status', async () => {
    recordRequests(() => new HttpResponse('nope', { status: 500 }));

    await expect(createWebhookLeadGateway({ url: WEBHOOK_URL }).submit(lead)).rejects.toEqual({ code: 'unavailable' });
  });

  it.each([
    ['an empty body', () => new HttpResponse(null, { status: 200 })],
    ['a non-JSON body', () => new HttpResponse('ok', { status: 200 })],
    ['an explicit refusal', () => HttpResponse.json({ ok: false, error: 'unauthorized' })],
  ])('rejects a 200 response with %s', async (_description, respond) => {
    recordRequests(respond);

    await expect(createWebhookLeadGateway({ url: WEBHOOK_URL }).submit(lead)).rejects.toThrow('did not confirm');
  });

  it('rejects with a timeout when the webhook does not answer in time', async () => {
    recordRequests(async () => {
      await delay(200);
      return HttpResponse.json({ ok: true });
    });

    await expect(createWebhookLeadGateway({ url: WEBHOOK_URL, timeoutMs: 20 }).submit(lead)).rejects.toEqual({
      code: 'timeout',
    });
  });
});

describe('idempotencyKeyFor', () => {
  it('is stable for the same content and differs for different content', async () => {
    const sameLead: Lead = { type: 'newsletter-subscription', data: { email: 'reader@example.com' } };
    const otherLead: Lead = { type: 'newsletter-subscription', data: { email: 'other@example.com' } };

    expect(await idempotencyKeyFor(lead)).toBe(await idempotencyKeyFor(sameLead));
    expect(await idempotencyKeyFor(lead)).not.toBe(await idempotencyKeyFor(otherLead));
    expect(await idempotencyKeyFor(lead)).toMatch(/^[0-9a-f]{64}$/);
  });
});
