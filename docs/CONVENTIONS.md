# Cross-Stack Engineering Conventions

> **This file is identical in the Astro, Next.js, Vite, Expo and NestJS standards.** It holds every rule the five
> stacks share, so projects built on different stacks still look, build, test and ship the same way. Stack-specific
> detail lives in the other documents of each standard. When this file changes, update all five copies together.

## 1. Choosing a standard

| Standard | Use for | Do not use for | Move to another standard when |
| --- | --- | --- | --- |
| **Astro** | Landing pages, institutional websites, campaigns, portfolios, content sites. Static-first, no user accounts, few integrations (forms, CMS, analytics). | Anything with sign-in, user data, dashboards or a database. | It needs authentication, a database, per-user content or more than a few server integrations → **Next.js**. |
| **Next.js** | Products whose backend and frontend live together: MVPs that may scale, customer portals, backoffices, public pages + app in one codebase. | Pure content sites (use Astro) or frontends for an API owned by another team (use Vite / Expo) or standalone APIs (use NestJS). | The backend becomes a standalone API (several clients, partners, heavy jobs) → **NestJS** for the API, **Vite** for the web frontend, **Expo** for mobile. |
| **Vite** | Large web single-page applications consuming an external API (often with OpenAPI). The backend lives in another repository (company APIs follow NestJS). | Public SEO-driven pages (use Astro), features that need secrets/server code in this repo (use Next.js), native mobile apps (use Expo). | It must own server code, secrets or SSR → **Next.js**; public marketing pages → separate **Astro** site. |
| **Expo** | Native mobile apps (iOS/Android) consuming an external API — the mobile counterpart of Vite. The backend lives in another repository (company APIs follow NestJS). | Web-first products (use Vite / Next.js), marketing sites (use Astro), apps that must own server code or secrets. | It needs its own backend → a separate **NestJS** API (or Next.js Route Handlers when the product already runs on Next.js) consumed by the app. |
| **NestJS** | Backend APIs consumed by other applications: the API behind Vite and Expo apps, partner and public APIs, internal services, complex domains with jobs and integrations, backends that outgrew Next.js. | User interfaces (use the other standards); small products whose web app and backend can live together (start on Next.js). | A module needs independent scaling or ownership → extract it as another **NestJS** service along its feature boundary. |

A product may combine standards (e.g. Astro marketing site + Vite web app + Expo mobile app + NestJS API). Each
repository — or each app inside a monorepo — follows exactly one standard. Deviations are explained in the
pull request that introduces them.

### Products with more than one app

When one product ships several apps against the same API (e.g. a Next.js or Vite web app, an Expo app and often the
NestJS API itself), keep them in one **Bun workspaces monorepo** (Turborepo when task caching pays off) instead of
copying code between repositories:

```text
apps/api/                 # NestJS standard (when the product owns its API)
apps/web/                 # Next.js or Vite standard
apps/mobile/              # Expo standard
packages/api-client/      # Hey API SDK and types generated from the API's exported contract (no Axios instance)
packages/domain/          # Pure types, rules and Zod schemas (no React, framework or platform APIs)
packages/design-tokens/   # One token source that generates each app's tokens.css
packages/config/          # ESLint, Prettier and TypeScript presets
```

Share contracts, pure rules, schemas, tokens and tooling. Apps never import the API's source code: they depend on its
exported OpenAPI contract through `packages/api-client`, so the API and the apps deploy independently. Keep Screens, view models, UI primitives and Axios instances
per app: rendering, navigation, storage and auth transport differ between web and native. Token values use a color
format every target parses (hex or HSL are safe; verify `oklch` support before using it on React Native). When a
Next.js app is the backend of an Expo app, the mobile app consumes its versioned Route Handlers (`app/api/v1/`)
through an OpenAPI contract, like any external API.

## 2. Shared baseline

All five standards use: **TypeScript `strict`**, **Zod** for runtime validation, **Bun** as package manager,
**Node.js LTS** as runtime, **ESLint + Prettier**, **Axios** for HTTP, the shared **`Result` / `AppErrorCode`**
types, **Vitest** wherever it can run and **English** for code. The UI standards (Astro, Next.js, Vite, Expo) also
share **Tailwind** styling, **React** function components (Next.js, Vite, Expo, Astro islands) and sections 9–11.
Versions are pinned per project in `package.json` and `bun.lock`, never here.

Platform differences, applied consistently:

| Concern | Web stacks (Astro, Next.js, Vite) | Expo | NestJS |
| --- | --- | --- | --- |
| Styling | Tailwind CSS 4 | NativeWind, with the Tailwind major it supports (v4 → Tailwind 3; NativeWind v5 → Tailwind 4) | — |
| Unit / component tests | Vitest | Jest with the `jest-expo` preset (Vitest cannot run React Native components reliably) | Vitest with `unplugin-swc` (decorator metadata) |
| Integration tests | PostgreSQL test database (Next.js) | — | Testcontainers (PostgreSQL, Redis) |
| E2E tests | Playwright + `@axe-core/playwright` | Maestro | API tests through Fastify `inject` |
| Hosting / delivery | Vercel | EAS Build, EAS Submit, EAS Update | Docker image on a container platform |
| Animation | CSS first; GSAP | React Native Reanimated | — |

