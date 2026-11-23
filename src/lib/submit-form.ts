import { isResult, type Result } from '@/lib/result';

/**
 * The one fetch-based helper allowed in client code (docs/CONVENTIONS.md §12):
 * pages that ship no Axios stay light.
 */
export async function submitForm(form: HTMLFormElement): Promise<Result<unknown>> {
  const fields = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === 'string') fields.append(key, value);
  });

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: fields,
    });
    const body: unknown = await response.json();
    return isResult(body) ? body : { ok: false, error: { code: 'unexpected' } };
  } catch {
    return { ok: false, error: { code: 'network' } };
  }
}
