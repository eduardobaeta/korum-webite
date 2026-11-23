# API Integration, Forms and Providers — Astro

> Shared HTTP, error and result rules are in [CONVENTIONS.md §12–14](./CONVENTIONS.md). This document applies them to
> static sites with a few server endpoints.

## 1. Integration-neutral architecture

Forms are optional. A destination can be a CRM, spreadsheet webhook, e-mail service, internal API or queue — **no
provider is built into the standard**; each project chooses its own.

```text
HTML form (static page, works without JavaScript)
  → POST /api/<resource>                 src/pages/api/  (prerender = false)
    → limits: content type, body size, rate limit   features/<f>/http/
    → Zod schema + honeypot                         features/<f>/schemas/
      → use case (only if meaningful rules exist)   features/<f>/application/
        → gateway contract (when justified)         features/<f>/domain/
          → provider adapter (Axios server instance) features/<f>/integrations/
```

The simplest site calls one validated adapter without a gateway interface. The layered version below is the
**scalable option**, not a minimum.

## 2. HTTP rules

- **Server → provider:** **Axios**, as in every stack. Instances come from the shared factory
  `src/server/http/create-http-client.ts` (timeout, error normalization into `AppError`, safe logging, no default
  retries); one instance per provider origin. Adapters confirm success explicitly (status **and** body when the
  provider returns 200 on errors) and never log payloads. Server HTTP modules are imported only by endpoints,
  frontmatter and integrations — never by client scripts or islands.
- **Browser → API:** an island that consumes an API uses one central Axios instance in `src/lib/api/axios.ts`.
- **Browser → own form endpoint:** progressive-enhancement scripts use the single `fetch`-based helper
  `src/lib/submit-form.ts` (the documented exception in CONVENTIONS §12, to keep pages within the JS budget). If an
  island on the same page already loads the Axios browser instance, the page's forms post through it instead — never
  ship both. Both paths return the shared `Result`. No other `fetch` calls in client code.
- Never retry non-idempotent requests automatically; send an idempotency key when the provider supports it.

## 3. Contract, schema and adapter (illustrative)

```ts
// src/features/leads/domain/lead.ts
export interface Lead {
  name: string;
  email: string;
}

// src/features/leads/domain/lead-gateway.ts
import type { Lead } from './lead';

export interface LeadGateway {
  /** Resolves only after the provider confirmed the lead. */
  submit(lead: Lead): Promise<void>;
}
```

```ts
// src/features/leads/schemas/lead-schema.ts
import { z } from 'astro/zod';

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
});
```

```ts
// src/server/http/create-http-client.ts — shared by every server integration
import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { toAppError } from '@/lib/api/errors';

export function createHttpClient(config: CreateAxiosDefaults): AxiosInstance {
  const client = axios.create({ timeout: 8_000, ...config });
  client.interceptors.response.use(undefined, (error: unknown) => Promise.reject(toAppError(error)));
  return client;
}
```

```ts
// src/features/leads/integrations/http-lead-gateway.ts
import { createHttpClient } from '@/server/http/create-http-client';
import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

export function createHttpLeadGateway(endpoint: string, token: string): LeadGateway {
  const client = createHttpClient({ baseURL: endpoint, headers: { authorization: `Bearer ${token}` } });
  return {
    async submit(lead: Lead): Promise<void> {
      await client.post('', lead); // non-2xx rejects with a normalized AppError
    },
  };
}
```

This adapter is generic. Real providers differ in authentication, payload, idempotency and response contracts —
write the adapter for the actual provider and never assume a CRM accepts this shape.

## 4. Endpoint

```ts
// src/pages/api/leads.ts
import type { APIRoute } from 'astro';
import { LEAD_API_ENDPOINT, LEAD_API_TOKEN } from 'astro:env/server';
import { createHttpLeadGateway } from '@/features/leads/integrations/http-lead-gateway';
import { leadSchema } from '@/features/leads/schemas/lead-schema';
import type { Result } from '@/lib/result';
import { z } from 'astro/zod';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    return new Response('Unsupported content type', { status: 415 });
  }
  // Enforce a body size limit and the rate limit before parsing (see SECURITY.md).
  const parsed = leadSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) {
    const body: Result = { ok: false, error: { code: 'validation', fieldErrors: z.flattenError(parsed.error).fieldErrors } };
    return Response.json(body, { status: 422 });
  }

  if (!LEAD_API_ENDPOINT || !LEAD_API_TOKEN) return new Response('Service unavailable', { status: 503 });

  try {
    await createHttpLeadGateway(LEAD_API_ENDPOINT, LEAD_API_TOKEN).submit(parsed.data);
  } catch {
    // Log a safe diagnostic (status/category), never the submitted fields.
    return new Response('Submission failed', { status: 502 });
  }
  return new Response(null, { status: 303, headers: { location: '/thank-you/' } });
};
```

- Answer **JSON with the shared `Result` shape** when the client sends `Accept: application/json` (enhanced form),
  and a **303 redirect** (success) or plain status (failure) for native submissions.
- Map outcomes to the shared codes: `validation` 422/400, `rate-limited` 429 + `Retry-After`, `unavailable` 503,
  `unexpected` 502/500.
- Not shown above but required in production: body size limit, rate limit, honeypot, safe logging. Prefer a 303 after
  success so a refresh does not repost.

## 5. Form markup and progressive enhancement

```astro
<form method="POST" action="/api/leads" data-lead-form>
  <label for="lead-name">Name</label>
  <input id="lead-name" name="name" autocomplete="name" required />
  <label for="lead-email">Email</label>
  <input id="lead-email" name="email" type="email" autocomplete="email" required />
  <div hidden aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off" /></div>
  <button type="submit">Submit</button>
  <p role="status" data-form-status></p>
</form>
```

The enhancement script (in `features/<f>/components/`) submits with `Accept: application/json`, disables the button
while sending, marks fields from `fieldErrors` with `aria-invalid`, and shows success **only** after `{ ok: true }`.
Copy for every state comes from `src/config`, in the product language.

## 6. Other integrations

| Integration | Rule |
| --- | --- |
| CMS | Fetch at build time through an adapter in `src/lib/` or a feature; drafts only through a protected preview route. |
| Analytics | One provider per project; events from CONVENTIONS §16; consent where required; no personal data. |
| Maps, video, embeds | Lazy-load, use privacy-friendly embed modes, reserve space to avoid layout shift. |
| Webhooks received | Verify signature on the raw body, reject replays, process idempotently. |

## 7. Environment configuration

Declare every variable in the `astro:env` schema (`context: 'server', access: 'secret'` for credentials).
`.env.example` contains placeholders only; real values live in Vercel per environment (see [Deployment](./DEPLOYMENT.md)).

## 8. OpenAPI

When a provider publishes a trustworthy OpenAPI spec, generate the SDK with **Hey API** and the
`@hey-api/client-axios` transport, configured with the provider's server instance (`client.setConfig({ axios })`).
Keep the reviewed snapshot in `contracts/`; never edit generated output.

## 9. Astro Actions

Astro Actions are a valid alternative for typed mutations. Choose one pattern per feature (endpoint or Action), not
both without a reason, and keep the same validation, limits and `Result` shape.