## 3. Library matrix

`Default` = part of every project of that stack. `When needed` = the only approved choice once the need exists.
`—` = not used in that stack.

| Concern | Astro | Next.js | Vite | Expo | NestJS |
| --- | --- | --- | --- | --- | --- |
| UI components | `.astro` components; shadcn/ui in React islands (when needed) | shadcn/ui | shadcn/ui | React Native Reusables (shadcn/ui for React Native) | — |
| Icons | Lucide (SVGs as Astro SVG components) | `lucide-react` | `lucide-react` | `lucide-react-native` | — |
| Toasts | — | Sonner (when needed) | Sonner (when needed) | `sonner-native` (when needed) | — |
| Forms | Native HTML forms + progressive enhancement | Server Actions; React Hook Form + Zod for complex forms | React Hook Form + Zod | React Hook Form + Zod (`Controller`) | — |
| Runtime validation | Zod (`astro/zod`) | Zod | Zod | Zod | Zod via `nestjs-zod` (DTOs, pipe, serializer) |
| HTTP server framework | Astro | Next.js | — | — | NestJS + Fastify adapter |
| Routing | File-based `src/pages` | App Router | TanStack Router | Expo Router | Controllers with URI versioning (`/v1`) |
| URL / route state | `URLSearchParams` + Zod in scripts; nuqs (React adapter) in islands (when needed) | nuqs + Zod-backed parsers | TanStack Router `validateSearch` + Zod (no nuqs) | Expo Router params parsed with Zod (no nuqs) | Path and query DTOs in Zod |
| Remote state | — (server-rendered) | Server Components; TanStack Query for interactive fetching | TanStack Query | TanStack Query | — |
| Shared client state | Zustand vanilla store across islands (when needed) | Zustand (when needed) | Zustand (when needed) | Zustand (when needed) | — |
| Request context | — | — | — | — | `nestjs-cls` (actor, request ID, transaction) |
| HTTP (client side) | Axios in islands; `submit-form.ts` helper for form enhancement (§12) | Axios browser instance | Axios browser instance | Axios app instance | — |
| HTTP (server side) | Axios server instances (when the site has integrations) | Axios server instances | — | — | Axios provider instances |
| OpenAPI | Hey API + `@hey-api/client-axios` (when needed) | Hey API + `@hey-api/client-axios` | Hey API + `@hey-api/client-axios` | Hey API + `@hey-api/client-axios` | Publishes the contract (`@nestjs/swagger`); Hey API to consume providers (when needed) |
| Database / ORM | — | PostgreSQL + Drizzle | — (API-owned) | — (API-owned) | PostgreSQL + Drizzle (`pg` driver) |
| Authentication | — (move to Next.js) | Better Auth | External API / IdP (PKCE when OIDC) | External API / IdP (`expo-auth-session` + PKCE when OIDC) | Better Auth (Organization, Bearer, Expo, API Key plugins when needed) |
| Authorization | — | RBAC + resource policies | UX only (API-owned) | UX only (API-owned) | RBAC + resource policies (guards + domain policies) |
| Secure storage | — | HttpOnly cookies (Better Auth) | HttpOnly cookies / in-memory tokens | `expo-secure-store` | Issues HttpOnly cookies, bearer tokens and hashed API keys |
| Local persistence | — | — | Browser storage for allowlisted preferences only | AsyncStorage for allowlisted non-sensitive data | — |
| Server-side cache | — | Next.js cache APIs | — | — | Redis (`ioredis`, when needed) |
| Jobs and queues | — | Background-job service (when needed) | — | — | BullMQ (`@nestjs/bullmq`) + Redis, transactional outbox |
| File storage | — | Object storage (when needed) | — (API-owned) | — (API-owned; presigned uploads) | S3-compatible (`@aws-sdk/client-s3`, presigned URLs) |
| Lists / tables | — | TanStack Table (when needed) | TanStack Table (when needed) | FlashList (when lists are large) | — |
| Charts | — | Recharts (when needed) | Recharts (when needed) | `react-native-gifted-charts` (when needed) | — |
| Dates | `Intl` | `Intl`; `date-fns` for arithmetic | `Intl`; `date-fns` for arithmetic | `Intl`; `date-fns` for arithmetic | UTC everywhere; `date-fns` for arithmetic |
| Animation | CSS first; GSAP (+ ScrollTrigger, SplitText) | CSS first; GSAP with `@gsap/react` (when needed) | CSS first; GSAP with `@gsap/react` (when needed) | Reanimated (+ Gesture Handler) | — |
| Smooth scrolling | Lenis (opt-in, §11) | Lenis on public marketing routes only (opt-in) | — | — (native scrolling) | — |
| Rate limiting | Upstash Ratelimit on form endpoints | Upstash Ratelimit on sensitive endpoints | — (API-owned) | — (API-owned) | `@nestjs/throttler` with Redis storage |
| Bot protection | Honeypot; Cloudflare Turnstile (when needed) | Honeypot on public forms; Turnstile (when needed) | Turnstile widget only if the API requires it | App attestation only if the API requires it | Turnstile verification on abuse-prone public flows (when needed) |
| Logs | Vercel logs | Structured logs (Vercel) | — | — | Pino (`nestjs-pino`) |
| Tracing / metrics | — | Per project | — | — | OpenTelemetry (`@opentelemetry/sdk-node`) |
| Error monitoring | Sentry (`@sentry/astro`, when needed) | Sentry (`@sentry/nextjs`, when needed) | Sentry (`@sentry/react`, when needed) | Sentry (`@sentry/react-native`) | OpenTelemetry + logs; Sentry (`@sentry/nestjs`, when needed) |
| Health checks | — | — | — | — | `@nestjs/terminus` |
| HTTP mocking in tests | MSW (when needed) | MSW (when needed) | MSW | MSW (`msw/node` in Jest) | MSW (`msw/node`) for providers |
| Component tests | — (Playwright for pages) | React Testing Library | React Testing Library | React Native Testing Library | — (API tests with Fastify `inject`) |
| Containers in tests | — | — | — | — | Testcontainers |
| Internationalization | Decided per project | Decided per project | Decided per project | Decided per project (`expo-localization` for device locale) | Stable error codes; copy lives in clients |

