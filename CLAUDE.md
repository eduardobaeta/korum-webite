# Engineering Instructions — Websites and Landing Pages (Astro)

## 1. Scope and stack
- This repository follows the company standard for **landing pages, institutional websites, campaigns and portfolios**: static-first, no user accounts, few integrations. Projects that need sign-in, a database or many integrations belong to the Next.js standard; web frontends for an external API belong to the Vite standard and native mobile apps to the Expo standard (`docs/CONVENTIONS.md` §1).
- Stack: **Astro, TypeScript (strict), Tailwind CSS 4, Zod, Vercel, Bun**; GSAP and Lenis only when the motion direction calls for them. The full library matrix is in `docs/CONVENTIONS.md` §3.
- This is a generic standard. Never assume a client, brand, domain, locale, analytics service, form provider or CRM. Inspect the actual repository, configuration and installed versions before changing anything; official documentation overrides illustrative snippets.

## 2. Documentation map
| Read | Before |
| --- | --- |
| `docs/CONVENTIONS.md` | Any change (shared rules for all stacks: naming, scripts, tooling, tokens, errors, git) |
| `docs/ARCHITECTURE.md` | Structural decisions, new folders, rendering mode |
| `docs/STATE_AND_ROUTING.md` | Routes, URL parameters, React islands and shared client state |
| `docs/API_INTEGRATION.md` | Forms, server endpoints, CMS, analytics or any third-party integration |
| `docs/AUTHORIZATION.md` | Anything that looks like login, gated content, previews or protected endpoints |
| `docs/SECURITY.md` | Forms, secrets, headers, privacy and abuse protection |
| `docs/DESIGN_SYSTEM.md` | Tokens, components, typography, motion and accessibility |
| `docs/SEO_AND_PERFORMANCE.md` | Metadata, indexing, media, fonts, scripts and budgets |
| `docs/TESTING.md` | Adding or changing behavior |
| `docs/DEPLOYMENT.md` | Environments, Vercel configuration and releases |

## 3. Naming and conventions
- **All files, directories, routes, tests, configuration and identifiers are in English.** Display copy follows the project language.
- `PascalCase` components (`HeroSection.astro`); `kebab-case` for every other module, directory and URL segment; `camelCase` functions and variables; `PascalCase` types; `UPPER_SNAKE_CASE` constants and environment variables. Details in `docs/CONVENTIONS.md` §7.
- Import across folders with `@/*`; use the shared folder vocabulary (`docs/CONVENTIONS.md` §8). Keep `AGENTS.md` and `CLAUDE.md` identical.

## 4. Architecture and data flow
- **Static by default:** prerender pages; on-demand rendering only for endpoints that need it (`export const prerender = false` + `@astrojs/vercel`).
- Prefer `.astro` components, semantic HTML, CSS and small progressive enhancements. Add a React island only for meaningful interactive state.
- `src/pages/` is the routing and HTTP boundary; business rules and provider mapping live in `src/features/<feature>/`. Primitives in `src/components/ui/`, shells in `src/components/layout/`, page sections in `src/components/sections/`.
- Project identity, navigation and copy live in `src/config/`; shared components never hard-code a brand. Tokens live in `src/styles/`.
- Use the smallest architecture that keeps the boundaries that matter; do not scaffold layers a static page does not need.

## 5. State and data
- Content is rendered on the server or at build time; there is no client-side data store by default.
- URL parameters are parsed with Zod in small scripts, or with **nuqs** (React adapter) when a React island owns URL state; islands keep local state; state shared across islands uses a Zustand vanilla store. No TanStack Query unless an island genuinely fetches remote data (`docs/STATE_AND_ROUTING.md`).
- Structured local content uses Astro content collections; external CMS content is fetched at build time through an adapter.

## 6. Integrations and HTTP
- Form submissions post to a server endpoint (`POST /api/<resource>`) that validates with Zod, limits size and rate, and forwards to a provider adapter. Success is shown only after the provider confirms.
- **Axios is the HTTP client**, as in the other stacks: server integrations use instances from `src/server/http/create-http-client.ts` (imported only by endpoints, frontmatter and integrations), islands that consume an API use the browser instance in `src/lib/api/axios.ts`. The only exception is form enhancement, which posts through the single `src/lib/submit-form.ts` helper to keep pages light — and only on pages that ship no Axios; where an island already loads it, forms use the Axios instance too (`docs/CONVENTIONS.md` §12). Endpoints answer with the shared `Result` shape (`docs/CONVENTIONS.md` §13).
- No provider is built into the standard; each project chooses its own.

