/**
 * Korum — lead webhook for Google Sheets (Google Apps Script web app).
 *
 * Receives the JSON posted by the site's /api/visit-requests and
 * /api/newsletter-subscriptions routes (contract: docs/decisions/0002-lead-submissions.md)
 * and appends one row per lead. Setup: docs/integrations/google-sheets-lead-webhook.md.
 *
 * Responses are always HTTP 200 (Apps Script cannot set status codes), so the
 * site only treats { "ok": true } as a confirmed submission.
 */

const DUPLICATE_WINDOW_SECONDS = 600;
const LOCK_TIMEOUT_MS = 10000;

const INTEREST_LABELS = {
  undecided: 'Ainda não sei',
  'pilot-episode': 'Episódio Piloto',
  'studio-day': 'Dia Korum',
  'authority-plan': 'Plano Autoridade',
  'brand-design': 'Design de marca',
};

const PERIOD_LABELS = { morning: 'Manhã', afternoon: 'Tarde' };

const SHEETS = {
  'visit-request': {
    name: 'Visitas',
    headers: ['Recebido em', 'Nome', 'Empresa', 'WhatsApp', 'Link do WhatsApp', 'E-mail', 'Interesse', 'Período', 'Mensagem'],
    toRow: (lead) => [
      new Date(lead.submittedAt),
      lead.name,
      lead.company,
      formatPhone(lead.whatsapp),
      whatsappLink(lead.whatsapp),
      lead.email || '',
      INTEREST_LABELS[lead.interest] || lead.interest,
      PERIOD_LABELS[lead.period] || lead.period,
      lead.message || '',
    ],
  },
  'newsletter-subscription': {
    name: 'Newsletter',
    headers: ['Recebido em', 'E-mail'],
    toRow: (lead) => [new Date(lead.submittedAt), lead.email],
  },
};

function doPost(event) {
  const secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!secret || event.parameter.secret !== secret) return reply({ ok: false, error: 'unauthorized' });

  const lead = parseLead(event);
  const sheetConfig = lead && SHEETS[lead.type];
  if (!sheetConfig) return reply({ ok: false, error: 'invalid-payload' });

  const lock = LockService.getScriptLock();
  lock.waitLock(LOCK_TIMEOUT_MS);
  try {
    const cache = CacheService.getScriptCache();
    if (lead.idempotencyKey && cache.get(lead.idempotencyKey)) return reply({ ok: true, duplicate: true });

    sheetFor(sheetConfig).appendRow(sheetConfig.toRow(lead));
    if (lead.idempotencyKey) cache.put(lead.idempotencyKey, '1', DUPLICATE_WINDOW_SECONDS);
    return reply({ ok: true });
  } catch (error) {
    console.error('Lead webhook failed: ' + error.message);
    return reply({ ok: false, error: 'storage-failed' });
  } finally {
    lock.releaseLock();
  }
}

function parseLead(event) {
  try {
    return JSON.parse(event.postData.contents);
  } catch (error) {
    return null;
  }
}

function sheetFor(config) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const existing = spreadsheet.getSheetByName(config.name);
  if (existing) return existing;

  const sheet = spreadsheet.insertSheet(config.name);
  sheet.appendRow(config.headers);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold');
  return sheet;
}

/** "44900000000" → "(44) 90000-0000". Punctuation also keeps Sheets from reading it as a number. */
function formatPhone(digits) {
  const local = digits.length > 11 ? digits.slice(2) : digits;
  const areaCode = local.slice(0, 2);
  const number = local.slice(2);
  const splitAt = number.length - 4;
  return '(' + areaCode + ') ' + number.slice(0, splitAt) + '-' + number.slice(splitAt);
}

/** Phones arrive as digits with area code; wa.me needs the country code (55). Sheets auto-links the URL. */
function whatsappLink(digits) {
  const international = digits.length <= 11 ? '55' + digits : digits;
  return 'https://wa.me/' + international;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
