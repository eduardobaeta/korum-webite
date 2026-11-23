import { gsap, SplitText, STANDARD_EASE } from './gsap-setup';

const REVEAL_START = 'top 88%';
const RISE_DISTANCE = 16;
const RISE_DURATION = 0.7;
const SCALE_FROM = 0.9;
const SCALE_DURATION = 1.2;
const WORD_RISE_DISTANCE = 32;
const WORD_DURATION = 0.6;
const WORD_STAGGER = 0.05;
const WORD_BLUR = 'blur(6px)';

function numberAttribute(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function revealElement(element: HTMLElement): void {
  const { reveal, revealDelay, revealDuration, revealY, revealScale } = element.dataset;
  const isScale = reveal === 'scale';
  const from: gsap.TweenVars = { autoAlpha: 0 };

  if (isScale) from.scale = numberAttribute(revealScale, SCALE_FROM);
  if (!isScale && reveal !== 'fade') from.y = numberAttribute(revealY, RISE_DISTANCE);

  gsap.from(element, {
    ...from,
    duration: numberAttribute(revealDuration, isScale ? SCALE_DURATION : RISE_DURATION),
    delay: numberAttribute(revealDelay, 0),
    ease: STANDARD_EASE,
    clearProps: 'transform',
    scrollTrigger: { trigger: element, start: REVEAL_START, once: true },
  });
}

function revealWords(element: HTMLElement): void {
  const { revealDelay, revealDuration, revealY } = element.dataset;
  const split = SplitText.create(element, { type: 'words' });

  gsap.set(element, { autoAlpha: 1 });
  gsap.from(split.words, {
    autoAlpha: 0,
    y: numberAttribute(revealY, WORD_RISE_DISTANCE),
    filter: WORD_BLUR,
    duration: numberAttribute(revealDuration, WORD_DURATION),
    delay: numberAttribute(revealDelay, 0),
    stagger: WORD_STAGGER,
    ease: STANDARD_EASE,
    scrollTrigger: { trigger: element, start: REVEAL_START, once: true },
    // Restore the original text node: better for screen readers and resizes.
    onComplete: () => split.revert(),
  });
}

export function initReveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(revealElement);
  gsap.utils.toArray<HTMLElement>('[data-reveal-words]').forEach(revealWords);
}