## 7. Security and access
- Sites have **no user accounts**. Anything requiring authentication moves to the Next.js standard (`docs/AUTHORIZATION.md`).
- Secrets live only in server-side environment variables validated by `astro:env`; never in `PUBLIC_` variables, client scripts or logs.
- Validate on the server, rate-limit public endpoints (Upstash Ratelimit), use a honeypot on public forms, keep `checkOrigin` on, set security headers, and never log personal data.

## 8. Design system and UX
- Semantic tokens in the shadcn vocabulary (`docs/CONVENTIONS.md` §9); no brand values inside shared components and no arbitrary values repeated across components.
- Responsive and mobile-first; accessible labels, keyboard support, visible focus, contrast, landmarks and headings.
- CSS transitions first; GSAP for choreography; Lenis smooth scrolling only as an explicit opt-in. Respect `prefers-reduced-motion` and never hide content that depends on JavaScript.

## 9. Engineering principles
- Required: single responsibility, descriptive names, small cohesive modules, guard clauses, explicit error handling, strict typing (no unjustified `any` or casts), no dead code, no unnecessary duplication.
- Apply interface segregation and dependency inversion only where an abstraction has a concrete purpose (e.g. isolating a provider). Object Calisthenics are readability heuristics, not rules that add classes or files.
- KISS and YAGNI first; explain important trade-offs.
- **Comments only where truly necessary:** the code must be simple enough to read without explanation; comments and doc summaries are reserved for non-obvious reasons, constraints, workarounds and external contracts, never for what the code already says (`docs/CONVENTIONS.md` §7).

## 10. Testing
- **Vitest** for schemas, use cases, adapters and endpoint handlers; **Playwright + axe** for pages, forms and navigation; MSW only when HTTP-level mocking helps.
- Do not fabricate unit tests for static content; verify the rendered page, keyboard behavior and responsiveness instead. Never call real providers in tests (`docs/TESTING.md`).

## 11. Agent workflow
1. Read `AGENTS.md`, `docs/CONVENTIONS.md` and the documents mapped to the area you will touch; inspect the real code, configuration and installed versions.
2. Classify the change: content, presentation, form/integration, SEO/performance or configuration.
3. Implement the smallest coherent change in the proper module, following the folder vocabulary and naming rules.
4. Add or update tests proportionate to risk; justify any omission.
5. Run `bun run verify` (or `lint`, `format:check`, `typecheck`, `test`, `build`) and `bun run test:e2e` when journeys changed. Never report an unrun check as passing.
6. Report files changed, checks executed, security impact and remaining risks; explain any deviation from the standard.

**Git:** never commit, push or open a pull request unless the user directly asks for it. When asked to commit, the commit belongs to the user: never add the agent as author or co-author (no `Co-Authored-By` trailers) and never add agent attribution to commit messages or PR descriptions.

## 12. Review priorities
- Leaked secrets or wrong rendering mode; missing server validation, rate limit or provider confirmation; unhandled failure states.
- Inaccessible components, poor responsive behavior, content hidden behind JavaScript or motion.
- Heavy media, fonts or scripts over budget; incorrect canonical, metadata or indexing.
- Overengineered architecture; brand values in shared components; names or folders off-convention.

## 13. Definition of Done
- [ ] Acceptance criteria met; changes stay within the requested scope.
- [ ] `docs/CONVENTIONS.md` followed: English names, folder vocabulary, scripts, tokens and error codes.
- [ ] Architecture boundaries respected; clean, cohesive, strictly typed code without dead code.
- [ ] Relevant tests added or updated and passing, or a justified exception recorded.
- [ ] Accessibility, responsive behavior and performance budgets checked where applicable.
- [ ] Security, privacy and input validation verified where applicable; no secrets in client code or logs.
- [ ] `lint`, `format:check`, `typecheck`, `test` and `build` pass (`test:e2e` when journeys changed); unrun checks disclosed.
- [ ] Documentation updated when behavior, architecture or dependencies changed.
- [ ] Ready for review or deployment under the project workflow.
- [ ] **Astro:** pages stay prerendered; metadata, canonical, sitemap, robots and indexing rules verified.

This package documents a standard; it is not an executable Astro starter until a project configures its own scripts, content, branding and environments.
