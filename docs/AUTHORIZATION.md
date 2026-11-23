# Authorization — Astro

> Astro websites under this standard have **no user accounts**. This document exists so every standard has the same
> documentation set and so the boundary is explicit.

## 1. What this standard does not do

- No sign-in, sessions, user profiles, roles, organizations or per-user content.
- No database owned by the site.
- No "admin area" inside the website.

When a project needs any of these, it moves to the **Next.js standard** (backend + frontend together, Better Auth,
PostgreSQL) or to the **Vite standard** if an external API already owns identity (CONVENTIONS §1). Do not add an auth
library to an Astro site to work around this.

## 2. Access control that does exist

| Case | Rule |
| --- | --- |
| Form endpoints (`/api/*`) | Public by design. Protected by validation, size limits, rate limiting, honeypot/Turnstile and `checkOrigin` (see [Security](./SECURITY.md)). |
| Webhooks received by the site | Verify the provider signature on the raw body, reject stale or replayed events, process idempotently. |
| CMS draft previews | Server-side preview token validated in an on-demand route; responses are `noindex` and never cached publicly. |
| Preview deployments | Vercel Deployment Protection when they show unreleased content; always `noindex`. |
| Internal tools (dashboards, editors) | Use the provider's own UI (CMS, spreadsheet, analytics) or build them with the Next.js standard. |

## 3. Secrets

Tokens that grant access to providers live only in server-side environment variables declared in the `astro:env`
schema with `access: 'secret'`. They never appear in `PUBLIC_` variables, client scripts, HTML, URLs or logs.

## 4. Tests

Cover endpoint behavior for missing or invalid tokens and signatures (Vitest), and verify preview routes are not
indexed (Playwright). User authorization matrices belong to the Next.js and Vite standards.
