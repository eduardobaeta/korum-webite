import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap-setup';
import { prefersReducedMotion } from './reduced-motion';

let lenis: Lenis | null = null;

/** Lenis runs on GSAP's ticker so ScrollTrigger reads the smoothed position. */
export function startSmoothScroll(): void {
  if (lenis || prefersReducedMotion()) return;

  lenis = new Lenis({ lerp: 0.1, autoRaf: false, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function pauseSmoothScroll(): void {
  lenis?.stop();
}

export function resumeSmoothScroll(): void {
  lenis?.start();
}
