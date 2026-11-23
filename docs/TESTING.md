# Testing — Astro

> Test behavior that can break: validation, use cases, adapters, endpoints and visitor journeys. Layout, scripts and
> test tools are shared with the other stacks ([CONVENTIONS.md §5 and §15](./CONVENTIONS.md)).

## 1. Policy

- Add or update automated tests for nontrivial behavior and reproducible regressions.
- For static content or purely visual changes, do **not** fabricate unit tests; check the rendered page, keyboard
  behavior and responsiveness, and say so in the change summary.
- Test observable behavior, not private functions, CSS classes or large snapshots.
- Tests are deterministic and isolated; no real credentials, production providers, billable APIs or personal data.
- Mock at the right boundary: inject fakes into use cases; intercept HTTP in browser tests. Never mock the behavior
  under test.

## 2. Stack

| Layer | Tool | Status |
| --- | --- | --- |
| Unit / application / adapter / endpoint | **Vitest** (`getViteConfig` from `astro/config`) | Default when testable logic exists |
| Browser / E2E | **Playwright Test** | Default for pages, navigation and forms |
| Accessibility | **`@axe-core/playwright`** | Default on key pages |
| HTTP mocking | **MSW** | When network-level mocking helps; fakes are often enough |
| Coverage | **`@vitest/coverage-v8`** | Installed; risk-based thresholds |
| Islands | React Testing Library | Only when React islands have logic |

## 3. What to test

| Responsibility | Minimum |
| --- | --- |
| Zod schemas | Valid, invalid and boundary input |
| Use cases | Success and failure paths with fake gateways |
| Provider adapters | Request mapping, confirmation, error status, timeout (MSW `msw/node` intercepting the real Axios requests; do not mock Axios itself) |
| Endpoints | Status codes (`415`, `413`, `422`, `429`, `503`, `502`, `303`), `Result` bodies, safe logging |
| Rate limiter / stores / URL schemas / nuqs parsers | State transitions with a fake clock; parser defaults and invalid input |
| Pages | Smoke: one `h1`, metadata, canonical, `noindex` rules, skip link |
| Navigation and menus | Keyboard interaction, focus return, anchors |
| Forms | Required fields, success only after confirmation, server field errors, failure, without JavaScript |
| Motion | One test with motion enabled; the rest with `reducedMotion: 'reduce'` |

## 4. Layout and naming

```text
src/features/leads/schemas/lead-schema.test.ts
src/features/leads/integrations/http-lead-gateway.test.ts
tests/integration/leads-endpoint.test.ts
tests/e2e/homepage.spec.ts
tests/e2e/lead-form.spec.ts
tests/fixtures/  tests/setup/
```

Descriptive English names (`rejects an invalid email`), Arrange–Act–Assert, small fixtures.

## 5. Playwright configuration notes

- `webServer` runs `astro dev --port <port> --ignore-lock` (Astro allows one dev server per project; the flag keeps
  the test server in the foreground) with an env flag that disables the dev toolbar, whose markup pollutes locators
  and axe results. `astro preview` is not available with the Vercel adapter.
- Set a fixed `SITE_URL` for tests so canonical and social metadata can be asserted.
- Run desktop and phone projects; intercept form endpoints with `page.route` so no lead reaches a real provider.
- Exclude only documented decorative elements from axe (e.g. `[data-decorative]`), with the reason in the test.

## 6. Verification order

`lint` → `format:check` → `typecheck` → `test` → `build` → `test:e2e` → Vercel Preview check when endpoints or
providers changed. Report skipped or unavailable checks explicitly.

## References

- Astro testing: https://docs.astro.build/en/guides/testing/
- Vitest: https://vitest.dev/guide/
- Playwright: https://playwright.dev/docs/intro
- Playwright accessibility: https://playwright.dev/docs/accessibility-testing
