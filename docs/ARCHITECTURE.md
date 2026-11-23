# Architecture — Astro Websites and Landing Pages

> **Scope:** landing pages, institutional websites, campaign pages, portfolios and content sites. Static-first, no
> user accounts, few integrations. Shared rules for all stacks are in [CONVENTIONS.md](./CONVENTIONS.md).
>
> **Related:** [State and routing](./STATE_AND_ROUTING.md) · [API integration](./API_INTEGRATION.md) ·
> [Authorization](./AUTHORIZATION.md) · [Security](./SECURITY.md) · [Design system](./DESIGN_SYSTEM.md) ·
> [SEO and performance](./SEO_AND_PERFORMANCE.md) · [Testing](./TESTING.md) · [Deployment](./DEPLOYMENT.md)

## 1. Goals and decision order

1. Fast, accessible, search-friendly websites with strong conversion experiences.
2. Clear, maintainable code that evolves without unnecessary layers.
3. Consistent delivery practices across independent client and internal projects.
4. Reusable *engineering patterns* without forcing the same visual style on every site.
5. Safe, testable form processing and external integrations when required.
6. Predictable builds, preview workflows and deployment to Vercel.

Decision order: **correctness and security** (including privacy and accessibility) → **simplicity** (KISS, YAGNI) →
**separation of concerns** at boundaries that matter → **explicit trade-offs** → **measured quality**.

Do not read this standard as a requirement to build a full enterprise Clean Architecture for a single-page site.

## 2. Stack

| Concern | Standard |
| --- | --- |
| Framework | Astro — `.astro` components, static rendering first |
| Language | TypeScript `strict` |
| Styling | Tailwind CSS 4 with tokens in `src/styles/` |
| Interactivity | Small scripts in components; React islands only for meaningful shared state |
| Validation | Zod via `astro/zod` |
| HTTP | Axios — server instances for integrations, browser instance for API-consuming islands |
| URL state | `URLSearchParams` + Zod in scripts; nuqs (React adapter) in React islands when needed |
| Server execution | `@astrojs/vercel` adapter, only for routes with `prerender = false` |
| Motion | CSS first; GSAP (ScrollTrigger, SplitText); Lenis opt-in |
| Tests | Vitest; Playwright + `@axe-core/playwright` |
| Hosting | Vercel |

The complete library matrix (icons, monitoring, rate limiting, bot protection…) is in [CONVENTIONS.md §3](./CONVENTIONS.md).
Astro is for content-oriented websites. If the product becomes a stateful application, an authenticated portal or a
dashboard, move to the Next.js or Vite standard instead of stretching Astro (CONVENTIONS §1).

## 3. Rendering model and deployment boundary

- Prerender public pages as HTML. Ship no client JavaScript unless a behavior requires it.
- Hydrate isolated islands only when native browser capabilities and small scripts are insufficient.
- Use on-demand server execution only for form submissions, secure API calls or genuinely dynamic paths.
- Keep secrets and external authorization entirely server-side.

```text
Browser
  ├── GET /                    → prebuilt HTML/CSS/assets from the CDN
  ├── GET /services/           → prebuilt HTML/CSS/assets from the CDN
  └── POST /api/<resource>     → Vercel Function
                                   ├── content type, size and rate limits
                                   ├── Zod validation and spam checks
                                   ├── use case (only if meaningful rules exist)
                                   └── provider adapter (confirmed success)
```

```js
// astro.config.mjs (illustrative — match the installed Astro and adapter versions)
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(), // only when the site has on-demand endpoints
  security: { checkOrigin: true },
});
```

```ts
// src/pages/api/leads.ts
export const prerender = false;
```

Do not switch every page to on-demand rendering because one endpoint exists. Purely static sites deploy to Vercel
without an adapter.

## 4. Project structure

The tree is a **menu of conventions**: create a directory only when there is a responsibility to place in it. Folder
names follow the shared vocabulary in [CONVENTIONS.md §8](./CONVENTIONS.md).

