# Korum · Website

Site of Korum, the content and brand studio in Maringá, built with Astro on the company standard (`AGENTS.md` and
`docs/`).

## Getting started

```sh
bun install
bun run dev        # http://localhost:4321
bun run verify     # lint, format, typecheck, unit tests and build
bun run test:e2e   # Playwright (first run: bunx playwright install chromium)
```

## Where things live

- Copy, navigation and prices: `src/config/`
- Brand tokens: `src/styles/`
- Social image source: `~/Design/Korum/design/social-preview/`

Form leads go to Attio (CRM) and Brevo (newsletter): see `docs/integrations/leads.md` and `.env.example`.