Do not add a second library for a concern listed here (no Fetch-based client next to Axios, no Framer Motion next to
GSAP or Reanimated, no Redux next to Zustand, no second icon set, no Prisma or TypeORM next to Drizzle, no second queue library next to
BullMQ, no Express-only middleware on the Fastify adapter) unless the listed library cannot meet a concrete need.

## 4. Package manager and runtime

- **Bun** installs dependencies and runs scripts: `bun install`, `bun run <script>`, `bunx <tool>`. Commit `bun.lock`;
  CI uses `bun install --frozen-lockfile`. Declare `"packageManager": "bun@<version>"` in `package.json`. Expo
  projects add native modules with `bunx expo install <package>` so versions match the SDK.
- **Node.js LTS** runs dev servers, builds, Vercel Functions, Expo tooling and NestJS processes. Pin it with `.nvmrc` and `engines.node`.
- Tests run through `bun run test` (Vitest on web stacks and NestJS, Jest on Expo). Never use `bun test` (Bun's own runner).
- Vercel and EAS detect `bun.lock` and install with Bun; keep their Node.js versions aligned with `.nvmrc`. NestJS
  images install with Bun in the build stage and run on the Node.js LTS image of the same major as `.nvmrc`.

## 5. Scripts

Every project exposes the same script names, so commands and CI are identical across stacks.

| Script | Astro | Next.js | Vite | Expo | NestJS |
| --- | --- | --- | --- | --- | --- |
| `dev` | `astro dev` | `next dev` | `vite` | `expo start` | `nest start --watch` (`dev:worker`: `--entryFile worker`) |
| `build` | `astro build` | `next build` | `vite build` | `expo export` (JS bundle check; native builds run on EAS) | `nest build` (SWC builder) |
| `start` / `preview` | — (use `vercel dev`) | `start`: `next start` | `preview`: `vite preview` | `ios` / `android`: `expo run:<platform>` | `start` / `start:worker`: `node --require ./dist/instrumentation.js dist/<main or worker>.js` |
| `lint` | `eslint .` | `eslint .` | `eslint .` | `expo lint` | `eslint .` |
| `format` | `prettier --write .` | same | same | same | same |
| `format:check` | `prettier --check .` | same | same | same | same |
| `typecheck` | `astro check` | `tsc --noEmit` | `tsc -b` (or `tsc --noEmit`) | `tsc --noEmit` | `tsc --noEmit` |
| `test` | `vitest run` | `vitest run` | `vitest run` | `jest` | `vitest run --project unit` |
| `test:watch` | `vitest` | `vitest` | `vitest` | `jest --watch` | `vitest --project unit` |
| `test:coverage` | `vitest run --coverage` | `vitest run --coverage` | `vitest run --coverage` | `jest --coverage` | `vitest run --project unit --coverage` |
| `test:integration` | — | database tests, when they exist | — | — | `vitest run --project integration` |
| `test:e2e` | `playwright test` | `playwright test` | `playwright test` | `maestro test tests/e2e` | `vitest run --project e2e` |
| `verify` | lint → format:check → typecheck → test → build | same | same | same | same |

Stack extras use the same prefixes everywhere: `api:generate` (generate an SDK from an OpenAPI contract), `api:export`
(NestJS: write `contracts/api.openapi.json`), `db:generate` / `db:migrate` (Drizzle; NestJS production applies
migrations with `node dist/migrate.js`). `test` never includes integration or E2E suites (they need databases,
browsers, devices or containers). Only run scripts that exist in the project's `package.json`.

## 6. Linting, formatting and editor settings

- **ESLint flat config** (`eslint.config.js`) with `typescript-eslint`, `eslint-config-prettier` and the stack plugins:
  `eslint-plugin-astro` (Astro); `@next/eslint-plugin-next` (Next.js); `eslint-config-expo` (Expo);
  `eslint-plugin-react-hooks` (all React code); `eslint-plugin-jsx-a11y` (React on the web);
  `@tanstack/eslint-plugin-query` and `@tanstack/eslint-plugin-router` where those libraries are used.
- **Prettier** (`prettier.config.mjs`): `printWidth: 120`, `singleQuote: true`, `semi: true`,
  `trailingComma: 'all'`; plugins `prettier-plugin-astro` (Astro) and `prettier-plugin-tailwindcss` (always last;
  also formats NativeWind `className`).
- **Import boundaries** (section 8) are lint errors from the first commit: `no-restricted-imports` patterns by default,
  `eslint-plugin-boundaries` once many features or several teams share the codebase (NestJS: from the first commit,
  one element type per layer).
- `.editorconfig`: UTF-8, LF, 2-space indentation, final newline.
- Formatting is never argued in review: `format:check` runs in CI.

## 7. Naming

| Item | Convention | Examples |
| --- | --- | --- |
| Files, directories, identifiers, tests, config | **English** | — |
| Components and screens (`.tsx`, `.astro`) | `PascalCase` | `SiteHeader.astro`, `LeadForm.tsx`, `FlightListScreen.tsx` |
| Every other module (utils, hooks, view models, stores, schemas, adapters, use cases, API clients) | `kebab-case` | `format-phone.ts`, `use-sidebar.ts`, `use-flight-list-view-model.ts`, `sidebar-store.ts`, `create-flight.ts` |
| View models | `use-<screen>-view-model.ts` (client hook); `get-<screen>-view-model.ts` (Next.js server function) | `use-member-list-view-model.ts`, `get-member-list-view-model.ts` |
| NestJS building blocks | `kebab-case` name + Nest role suffix | `projects.controller.ts`, `projects.module.ts`, `auth.guard.ts`, `problem-details.filter.ts`, `send-invitation.processor.ts` |
| Classes | `PascalCase`; use cases named by action, implementations prefixed by technology | `ArchiveProject`, `DrizzleProjectRepository`, `S3FileStorage` |
| Hooks / stores exports | `useX` / `useXStore` | `export function useSidebar()`, `export const useSidebarStore` |
| Directories and URL segments | `kebab-case` | `features/visit-requests/`, `/privacy-policy` |
| Functions, variables | `camelCase` | `submitLead` |
| Types, interfaces and contracts | `PascalCase`, no `I` prefix | `Lead`, `LeadGateway`, `FlightRepository` |
| True constants, environment variables | `UPPER_SNAKE_CASE` | `MAX_BODY_BYTES`, `API_BASE_URL` |
| Database tables and columns | `snake_case` (Drizzle `casing: 'snake_case'`) | `projects.organization_id` |
| HTTP API paths and JSON fields | Plural `kebab-case` paths; `camelCase` fields | `/v1/organizations/{organizationId}/projects`, `createdAt` |
| Unit / component / integration tests | `<module>.test.ts(x)` | `lead-schema.test.ts`, `FlightListScreen.test.tsx` |
| E2E tests | `<journey>.spec.ts` (Playwright, NestJS API tests) / `<journey>.yaml` (Maestro) | `contact-form.spec.ts`, `sign-in.yaml` |
| Standard documents | `UPPER_SNAKE_CASE.md` | `ARCHITECTURE.md`, `DESIGN_SYSTEM.md` |
| Other documents | `kebab-case.md` | `docs/integrations/payment-provider.md` |

Framework-required names stay as the framework defines them (`index.astro`, `page.tsx`, `route.ts`, `__root.tsx`,
`_layout.tsx`, `+not-found.tsx`, `main.tsx`, `main.ts`, `astro.config.mjs`, `app.config.ts`, `eas.json`,
`nest-cli.json`, `drizzle.config.ts`, `Dockerfile`, `compose.yaml`, `AGENTS.md`,
`CLAUDE.md`, `README.md`). Generated files are never renamed or edited.

### Comments

Code must read on its own: clear names, small functions and precise types do the explaining. Write a comment or a
doc comment (summary) **only where it is truly necessary** — a non-obvious reason or constraint, a workaround for a
library or platform quirk, a security or privacy decision, or an external contract the code cannot express. Never
restate what the code does, describe props or parameters whose names and types already say it, add decorative
section dividers or reference documents for decoration. If code seems to need a comment to explain *what* it does,
simplify the code instead.

## 8. Imports and source layout

- Path alias **`@/*` → `src/*`** in every project (Expo: `tsconfig.json` paths, resolved by Metro). Use it for imports
  across folders; relative imports only inside the same feature or component folder.
- When one feature consumes another, it imports only from that feature's `index.ts` public API.
- Shared folder vocabulary (create a folder only when it has content):

| Folder | Holds | Astro | Next.js | Vite | Expo | NestJS |
| --- | --- | --- | --- | --- | --- | --- |
| `src/components/ui/` | Generic, brand-neutral primitives | ✓ | ✓ | ✓ | ✓ | — |
| `src/components/layout/` | Shells, header, footer, navigation | ✓ | ✓ | ✓ | ✓ | — |
| `src/components/sections/` | Marketing page sections | ✓ | public pages | — | — | — |
| `src/features/<feature>/screens/` | Screens and their view models (MVVM, below) | — | ✓ | ✓ | ✓ | — |
| `src/features/<feature>/components/` | Feature UI | ✓ | ✓ | ✓ | ✓ | — |
| `src/features/<feature>/schemas/` | Zod schemas for untrusted input, forms and params | ✓ | ✓ | ✓ | ✓ | in `http/` |
| `src/features/<feature>/hooks/` | React hooks | islands | ✓ | ✓ | ✓ | — |
| `src/features/<feature>/stores/` | Zustand stores | islands | ✓ | ✓ | ✓ | — |
| `src/features/<feature>/api/` | Client-side API adapters and query definitions | — | ✓ | ✓ | ✓ | — |
| `src/features/<feature>/actions/` | Server Actions | — | ✓ | — | — | — |
| `src/features/<feature>/application/` | Use cases and orchestration | ✓ | ✓ | when needed | when needed | ✓ |
| `src/features/<feature>/domain/` | Types, pure rules, policies, contracts | ✓ | ✓ | ✓ | ✓ | ✓ |
| `src/features/<feature>/data/` | Persistence and repositories (database or local storage) | — | ✓ | when needed | ✓ | in `infrastructure/` |
| `src/features/<feature>/integrations/` | Server-side adapters to third-party providers | ✓ | ✓ | — | — | in `infrastructure/` |
| `src/features/<feature>/infrastructure/` | Implementations of domain/application contracts: database, cache, queues, storage, providers | — | — | — | — | ✓ |
| `src/features/<feature>/http/` | Request parsing and response mapping shared by endpoints | ✓ | ✓ | — | — | ✓ (controllers, schemas, presenters) |
| `src/features/<feature>/jobs/` | Queue processors and job schedulers | — | — | — | — | when needed |
| `src/features/<feature>/<feature>.module.ts` | Nest module: the feature's composition root | — | — | — | — | ✓ |
| `src/features/<feature>/index.ts` | Public API of the feature (explicit named exports) | ✓ | ✓ (+ `server.ts`) | ✓ | ✓ | ✓ (+ module `exports`) |
| `src/lib/` | Technical infrastructure: env, HTTP clients, query client, device services, utilities | ✓ | ✓ | ✓ | ✓ | — (`src/shared/`) |
| `src/shared/` | Cross-cutting kernel organized in the same four layers as features | — | — | — | — | ✓ |
| `src/config/` | Project identity, navigation, content descriptors, feature flags; NestJS: env schema and typed config | ✓ | ✓ | ✓ | ✓ | ✓ |
| `src/styles/` | `globals.css`, `tokens.css`, `typography.css` | ✓ | ✓ | ✓ | ✓ | — |
| `src/server/` | Server-only cross-cutting code (auth, db, authorization, audit, http, integrations) | `http/`, `integrations/` | ✓ | — | — | — (`src/shared/`) |
| `contracts/` | OpenAPI snapshot | when consuming | when consuming | ✓ | ✓ | ✓ (exported) |
| `drizzle/` | Reviewed SQL migrations | — | ✓ | — | — | ✓ |
| `tests/` | Integration, E2E, fakes, fixtures and setup (section 15) | ✓ | ✓ | ✓ | ✓ | ✓ |

### Feature anatomy and MVVM (Next.js, Vite, Expo)

The application standards share one feature anatomy and split every screen into **Model – View – ViewModel**, so a
feature reads the same on the web and on mobile. Astro keeps plain pages and components: static pages and small
islands gain nothing from view models.

```text
src/features/<feature>/
├── screens/<screen>/
│   ├── <Screen>Screen.tsx            # View: renders the view model, no data access
│   ├── use-<screen>-view-model.ts    # ViewModel (client): params/URL, forms, queries, commands, screen state
│   └── get-<screen>-view-model.ts    # ViewModel (Next.js server): authorized reads → serializable props
├── components/                       # Presentational feature UI: props in, events out
├── api/                              # Client adapters, query keys and query options
├── actions/                          # Next.js Server Actions (commands)
├── schemas/                          # Zod: forms, params / search params, risky payloads
├── domain/                           # Types, pure rules, policies, contracts
├── application/                      # Use cases, when orchestration exists
├── data/                             # Repositories: database (Next.js) or local persistence (Vite, Expo)
├── stores/                           # Zustand, only for shared client state
├── hooks/                            # Reusable feature hooks shared by several view models
├── index.ts                          # Public API (client-safe on Next.js)
└── server.ts                         # Next.js only: server-only public API (`import 'server-only'`)
```

| Role | Next.js | Vite | Expo |
| --- | --- | --- | --- |
| Route (thin) | `page.tsx` awaits `get-*-view-model` and renders the Screen | `createFileRoute`: search schema, guards, loader, `component: XScreen` | Route file renders the Screen |
| View | `XScreen.tsx`, Server Component by default | `XScreen.tsx` | `XScreen.tsx` |
| ViewModel | `get-*-view-model.ts` (server) + `use-*-view-model.ts` for interactive screens or parts | `use-*-view-model.ts` | `use-*-view-model.ts` |
| Model | `actions/`, `application/`, `domain/`, `data/`, `src/server/` | `api/`, `domain/`, `application/`, `data/`, `stores/` | Same as Vite + device services in `src/lib/` |

- **One view model per screen.** It returns an explicit exported type (`MemberListViewModel`) with data and commands,
  never JSX. Screens and feature components read only from the view model or from props: no HTTP, database, storage,
  Query hooks or router calls inside them.
- **Explicit screen states.** Client view models expose `ScreenState<T>` from `src/lib/screen-state.ts` (plus a
  `toScreenState(query, isEmpty)` helper where TanStack Query is installed) instead of a bag of booleans. Next.js
  server view models leave loading and failures to `loading.tsx`, `error.tsx` and `not-found.tsx`.

  ```ts
  export type ScreenState<T> =
    | { status: 'loading' }
    | { status: 'empty' }
    | { status: 'error'; error: AppError }
    | { status: 'ready'; data: T };
  ```

- **No business rules in view models.** They call domain functions, use cases or Server Actions and map results for
  the UI; rules stay testable without React.
- **Compose instead of growing.** A large screen splits work into hooks (`use-member-filters.ts`) called by its view
  model. A self-contained widget reused across screens may own a colocated view model
  (`components/revenue-chart/RevenueChart.tsx` + `use-revenue-chart-view-model.ts`); on Next.js a section streamed
  separately is an async Server Component with its own `get-*-view-model.ts`, wrapped in `<Suspense>` by the Screen.
- **Static screens need no view model.** Do not create empty view models for screens without data or state.
- `Screen` is the suffix on every stack: it avoids clashing with the Next.js `page.tsx` route file and matches mobile
  vocabulary.

### Backend feature anatomy (NestJS)

The backend standard splits every feature into four layers with an inward dependency rule; the entry layer is named
after its transport (`http/`, plus `jobs/` for queue consumers). Details and examples are in the NestJS standard's
`ARCHITECTURE.md`.

```text
src/features/<feature>/
├── domain/               # Types, invariants, policies, repository contracts — no framework or I/O
├── application/          # Use cases (one per file), ports, transactions, policy enforcement
├── infrastructure/       # Drizzle repositories, read models, cache, queues, storage, provider adapters
├── http/                 # Controllers, Zod request/response schemas, presenters
├── jobs/                 # BullMQ processors and schedulers (when needed)
├── <feature>.module.ts   # Composition root: binds contracts to implementations
└── index.ts              # Public API
```

### Import boundaries

Linted from the first commit (section 6):

- A feature imports another feature only through its `index.ts` (or `server.ts` on Next.js) — never deep paths.
- `components/ui/`, `components/layout/` and `lib/` never import from `features/`.
- `domain/` imports no React, framework, HTTP, database or storage modules.
- Generated API code (`lib/api/generated/`) is imported only by `lib/api/` and feature `api/` adapters.
- Screens and components never import `lib/api/`, `src/server/`, `data/` or storage modules.
- Public APIs use explicit named exports (no `export *`). On Next.js, `index.ts` exports only client-safe modules;
  server-only code is exported from `server.ts`, which starts with `import 'server-only'`.
- NestJS layers: `domain/` imports only domain code; `application/` imports `domain/`; `infrastructure/` implements
  `domain/` and `application/` contracts; `http/` and `jobs/` import `application/` and domain types, never
  `infrastructure/`; only `<feature>.module.ts` wires implementations; `src/shared/` never imports features.

## 9. Design tokens

All stacks use the **shadcn/ui semantic vocabulary**, so components and themes are portable between projects:

`background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`,
`primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`,
`accent-foreground`, `destructive`, `border`, `input`, `ring`, `radius`, plus `chart-1…5` and `sidebar-*` when used.
Add `success`, `warning`, `info` (with `-foreground`) only when the product needs them. Brand-specific roles are
allowed when no semantic role fits; name them by purpose (e.g. `highlight`), never by color, and document them.

- `src/styles/tokens.css` defines raw values as unprefixed CSS variables (`--background`) in `:root` (and `.dark`
  when dark mode exists). Web stacks map them with `@theme inline` (`--color-background: var(--background)`);
  Expo maps the same variables in `tailwind.config.js` for NativeWind (`background: 'hsl(var(--background))'`).
- `src/styles/globals.css` imports Tailwind, the tokens and the base layer (Expo imports it in the root
  `_layout.tsx`). `src/styles/typography.css` holds type presets as `@utility type-<role>` on web stacks; Expo
  defines the same roles as Tailwind theme extensions or small `Text` variants.
- Breakpoints, container width and spacing come from the Tailwind theme; custom values are added to the theme,
  never repeated as arbitrary values across components.
- Components reference semantic tokens only — no hex values or brand names inside shared components.

## 10. UI building blocks

- **shadcn/ui** (web) and **React Native Reusables** (Expo) components are copied into `src/components/ui/` and
  owned by the project.
- **Lucide** is the only icon set (`lucide-react`, `lucide-react-native`, SVGs in Astro). Brand marks and custom
  icons live as SVG files in `src/assets/` (Astro) or `src/assets/icons/` (React stacks). Decorative icons are hidden
  from assistive technology; icon-only buttons have an accessible name/label.
- **Same component vocabulary on web and native.** shadcn/ui and React Native Reusables share names and APIs: keep the
  same component names, variants and sizes (`Button` `variant`: default, secondary, outline, ghost, destructive, link;
  `size`: default, sm, lg, icon), the same `cn()` helper in `src/lib/utils.ts`, the same type roles and the same token
  names, so a design decision means the same thing in every app.
- **Sonner** / **sonner-native** for toasts; **TanStack Table** (web) or **FlashList** (Expo) for large data sets;
  **Recharts** (web) or **react-native-gifted-charts** (Expo) for charts.
- Fonts are self-hosted: local `woff2` or Fontsource (Astro, Vite), `next/font` (Next.js), `expo-font` with bundled
  files (Expo). Load only used weights.

## 11. Motion

- Web: CSS transitions first; **GSAP** is the only JavaScript animation library (ScrollTrigger, SplitText;
  `@gsap/react` and `useGSAP` in React). Expo: **React Native Reanimated** (with Gesture Handler), animations on the
  UI thread. Animate transform and opacity.
- **Lenis** is the only smooth-scrolling library. It is opt-in per project through a config flag, allowed
  on marketing surfaces (Astro sites, Next.js public routes), never in application shells, backoffice or native apps.
- Reduced-motion preferences (`prefers-reduced-motion`, the OS "Reduce Motion" setting via Reanimated) disable
  non-essential motion. Content must stay readable without animation (and, on the web, without JavaScript).
- Motion code counts towards the JavaScript budget (section 16).

## 12. HTTP and integrations

**Axios is the HTTP client of every stack, on every side** (browser, app and server): one mental model, one way to
configure interceptors, one error normalization.

- **Client → API** (Vite, Next.js Client Components, Astro islands, Expo): one central Axios instance per API origin
  in `src/lib/api/axios.ts` (base URL, timeout, credentials/token policy, interceptors registered once). Components
  and screens never create clients or call `fetch` directly.
- **Server → third party** (Next.js server code, Astro endpoints and integrations, NestJS provider adapters): Axios
  instances built by one shared factory in `src/server/http/create-http-client.ts` (NestJS:
  `src/shared/infrastructure/http/create-http-client.ts`) (timeout, error normalization into `AppError`, safe logging, no
  default retries) — one instance per provider origin in `src/server/integrations/<provider>/client.ts` or
  `src/features/<f>/integrations/`. Server HTTP modules are never imported by client code (Next.js:
  `import 'server-only'`; Astro: only endpoints, frontmatter and integrations import them). Client and server
  instances are never shared.
- **Next.js caching:** Axios requests do not take part in the Next.js `fetch` data cache. Provider responses are
  dynamic by default; when caching is needed, cache explicitly with the Next.js cache APIs of the installed version
  (`'use cache'` / `unstable_cache`) using keys scoped by identity and tenant — never by switching to `fetch`.
- **Exception — Astro form enhancement:** scripts that post a form to the site's own endpoint use the single
  `fetch`-based helper `src/lib/submit-form.ts`, so a landing page does not ship an HTTP library for one request.
  The exception holds only while the page ships no Axios: when an island on the same page already loads the Axios
  browser instance, that page's forms post through it too (the cost is already paid; never ship both). Either way
  the result is the shared `Result`. Any other browser request in Astro (islands consuming an API) uses the Axios
  browser instance.
- **OpenAPI:** the NestJS standard **publishes** contracts — Zod schemas in code, document generated with
  `@nestjs/swagger` + `nestjs-zod`, exported to `contracts/api.openapi.json` with stable `operationId`s and checked for
  drift and breaking changes in CI. Consumers generate with **Hey API** from a reviewed snapshot in `contracts/`,
  always with the `@hey-api/client-axios` transport configured with the right instance (app/browser instance in Vite
  and Expo, server instance in Next.js, Astro and NestJS). Never edit generated output.
- Every adapter confirms success explicitly, normalizes errors, keeps secrets and payloads out of logs and never
  retries non-idempotent requests automatically; send idempotency keys when the provider supports them.

## 13. Errors and results

One error vocabulary across stacks:

| `AppErrorCode` | HTTP | Meaning |
| --- | --- | --- |
| `validation` | 400 / 422 | Input rejected; may carry `fieldErrors` |
| `unauthenticated` | 401 | No valid session |
| `forbidden` | 403 | Authenticated but not allowed |
| `not-found` | 404 | Missing, or hidden to avoid disclosure |
| `conflict` | 409 | State or version conflict |
| `rate-limited` | 429 | Too many requests; may carry `retryAfterSeconds` |
| `unavailable` | 503 | Dependency or configuration missing |
| `timeout` / `network` | — | Client-side transport failures (including offline devices) |
| `unexpected` | 500 | Anything else (never expose internals) |

Operations that report outcomes to UI code (Server Actions, Astro JSON endpoints, Vite and Expo API adapters) use:

```ts
export type AppError = {
  code: AppErrorCode;
  message?: string; // safe, user-facing
  fieldErrors?: Record<string, string[]>;
  retryAfterSeconds?: number;
};

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: AppError };
```

The type lives in `src/lib/result.ts` (NestJS: `src/shared/domain/result.ts`). Error codes are stable identifiers;
display copy comes from the project's content/config, in the product language.

**Public HTTP APIs** (NestJS; Next.js `app/api/v1/`) answer errors as RFC 9457 Problem Details
(`application/problem+json`) carrying `code`, plus `fieldErrors`, `retryAfterSeconds` and `requestId` when relevant;
client adapters (`src/lib/api/errors.ts`) read `code` and normalize everything into `AppError`. NestJS domain and
application code throw `AppException` (code, safe message, details) and one exception filter renders the response.

## 14. Environment variables

- Validate at startup with a schema: `astro:env` (Astro), Zod in `src/lib/env.ts` (Next.js server and client files
  separated; Vite over `import.meta.env`; Expo over `process.env.EXPO_PUBLIC_*`) and Zod in `src/config/env.ts`
  (NestJS, parsed once at boot; the process exits on invalid configuration).
- Public prefixes are framework-defined and **always public**: `PUBLIC_` (Astro), `NEXT_PUBLIC_` (Next.js), `VITE_`
  (Vite), `EXPO_PUBLIC_` (Expo — everything in the app binary is extractable). Secrets never use them; a mobile app
  never holds secrets at all. Every NestJS variable is server-side.
- `.env.example` lists every variable with placeholders only. Real values live in Vercel (web), EAS environment
  variables (Expo) or the container platform's secret manager (NestJS), per environment.

## 15. Tests layout

```text
src/**/<module>.test.ts(x)   unit and component tests, next to the code
tests/integration/           integration tests (endpoints, database, MSW; Testcontainers on NestJS)
tests/e2e/                   Playwright specs, NestJS API specs (<journey>.spec.ts) or Maestro flows (<journey>.yaml)
tests/fakes/                 in-memory implementations of contracts (NestJS)
tests/fixtures/              factories and synthetic data
tests/setup/                 test runner setup, containers, MSW server and handlers, render and app helpers
```

Coverage is always installed (`@vitest/coverage-v8` on web and NestJS, Jest's built-in coverage on Expo); thresholds are
risk-based, never a global 100%. Accessibility is checked automatically on every key page or screen
(`@axe-core/playwright` on web; Testing Library role/label queries and Maestro assertions on Expo) plus manual
screen-reader review. No production data, credentials or real providers in tests.

View models are tested directly, next to the Screen: client view models with `renderHook` and the providers they need
(fresh `QueryClient`, router or nuqs testing adapter, MSW); Next.js server view models as plain async functions
against the test database or faked use cases, asserting allowlisted output and denied contexts.

## 16. Quality targets

- **Web Core Web Vitals (p75):** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- **Mobile (starting targets):** cold start to first interactive screen ≤ 2.5 s on a mid-range Android device;
  smooth 60 fps scrolling and animations; crash-free sessions ≥ 99.5 %; ANR rate below the Google Play bad-behavior
  threshold.
- **APIs (NestJS, starting targets):** p95 server latency ≤ 200 ms for simple reads and ≤ 500 ms for writes at
  expected load; 5xx rate < 0.1 %; availability ≥ 99.9 % monthly; queued jobs start within 60 s (p95).
- **Accessibility:** WCAG 2.2 AA on the web; platform accessibility (VoiceOver, TalkBack, font scaling, 44/48 pt touch
  targets) on mobile.
- **Starting JavaScript budgets (gzip)** — adjust per project: Astro page ≤ 60 kB; Next.js public route
  ≤ 150 kB first load; Next.js / Vite application route ≤ 250 kB initial. Expo tracks bundle size per release.
- Analytics events use the same names everywhere: `page_view` (web) / `screen_view` and `app_open` (Expo),
  `cta_click`, `form_start`, `generate_lead` (only after confirmed submission), `contact_click`, `sign_up`, `login`.
  Never send personal data as event properties.

## 17. Git and delivery

- Code, comments, commit messages, PR descriptions and documentation are written in **English**. User-facing copy
  follows the product language.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`…), optional scope
  (`feat(leads): …`). Branches: `<type>/<short-kebab-description>`.
- CI gates on every PR, in order: `lint` → `format:check` → `typecheck` → `test` → `build`; `test:e2e` on PRs that
  touch user journeys and before releases. NestJS also runs `test:integration`, `test:e2e`, the contract drift and
  breaking-change checks and an image scan on every PR. Dependabot keeps dependencies and GitHub Actions updated.
- Credentials never enter git: `.env*` (except `.env.example`), signing keys, keystores, provisioning profiles,
  `credentials.json`, `credentials/` and service-account files are ignored; Expo signing credentials are managed by
  EAS.
- Every PR states what changed, which checks ran and any remaining risk (the Definition of Done in `AGENTS.md`).
- **AI agents** never commit, push or open pull requests without a direct request from the user, and never add
  themselves as author or co-author of a commit (no `Co-Authored-By` trailers) or attribute themselves in commit
  messages or PR descriptions.

## 18. Documentation set

Every repository has `AGENTS.md` and an identical `CLAUDE.md`, plus `docs/` with: `CONVENTIONS.md` (this file),
`ARCHITECTURE.md`, `STATE_AND_ROUTING.md`, `API_INTEGRATION.md`, `AUTHORIZATION.md`, `SECURITY.md`,
`DESIGN_SYSTEM.md`, `SEO_AND_PERFORMANCE.md`, `TESTING.md` and `DEPLOYMENT.md`. Project-specific
documentation (brand, content, integrations) is added next to them. For NestJS, `DESIGN_SYSTEM.md` is the API design
guide, `STATE_AND_ROUTING.md` covers modules, routes, transactions and where state lives, and `SEO_AND_PERFORMANCE.md`
covers discoverability, performance, scaling and observability — file names stay the same so every repository has
the same map.
