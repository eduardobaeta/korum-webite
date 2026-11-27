import { stopFlutedLights } from './fluted-lights';
import { ScrollTrigger } from './gsap-setup';
import { prefersReducedMotion } from './reduced-motion';
import { initReveals } from './reveals';
import { startSmoothScroll } from './smooth-scroll';

export function initMotion(): void {
  if (prefersReducedMotion()) {
    stopFlutedLights();
    return;
  }

  if (document.documentElement.dataset.smoothScroll === 'true') startSmoothScroll();

  // Wait for the web fonts so word splitting measures the final metrics.
  document.fonts.ready.then(() => {
    initReveals();
    ScrollTrigger.refresh();
  });
}
