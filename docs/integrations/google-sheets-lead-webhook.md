# Google Sheets lead webhook

Connects both site forms to a spreadsheet through a Google Apps Script web app
(`google-sheets-lead-webhook.gs`). The site talks to it through
`src/features/leads/integrations/webhook-lead-gateway.ts`.

## Contract

- **Request:** `POST` with a JSON body `{ type, submittedAt, idempotencyKey, ...lead fields }`, where `type` is
  `visit-request` or `newsletter-subscription` and `idempotencyKey` is a SHA-256 of the validated content.
- **Response:** `{ "ok": true }` only when the row was stored. Apps Script answers HTTP 200 even on errors, so the
  site treats anything else as a failure and never shows success without that confirmation.
- **Authentication:** a shared secret in the URL query string (`?secret=…`), because Apps Script web apps cannot read
  request headers. The URL is a server-only secret (`LEAD_WEBHOOK_URL`).

## Setup (about 10 minutes, Google account that owns the spreadsheet)

1. Create a spreadsheet (e.g. “Korum · Leads do site”). The script creates the **Visitas** and **Newsletter**
   tabs with headers on the first submission.
2. **Extensions → Apps Script.** Replace the editor content with `google-sheets-lead-webhook.gs` and save.
3. **Project Settings → Script properties → Add property:** `WEBHOOK_SECRET` = a long random value
   (e.g. the output of `openssl rand -hex 24`).
4. **Deploy → New deployment → Web app:**
   - Execute as: **Me**
   - Who has access: **Anyone** (required for the site's server to reach it; the secret protects it)

   Authorize the requested permissions and copy the web app URL (`https://script.google.com/macros/s/…/exec`).

5. In Vercel → Project → Settings → Environment Variables, add for **Production** (and Preview, ideally pointing to
   a separate test spreadsheet):

   ```dotenv
   LEAD_WEBHOOK_URL=https://script.google.com/macros/s/<deployment-id>/exec?secret=<WEBHOOK_SECRET>
   ```

   `LEAD_WEBHOOK_TOKEN` is not used with Apps Script (it cannot read request headers). Redeploy the site.

6. Send one visit request and one newsletter sign-up from the deployed site and check the rows.

## Behavior

- Answers `{ "ok": true }` when the row is stored; the site shows success only after that.
- Wrong or missing secret, malformed payload or storage errors answer `{ "ok": false, … }`; the site shows the
  error message with the WhatsApp fallback.
- The same submission (same `idempotencyKey`) within 10 minutes is stored once.
- Phones are stored as `(44) 90000-0000` plus a clickable `wa.me` link; interest and period use the Portuguese
  labels shown on the site.

## Maintenance

- Changing the script requires **Deploy → Manage deployments → Edit → New version**; the URL stays the same.
- Rotating the secret: update the script property and `LEAD_WEBHOOK_URL` together.
- If the form options change in `src/features/leads/domain/lead.ts`, update `INTEREST_LABELS` / `PERIOD_LABELS`
  in the script.
