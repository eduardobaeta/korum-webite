import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createBrevoLeadGateway } from './brevo-lead-gateway';

const BASE_URL = 'https://brevo.example/v3';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const gateway = createBrevoLeadGateway({
  apiKey: 'test-key',
  listIds: { 'newsletter-subscription': 22 },
  baseUrl: BASE_URL,
});

function recordContacts(response: () => Response = () => new HttpResponse(null, { status: 204 })) {
  const requests: Request[] = [];
  server.use(
    http.post(`${BASE_URL}/contacts`, ({ request }) => {
      requests.push(request.clone());
      return response();
    }),
  );
  return requests;
}

describe('createBrevoLeadGateway', () => {
  it('adds a newsletter subscriber to the list', async () => {
    const requests = recordContacts();

    await gateway.submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } });

    expect(requests[0]?.headers.get('api-key')).toBe('test-key');
    expect(await requests[0]?.json()).toEqual({ email: 'ana@example.com', listIds: [22], updateEnabled: true });
  });

  it('ignores visit requests', async () => {
    const requests = recordContacts();

    await gateway.submit({
      type: 'visit-request',
      data: {
        name: 'Ana',
        company: 'Empresa',
        whatsapp: '44999990000',
        email: 'ana@example.com',
        interest: 'undecided',
        period: 'morning',
      },
    });

    expect(requests).toHaveLength(0);
  });

  it('rejects with a normalized error when Brevo refuses the contact', async () => {
    recordContacts(() => HttpResponse.json({ code: 'unauthorized' }, { status: 401 }));

    await expect(
      gateway.submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toEqual({ code: 'unauthenticated' });
  });
});