```text
website-project/
├── AGENTS.md / CLAUDE.md
├── README.md
├── docs/                         # standard documents
├── public/                       # favicon, social preview, self-hosted fonts
├── src/
│   ├── assets/                   # images, brand SVGs, icons (optimized by Astro)
│   ├── components/
│   │   ├── ui/                   # Button, TextField, Tag… (brand-neutral)
│   │   ├── layout/               # SiteHeader, SiteFooter, navigation
│   │   └── sections/             # page sections fed by props from src/config
│   ├── config/                   # site identity, navigation, page content, routes
│   ├── content/                  # content collections (when used)
│   ├── features/
│   │   └── leads/                # only when a feature has meaningful logic
│   │       ├── components/       # LeadForm.astro, enhancement script
│   │       ├── schemas/          # Zod input schemas
│   │       ├── application/      # use cases
│   │       ├── domain/           # types and contracts (LeadGateway)
│   │       ├── integrations/     # provider adapters (Axios server instances)
│   │       └── http/             # request parsing / response mapping for endpoints
│   ├── layouts/                  # BaseLayout (metadata, fonts, skip link)
│   ├── lib/                      # result.ts, submit-form.ts, api/axios.ts (islands), api/errors.ts, utilities
│   ├── server/http/              # create-http-client.ts — Axios factory, server-only imports
│   ├── pages/                    # routes and HTTP endpoints (api/)
│   ├── scripts/                  # client enhancements (motion, analytics)
│   └── styles/                   # globals.css, tokens.css, typography.css
├── tests/                        # integration/, e2e/, fixtures/, setup/
├── astro.config.mjs
├── package.json / bun.lock
└── tsconfig.json                 # strict, "@/*" → "src/*"
```

### Responsibility rules

| Location | Owns | Must not own |
| --- | --- | --- |
| `pages/` | Routing, request/response wiring, page composition | Provider protocol details, business rules |
| `components/ui/` | Accessible, brand-neutral primitives | Client branding, copy, secrets, orchestration |
| `components/sections/` | Page-specific presentation fed by props | API calls with secrets, reusable domain services |
| `config/` | Identity, navigation, copy, media references | Secrets, logic |
| `features/<name>/application/` | Use cases and orchestration | HTTP responses, vendor HTTP details |
| `features/<name>/domain/` | Types, contracts, pure rules | Network calls, framework imports |
| `features/<name>/integrations/` | Provider adapters | Markup, presentation state |
| `features/<name>/schemas/` | Input validation | Vendor SDK calls |
| `features/<name>/http/` | Body limits, parsing, status mapping | Business decisions |

**Small-site exception:** a page with a simple, non-sensitive interaction does not need `features/`, contracts or use
cases. Resist creating layers only because this document shows them.

## 5. Engineering principles

### 5.1 Clean Code (required)

- Name things for their purpose; avoid `Manager`, `Helper`, `Utils` when a specific name exists.
- Keep functions and modules cohesive, with one reason to change.
- Prefer guard clauses, readable branches, pure transformations and explicit error cases.
- Prefer composition and plain functions; classes only for genuinely stateful behavior.
- Avoid duplication, but do not abstract on the first repeated line.
- TypeScript strict; no `any`, non-null assertions or casts that hide uncertainty without a documented reason.
- Keep side effects and integration details at boundaries. Never swallow errors silently.
- Comment reasoning and constraints, not what the code already says. Keep dependencies small and explicit.

### 5.2 Practical SOLID

| Principle | Application | Avoid |
| --- | --- | --- |
| **S** | Endpoint parses/responds; use case applies rules; adapter talks to the provider | One endpoint mixing validation, credentials, mapping and markup |
| **O** | Add an adapter or variant when an extension point has proven value | Plugin systems before a second scenario exists |
| **L** | Implementations honor their contract and observable behavior | Subtype hierarchies for ordinary components |
| **I** | Small provider contracts (`submit(lead)`) | God interfaces every implementation must stub |
| **D** | Use cases depend on a purposeful contract, not the vendor client | Interfaces for every local function |

### 5.3 Choosing the abstraction level

| Scenario | Design |
| --- | --- |
| Static landing page, no forms | Pages, layouts, UI primitives, tokens |
| One simple form | Endpoint + schema + one focused provider adapter |
| Several forms sharing rules | Feature module with a testable use case |
| Several providers, retries, enrichment | Domain contract + injected adapters + use case + integration tests |
| Accounts, dashboards, user data | Not Astro — use the Next.js standard |

### 5.4 Object Calisthenics as heuristics

Keep nesting shallow, prefer early returns, wrap primitives only when real invariants exist, avoid long coupled call
chains, use full English names, keep modules cohesive. Never degrade readability to satisfy a slogan; explain the
concrete improvement a rule brings.

```ts
// Guard clauses: explicit exits, no needless nesting (not production e-mail validation — use a schema).
export function normalizedEmail(value: string | null): string | null {
  if (!value) return null;
  const email = value.trim().toLowerCase();
  if (!email.includes('@')) return null;
  return email;
}
```

## 6. Evolution

Review this standard when changing major framework versions, adding a server runtime or adopting a shared design-system package; do not
silently propagate breaking changes into existing projects.

## 7. Official references

- Astro on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- Astro endpoints: https://docs.astro.build/en/guides/endpoints/
- Astro Vercel adapter: https://docs.astro.build/en/guides/integrations-guide/vercel/
- Astro images: https://docs.astro.build/en/guides/images/
- Astro environment variables (`astro:env`): https://docs.astro.build/en/guides/environment-variables/
