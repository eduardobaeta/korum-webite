// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

const site = SITE_URL || (VERCEL_PROJECT_PRODUCTION_URL ? `https://${VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  adapter: vercel(),
  security: {
    checkOrigin: true,
    // frame-ancestors cannot live in a <meta> CSP, so vercel.json sends it as a header.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
    },
  },
  integrations: site ? [sitemap({ filter: (page) => !page.includes('/thank-you') })] : [],
  env: {
    schema: {
      LEAD_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true, url: true }),
      LEAD_WEBHOOK_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_URL: envField.string({ context: 'server', access: 'secret', optional: true, url: true }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      VERCEL_ENV: envField.enum({
        context: 'server',
        access: 'public',
        values: ['development', 'preview', 'production'],
        optional: true,
      }),
    },
  },
  // The toolbar injects its own markup (headings, landmarks) that E2E tests would see.
  // No Markdown code blocks: skip Shiki, whose inline styles a strict CSP would block.
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: process.env.E2E_TEST !== 'true' },
  vite: {
    plugins: [tailwindcss()],
  },
});
