# SEO and Performance — Astro

> Websites live on search and on speed. Targets and analytics names are shared with the other stacks
> ([CONVENTIONS.md §16](./CONVENTIONS.md)).

## 1. SEO checklist

- Unique `<title>` and meta description per indexable page; one `h1`; meaningful heading hierarchy.
- Absolute canonical URL from the configured `site` (set `SITE_URL`, or derive the production domain from Vercel).
- Open Graph and Twitter metadata with a 1200×630 social image and alt text; `summary_large_image` when present.
- Correct `lang` per page; `hreflang` only for real localized variants.
- `@astrojs/sitemap` when `site` is known; exclude confirmation and preview pages.
- `robots.txt` and `<meta name="robots">`: only the Vercel **production** deployment is indexable; previews, local
  builds and confirmation pages are `noindex`.
- Structured data only when it accurately describes real content.
- Descriptive English route segments and text alternatives for informative images.

## 2. Performance rules

- Optimize images with `astro:assets` (`<Image>`, `<Picture>`, `getImage`), specify dimensions, choose quality per
  image; never lazy-load the LCP element.
- Flatten decorative transparent images onto the page background when they always sit on it (much smaller files).
- Self-hosted fonts, only used weights, preload above-the-fold weights.
- Ship JavaScript only for behavior: deferred module scripts, no hydration without need, scrutinize tag managers and
  pixels. Video: compressed, poster, no unnecessary autoplay.
- Reserve space for media and embeds (CLS); keep motion on `transform`/`opacity`.

## 3. Budgets and measurement

| Metric | Target |
| --- | --- |
| LCP (p75) | ≤ 2.5 s |
| INP (p75) | ≤ 200 ms |
| CLS (p75) | ≤ 0.1 |
| JavaScript per page (gzip) | ≤ 60 kB (raise only for a measured reason) |

Measure the built output (gzip of `_astro/*.js`) when adding scripts or libraries, and real-user data (Vercel Speed
Insights or the analytics provider) after launch. A site with heavy media and third-party JS is slow regardless of
framework.

## 4. Analytics

- One provider per project; load according to consent requirements.
- Events: `page_view`, `cta_click`, `form_start`, `generate_lead` (only after the provider confirmed the
  submission), `contact_click`. No personal data in properties; no duplicate conversions after redirects or retries.

## References

- Astro images: https://docs.astro.build/en/guides/images/
- Astro sitemap: https://docs.astro.build/en/guides/integrations-guide/sitemap/
- Web Vitals: https://web.dev/articles/vitals
