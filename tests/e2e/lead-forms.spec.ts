import { expect, test, type Page, type Route } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const VISIT_ENDPOINT = '**/api/visit-requests/';
const NEWSLETTER_ENDPOINT = '**/api/newsletter-subscriptions/';

function answerWith(status: number, body: unknown) {
  return (route: Route) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

async function fillVisitRequest(page: Page) {
  const form = page.locator('form[data-lead-form="visit-request"]');
  await form.getByLabel('Nome*').fill('Test Person');
  await form.getByLabel('Empresa*').fill('Example Company');
  await form.getByLabel('WhatsApp*').fill('(44) 90000-0000');
  await form.getByLabel('O que você procura').selectOption('pilot-episode');
  return form;
}

test('does not submit the visit request while required fields are empty', async ({ page }) => {
  let requests = 0;
  await page.route(VISIT_ENDPOINT, (route) => {
    requests += 1;
    return answerWith(200, { ok: true })(route);
  });
  await page.goto('/');

  await page.getByRole('button', { name: 'Agendar minha visita' }).click();

  expect(requests).toBe(0);
  await expect(page.locator('form[data-lead-form="visit-request"]').getByLabel('Nome*')).toBeFocused();
});

test('confirms the visit request only after the server accepts it', async ({ page }) => {
  let sentBody = '';
  await page.route(VISIT_ENDPOINT, (route) => {
    sentBody = route.request().postData() ?? '';
    return answerWith(200, { ok: true })(route);
  });
  await page.goto('/');

  const form = await fillVisitRequest(page);
  await form.getByRole('button', { name: 'Agendar minha visita' }).click();

  await expect(form.getByRole('status')).toHaveText(/pedido recebido/i);
  await expect(form.getByLabel('Nome*')).toHaveValue('');
  expect(new URLSearchParams(sentBody).get('interest')).toBe('pilot-episode');
});

test('highlights the fields the server rejects', async ({ page }) => {
  await page.route(
    VISIT_ENDPOINT,
    answerWith(422, { ok: false, error: { code: 'validation', fieldErrors: { whatsapp: ['Invalid phone'] } } }),
  );
  await page.goto('/');

  const form = await fillVisitRequest(page);
  await form.getByRole('button', { name: 'Agendar minha visita' }).click();

  await expect(form.getByRole('status')).toHaveText(/confira os campos/i);
  await expect(form.getByLabel('WhatsApp*')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByLabel('WhatsApp*')).toHaveAccessibleDescription('Informe um WhatsApp com DDD.');
  await expect(form.getByLabel('WhatsApp*')).toBeFocused();
  await expect(form.getByText('Informe seu nome.')).toBeHidden();

  await page.route(VISIT_ENDPOINT, answerWith(200, { ok: true }));
  await form.getByRole('button', { name: 'Agendar minha visita' }).click();
  await expect(form.getByText('Informe um WhatsApp com DDD.')).toBeHidden();
});

test('keeps the data and explains when the submission fails', async ({ page }) => {
  await page.route(VISIT_ENDPOINT, answerWith(502, { ok: false, error: { code: 'unexpected' } }));
  await page.goto('/');

  const form = await fillVisitRequest(page);
  await form.getByRole('button', { name: 'Agendar minha visita' }).click();

  await expect(form.getByRole('status')).toHaveText(/não foi possível enviar/i);
  await expect(form.getByLabel('Nome*')).toHaveValue('Test Person');
  await expect(form.getByRole('button', { name: 'Agendar minha visita' })).toBeEnabled();
});

test('asks the visitor to wait when submissions are rate limited', async ({ page }) => {
  await page.route(
    VISIT_ENDPOINT,
    answerWith(429, { ok: false, error: { code: 'rate-limited', retryAfterSeconds: 60 } }),
  );
  await page.goto('/');

  const form = await fillVisitRequest(page);
  await form.getByRole('button', { name: 'Agendar minha visita' }).click();

  await expect(form.getByRole('status')).toHaveText(/muitas tentativas/i);
  await expect(form.getByLabel('Nome*')).toHaveValue('Test Person');
});

test('subscribes to the newsletter', async ({ page }) => {
  await page.route(NEWSLETTER_ENDPOINT, answerWith(200, { ok: true }));
  await page.goto('/');

  const form = page.locator('form[data-lead-form="newsletter-subscription"]');
  await form.getByLabel('E-mail').fill('reader@example.com');
  await form.getByRole('button', { name: 'Quero a pauta' }).click();

  await expect(form.getByRole('status')).toHaveText(/inscrição feita/i);
});

test('links the newsletter field to the error message the server returns', async ({ page }) => {
  await page.route(
    NEWSLETTER_ENDPOINT,
    answerWith(422, { ok: false, error: { code: 'validation', fieldErrors: { email: ['Invalid email'] } } }),
  );
  await page.goto('/');

  const form = page.locator('form[data-lead-form="newsletter-subscription"]');
  await form.getByLabel('E-mail').fill('reader@example.com');
  await form.getByRole('button', { name: 'Quero a pauta' }).click();

  await expect(form.getByLabel('E-mail')).toHaveAccessibleDescription(/confira os campos/i);
  await expect(form.getByLabel('E-mail')).toBeFocused();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('posts the visit request natively and lands on the confirmation page', async ({ page }) => {
    let sentBody = '';
    await page.route(VISIT_ENDPOINT, (route) => {
      sentBody = route.request().postData() ?? '';
      return route.fulfill({ status: 303, headers: { location: '/thank-you/visit-request/' } });
    });
    await page.goto('/');

    await fillVisitRequest(page);
    await page.getByRole('button', { name: 'Agendar minha visita' }).click();

    await expect(page).toHaveURL(/\/thank-you\/visit-request\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/pedido recebido/i);
    expect(new URLSearchParams(sentBody).get('name')).toBe('Test Person');
  });
});

test('confirmation pages are excluded from search results', async ({ page }) => {
  for (const form of ['visit-request', 'newsletter-subscription']) {
    await page.goto(`/thank-you/${form}/`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  }
});
