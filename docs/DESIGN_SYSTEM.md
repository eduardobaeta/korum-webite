# Design System — Astro

> Engineering foundation for a site's visual layer. Each project owns its identity (palette, fonts, imagery, layout,
> motion); the standard owns the structure. Token vocabulary and UI libraries are shared with the other stacks
> ([CONVENTIONS.md §9–11](./CONVENTIONS.md)).

## 1. Token layers

1. **Foundation:** raw palette, font families, spacing, radii, container width, breakpoints, easing and durations.
2. **Semantic:** the shadcn vocabulary — `background`, `foreground`, `card`, `primary`, `secondary`, `muted`,
   `accent`, `destructive`, `border`, `input`, `ring`, `radius`… plus documented brand roles when nothing fits.
3. **Component:** variants, sizes and states derived from semantic tokens (in the component or as `@utility`).

```css
/* src/styles/tokens.css — values are placeholders; every project sets its own */
:root {
  --background: #ffffff;
  --foreground: #111111;
  --muted: #f2f2f2;
  --muted-foreground: #6e6e6e;
  --primary: #111111;
  --primary-foreground: #ffffff;
  --border: #e5e5e5;
  --ring: #111111;
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
}
```

`src/styles/globals.css` imports Tailwind, `tokens.css` and `typography.css` and defines the base layer. Breakpoints
and custom spacing are added to `@theme` once instead of repeating arbitrary values in components.

## 2. Typography

- Define a type scale as presets in `src/styles/typography.css` using `@utility type-<role>` (`type-display`,
  `type-heading-lg`, `type-body`, `type-eyebrow`…), each stepping at the project breakpoints.
- Responsive sizes use either the presets or `clamp()` with deliberate min/max values; keep line length readable.
- Self-host fonts (local `woff2` or Fontsource), load only used weights, set `font-display`, preload the fonts used
  above the fold.

## 3. Components

| Folder | Content |
| --- | --- |
| `src/components/ui/` | Brand-neutral primitives: Button, TextField, SelectField, Tag, LineBreaks… |
| `src/components/layout/` | SiteHeader, SiteFooter, navigation, skip link |
| `src/components/sections/` | Page sections; receive copy and media through props from `src/config` |
| `src/features/<f>/components/` | Feature UI (e.g. lead forms) |

Every primitive has a clear purpose and stable typed API, real `<button>`/`<a>` semantics, states (hover,
focus-visible, disabled, loading, success, error) and no brand values. Gotcha: Astro renders duplicated attributes
instead of overriding them — resolve attributes like `type` before spreading props.

Icons: Lucide SVGs and brand SVGs imported as Astro SVG components from `src/assets/`; decorative ones get
`aria-hidden="true"`. React islands may use shadcn/ui components when an island needs them.

## 4. Layout

- Mobile-first; a consistent content container (`container-*` utility) with full-bleed sections when the art
  direction calls for it; a shared grid utility when the design uses one.
- Avoid fixed heights on content containers; reserve space for media to prevent layout shift.

## 5. Motion

- CSS transitions first. **GSAP** (ScrollTrigger, SplitText) for choreography; reveal behavior configured through
  data attributes so markup stays declarative.
- **Lenis** smooth scrolling only when the project opts in (config flag); drive it from GSAP's ticker so
  ScrollTrigger reads the smoothed position; pause it while overlays are open.
- `prefers-reduced-motion: reduce` disables Lenis and non-essential motion. Content hidden for a reveal must stay
  visible when JavaScript does not run (gate hiding behind a `.js` class).
- No scroll-jacking, no motion that hides core content from assistive technology; animate `transform`/`opacity`.

## 6. Accessibility checklist

- Semantic landmarks, one `h1`, ordered headings, native form controls with labels.
- Keyboard navigation, visible focus, skip link, correct accessible names and error feedback.
- WCAG 2.2 AA contrast for text; decorative elements marked as such; adequate touch targets.
- No essential content only available through motion.

## 7. Process for new patterns

Solve a real need with existing primitives first; define states and accessibility before visuals; add tokens instead
of literals; document reusable components; avoid a cross-project component library until reuse is proven.

## References

- Tailwind CSS 4 theme variables: https://tailwindcss.com/docs/theme
- shadcn/ui theming: https://ui.shadcn.com/docs/theming
- Astro SVG components: https://docs.astro.build/en/guides/images/#svg-components
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
