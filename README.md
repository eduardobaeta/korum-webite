# Korum · Landing page

Code version of the Korum landing page originally built in Framer
(<https://stale-places-610171.framer.app>). Follows the company Astro standard: `AGENTS.md` (identical to
`CLAUDE.md`) and the documents in `docs/`.

**Stack:** Astro 7 (static pages + Vercel Functions for the form API) · TypeScript strict · Tailwind CSS 4 · Zod ·
Axios (server integrations) · Upstash Ratelimit · GSAP (ScrollTrigger, SplitText) · Lenis · Vitest + MSW ·
Playwright + axe · Bun (package manager) on Node.js 24.

## Commands

| Command             | What it does                                                                   |
| ------------------- | ------------------------------------------------------------------------------ |
| `bun install`       | Install dependencies from `bun.lock`                                           |
| `bun run dev`       | Dev server at `http://localhost:4321`                                          |
| `bun run lint`      | ESLint (TypeScript, Astro, import boundaries)                                  |
| `bun run format`    | Prettier (`format:check` in CI)                                                |
| `bun run typecheck` | `astro check`                                                                  |
| `bun run test`      | Vitest unit tests (`src/**/*.test.ts`); `test:watch`, `test:coverage`          |
| `bun run test:e2e`  | Playwright journeys (`tests/e2e/`, desktop + phone), starts its own dev server |
| `bun run build`     | Production build into `.vercel/output`                                         |
| `bun run verify`    | lint → format:check → typecheck → test → build                                 |

Never use `bun test` (Bun's own runner); tests run on Vitest. First E2E run on a machine:
`bunx playwright install chromium`. `astro preview` is not available with the Vercel adapter; use `vercel dev` or a
Vercel Preview deployment to try the production build with its functions.

## Structure

```text
src/
  assets/            brand/ (logo), icons/, images/ — imported and optimized by Astro
  components/
    layout/          SiteHeader, SiteFooter
    sections/        One component per home page section; content arrives through props
    ui/              Brand-neutral primitives: Button, TagList, TextField, SelectField, SectionIntro…
  config/            site.ts (identity, contacts, navigation, UI text, social image), home-content.ts (all copy
                     and media), routes.ts, deployment.ts (indexing rules)
  features/leads/    Form submissions: domain, schemas, application, integrations, http, components;
                     public API in index.ts
  layouts/           BaseLayout (SEO metadata, fonts, skip link, motion bootstrap)
  lib/               result.ts (shared Result / AppError), submit-form.ts (form enhancement), api/errors.ts
  pages/             index, thank-you/[form] (no-JS confirmations), robots.txt,
                     api/visit-requests, api/newsletter-subscriptions
  scripts/motion/    Opt-in smooth scrolling, reveals, scroll fade
  server/http/       create-http-client.ts — Axios factory for server integrations
  styles/            tokens.css, typography.css, globals.css
tests/e2e/           Playwright specs
docs/integrations/   Google Sheets webhook (Apps Script + setup guide)
```

## Configuration

Copy `.env.example` to `.env` for local work; set the same variables per environment in Vercel.

| Variable                   | Scope         | Purpose                                                                                                           |
| -------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                 | build         | Canonical origin. On Vercel the production domain is detected if unset.                                           |
| `LEAD_WEBHOOK_URL`         | server secret | Receives both forms as JSON. Contract and Google Sheets setup: `docs/integrations/google-sheets-lead-webhook.md`. |
| `LEAD_WEBHOOK_TOKEN`       | server secret | Optional bearer token for webhooks that read the Authorization header.                                            |
| `UPSTASH_REDIS_REST_URL`   | server secret | Upstash Redis (Vercel Marketplace) for distributed rate limiting.                                                 |
| `UPSTASH_REDIS_REST_TOKEN` | server secret | Token for the Redis above.                                                                                        |

- Without `LEAD_WEBHOOK_URL` the form API answers 503 and the forms show an error message with the WhatsApp
  number.
- **Rate limiting:** each client may send 6 submissions per 10 minutes per form. With the Upstash variables the
  limit is shared by every serverless instance; without them the API falls back to per-instance memory, which is
  only a temporary measure (`docs/security.md` §2). Add the Upstash Redis integration in Vercel → Storage before
  launch.
- Only the Vercel **production** deployment is indexable (`VERCEL_ENV`); previews and local builds get `noindex`
  and a disallow-all `robots.txt`. The sitemap, canonical URL and social image (`og:image`,
  `public/social-preview.jpg`) are emitted when a site URL is known. The image source lives in
  `~/Design/Korum/design/social-preview/` (`NODE_PATH=../../../../Desenvolvimento/korum-landing-page/node_modules node render.mjs`).
- Security headers: the build sends the Content-Security-Policy as a response header for every prerendered page
  (`staticHeaders`); `vercel.json` adds `frame-ancestors`, HSTS and the other headers. `astro dev` applies no
  policy, so check CSP on a build or a Preview deployment.
- URLs end in `/` (`trailingSlash: 'always'`), the form endpoints included (`/api/visit-requests/`); Vercel
  redirects the other form with a 308. Unknown addresses get `src/pages/404.astro`.

## Design system

Tokens live in `src/styles/tokens.css` with the shadcn vocabulary (`background`, `foreground`, `muted`,
`muted-foreground`, `primary`, `border`, `input`, `ring`) plus brand roles named by purpose (`placeholder`,
`decorative`, `inverse-primary`). Breakpoints follow the Framer build: phone `< 810px`, `md` tablet, `lg` desktop
`≥ 1200px`.

- Layout utilities: `container-site`, `grid-site` (4 / 8 / 12 columns), `section-space`, `sticky-intro`,
  `form-control`.
- Type roles: `type-display`, `type-heading-*`, `type-title-*`, `type-lead`, `type-body`, `type-eyebrow`… each
  steps at `md` and `lg` (`src/styles/typography.css`).
- Fonts: Mona Sans 400/500/600 through the Astro Fonts API (`fonts` in `astro.config.mjs`, files in
  `src/assets/fonts/`), the same Google Fonts files the Framer build used; 500 and 600 are preloaded.

## Motion

Reveal attributes (see `src/scripts/motion/reveals.ts`): `data-reveal`, `data-reveal="fade"`,
`data-reveal="scale"`, `data-reveal-words`, plus `data-reveal-delay|duration|y|scale`. Smooth scrolling (Lenis) is
an explicit opt-in through `siteConfig.smoothScroll`. Everything is off under `prefers-reduced-motion`.

## Testing

- **Unit (Vitest):** validation schemas, submission use case with fake gateways, webhook adapter against MSW
  (payload, idempotency key, token, confirmation contract, error status, timeout), rate limiters (in-memory with a
  fake clock, Upstash adapter with a fake store), shared `Result` guards and error normalization, HTTP handler
  (statuses, redirect, 429 + Retry-After, size and content-type limits, safe logging).
- **E2E (Playwright):** page structure, canonical/social metadata and `noindex`, skip link, desktop navigation,
  mobile menu with keyboard, FAQ, reveal on scroll, axe WCAG audit, and form journeys (validation, success only
  after server confirmation, server-side field errors linked to their messages, provider failure, rate limiting,
  newsletter, native submission without JavaScript, confirmation and not-found pages). Form requests are intercepted in the browser, so tests never
  reach a real provider.
- Large decorative index numerals are excluded from the axe contrast check (pure decoration, hidden from
  assistive technology).
