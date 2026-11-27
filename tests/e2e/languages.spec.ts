import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('the English home declares its language and links both versions for search engines', async ({ page }) => {
  await page.goto('/en/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText(/no idea\s+what to say/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://site.example/en/');
  await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute(
    'href',
    'https://site.example/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    'https://site.example/en/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    'href',
    'https://site.example/',
  );
});

test('each version links to the other language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header a[hreflang="en"]').first()).toHaveAttribute('href', '/en/');

  await page.goto('/en/');
  await expect(page.locator('header a[hreflang="pt-BR"]').first()).toHaveAttribute('href', '/');
});

test('English forms ask the API for English confirmation pages', async ({ page }) => {
  await page.goto('/en/');

  await expect(page.locator('form[data-lead-form="visit-request"]')).toHaveAttribute(
    'action',
    '/api/visit-requests/?locale=en',
  );
  await expect(page.locator('form[data-lead-form="newsletter-subscription"]')).toHaveAttribute(
    'action',
    '/api/newsletter-subscriptions/?locale=en',
  );
});

test('the English confirmation page is in English and leads back to the English home', async ({ page }) => {
  await page.goto('/en/thank-you/visit-request/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/request\s+received/i);
  await expect(page.getByRole('link', { name: 'Back to the site' })).toHaveAttribute('href', '/en/');
});

test('the English home has no automatically detectable WCAG A/AA violations', async ({ page }) => {
  await page.goto('/en/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('[data-decorative]')
    .analyze();

  expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
});
