import { gsap } from './gsap-setup';

const DEFAULT_FADE_DISTANCE = 160;

/**
 * Fades `[data-scroll-fade]` out over `data-scroll-fade-distance` pixels;
 * `data-scroll-fade-media` limits it to a media query.
 */
export function initScrollFades(): void {
  gsap.utils.toArray<HTMLElement>('[data-scroll-fade]').forEach((element) => {
    const distance = Number(element.dataset.scrollFadeDistance) || DEFAULT_FADE_DISTANCE;
    const media = element.dataset.scrollFadeMedia ?? 'all';

    gsap.matchMedia().add(media, () => {
      gsap.to(element, { autoAlpha: 0, ease: 'none', scrollTrigger: { start: 0, end: distance, scrub: true } });
    });
  });
}
