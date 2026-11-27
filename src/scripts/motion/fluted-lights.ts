/**
 * SMIL ignores `prefers-reduced-motion`. Pausing is not enough, because `<use>` copies keep their own timeline, so the
 * animation elements are removed from the light source and the copies follow it back to rest.
 */
export function stopFlutedLights(): void {
  document
    .querySelectorAll('[data-fluted-light-source] animate, [data-fluted-light-source] animateTransform')
    .forEach((animation) => animation.remove());
}
