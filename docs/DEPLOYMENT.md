# Deployment, Environments and Releases — Astro

## 1. Hosting model

Static pages on the Vercel CDN; on-demand endpoints as Vercel Functions through `@astrojs/vercel` (only when the site
has them). Purely static sites deploy without an adapter. Do not add functions to a fully static project without a
reason.

## 2. Environments and variables

- Separate **Development**, **Preview** and **Production** values in Vercel. Previews use test providers and are
  `noindex`; protect previews with Vercel Deployment Protection when they show unreleased content.
- Variables are declared in the `astro:env` schema; secrets are server-only. `.env.example` lists every variable with
  placeholders.

```dotenv
# .env.example
SITE_URL=                 # canonical origin; optional on Vercel (production domain detected)
LEAD_WEBHOOK_URL=         # server secret, only if the site has forms
UPSTASH_REDIS_REST_URL=   # rate limiting
UPSTASH_REDIS_REST_TOKEN=
```

- `site` comes from `SITE_URL` or Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`); indexing depends on
  `VERCEL_ENV === 'production'`. Never guess production domains.

## 3. Pipeline

```text
Branch / pull request
  → bun install --frozen-lockfile
  → lint → format:check → typecheck → test → build → test:e2e (journeys touched)
  → Vercel Preview: responsive, accessibility, SEO and integration smoke checks (test providers)
  → merge to the release branch
  → Vercel Production → post-deploy verification and monitoring
```

- Bun installs and runs scripts; Node.js LTS (from `.nvmrc`) runs the build and functions.
- `astro preview` is unavailable with the Vercel adapter; use `vercel dev` or a Preview deployment to exercise
  functions.

## 4. Release checklist

- [ ] Canonical domain, `site`, sitemap and robots correct; previews not indexed.
- [ ] Environment variables set per environment; no secrets in `PUBLIC_` variables.
- [ ] Forms tested on Preview against test providers; production provider confirmed after release.
- [ ] Security headers, CSP, HTTPS and redirects verified.
- [ ] Core Web Vitals and JS budget within targets; error monitoring and logs reachable.
- [ ] Rollback path known (Vercel deployment history).

## 5. Operations

Monitor function errors, durations, rate-limit hits and provider failures. Configure regions deliberately when data
residency or latency matters; do not guess a universal region.

## References

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel Deployment Protection: https://vercel.com/docs/deployment-protection
- Astro Vercel adapter: https://docs.astro.build/en/guides/integrations-guide/vercel/
