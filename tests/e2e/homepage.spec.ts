import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Most journeys run with reduced motion so content is visible without waiting for reveals.
test.use({ reducedMotion: 'reduce' });

test('renders the page with one h1, main landmark, language and metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page).toHaveTitle(/\S/);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
});

test('declares canonical and social sharing metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://site.example/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://site.example/social-preview.jpg',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  expect((await page.request.get('/social-preview.jpg')).ok()).toBe(true);
});

test('keeps preview deployments out of search results', async ({ page, request }) => {
  await page.goto('/');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
});

test('offers a skip link to the main content', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');

  await expect(page).toHaveURL(/#main-content$/);
});

test('primary navigation scrolls to its section', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop navigation only');
  await page.goto('/');

  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Takes' }).click();

  await expect(page.getByRole('heading', { name: /três takes/i })).toBeInViewport();
});

test('mobile menu opens, navigates and closes with the keyboard', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Mobile navigation only');
  await page.goto('/');

  const toggle = page.getByRole('button', { name: 'Abrir menu' });
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
  const menu = page.getByRole('navigation', { name: 'Menu' });
  await expect(menu.getByRole('link', { name: 'Dúvidas' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(menu.getByRole('link', { name: 'Dúvidas' })).toBeHidden();

  await toggle.click();
  await menu.getByRole('link', { name: 'Dúvidas' }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', { name: /dúvidas antes de gravar/i })).toBeInViewport();
});

test('FAQ answers expand and collapse', async ({ page }) => {
  await page.goto('/');

  const question = page.locator('summary').filter({ hasText: 'O Plano Autoridade tem fidelidade?' });
  const answer = page.getByText('Sim, 6 meses.', { exact: false });

  await expect(answer).toBeHidden();
  await question.click();
  await expect(answer).toBeVisible();
  await question.press('Enter');
  await expect(answer).toBeHidden();
});

test('has no automatically detectable WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');

  // Large index numerals ("A /", "01 /") are pure decoration (hidden from assistive tech;
  // list order already conveys sequence), which WCAG 1.4.3 exempts from contrast.
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('[data-decorative]')
    .analyze();

  expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
});

test.describe('with motion enabled', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('reveals content as it scrolls into view', async ({ page }) => {
    await page.goto('/');

    const lead = page.getByText('Uma visita de 20 minutos no Atrium.', { exact: false });
    await expect(lead).toBeHidden();

    await page.evaluate(() => document.getElementById('book-visit')?.scrollIntoView());
    await expect(lead).toBeVisible();
  });
});
