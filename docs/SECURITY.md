# Security, Privacy and Reliability — Astro

> A static site has a small attack surface: its server endpoints, its third-party scripts and its secrets. Protect
> those three. Shared rules are in [CONVENTIONS.md](./CONVENTIONS.md).

## 1. Secrets and environment

- Declare every variable in the `astro:env` schema; credentials use `context: 'server', access: 'secret'`.
- `PUBLIC_` variables are visible to everyone. Never put tokens, webhook URLs with secrets or API keys there.
- `.env.example` holds placeholders only. Real values live in Vercel, separate for Development, Preview and Production;
  previews use test providers, never production CRMs.
- Use least-privilege provider credentials and rotate them when people or vendors change.

## 2. Server endpoints

Every on-demand endpoint (`src/pages/api/*`) applies, in this order:

1. **Origin check** — keep Astro `security.checkOrigin` enabled (rejects cross-site form posts).
2. **Content type** — accept only the formats the endpoint expects (`415` otherwise).
3. **Rate limit** — **Upstash Ratelimit** (`@upstash/ratelimit` + Redis from the Vercel Marketplace), keyed by client
   address and endpoint; answer `429` with `Retry-After`. An in-memory limiter is acceptable only as a documented
   temporary fallback, because serverless instances do not share memory.
4. **Body size** — read the body with a hard limit (`413` above it).
5. **Validation** — Zod schema on every field; reject unknown shapes.
6. **Spam** — honeypot field on every public form; add **Cloudflare Turnstile** (verified server-side) when bots get
   through. Vercel Firewall rules are an additional edge layer, not a replacement.
7. **Provider call** — timeout, confirmed success, idempotency key where supported.
8. **Response** — shared `Result` shape / status codes; no stack traces or provider details.

## 3. Privacy and logging

- Collect only what the form needs. State purpose and retention in the privacy notice; collect consent where the
  jurisdiction requires it. Never fabricate consent.
- Never log names, e-mails, phones, message bodies, tokens or full request bodies. Log safe categories (provider
  status, error code) and correlation IDs.
- Analytics: no personal data in event properties; respect consent; load scripts after consent when required.

## 4. Third-party scripts and headers

- Every third-party script needs a reason and an owner; prefer server-side or partytown-style loading when possible.
- Security headers on every response (Vercel `headers` in `vercel.json` or the adapter config):
  `Strict-Transport-Security` (production domain), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a minimal `Permissions-Policy`, and a Content-Security-Policy
  that lists the allowed script, style, image, font and connect origins (Astro's CSP support when available).
- `frame-ancestors 'none'` (or the allowed embedders) through CSP.

## 5. Reliability

- Use timeouts and clear error paths for every provider call; show the visitor a fallback contact (e.g. phone).
- When losing a submission is unacceptable, persist it first (queue or provider with retries) and document it.
- Detect duplicates with idempotency keys or provider-side deduplication where business rules require it.

## 6. Release checklist

- [ ] No secrets in the repository, client bundle, HTML, URLs or logs.
- [ ] Endpoints enforce origin, content type, rate limit, body size, validation and spam checks.
- [ ] Provider success is confirmed before the visitor sees success.
- [ ] Security headers and CSP verified on the deployed preview.
- [ ] Privacy notice and consent match the data actually collected.

## References

- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- Astro security (`checkOrigin`): https://docs.astro.build/en/reference/configuration-reference/#security
- Upstash Ratelimit: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
