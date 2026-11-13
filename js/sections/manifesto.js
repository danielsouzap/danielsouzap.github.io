/* global gsap */
import { splitWords } from '../core/reveal.js';
import { reducedMotion } from '../core/scroll.js';

/** O texto "acende" palavra por palavra conforme o scroll. */
export function initManifesto() {
  const text = document.querySelector('.manifesto [data-split]');
  if (!text) return;
  const words = splitWords(text);

  if (reducedMotion) {
    gsap.set(words, { opacity: 1 });
    return;
  }

  const portrait = document.querySelector('[data-portrait]');
  if (portrait) {
    // zoom out do retrato conforme a seção atravessa a tela
    gsap.fromTo(portrait, { scale: 1.4 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: portrait, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  gsap.to(words,  {
    opacity: 1,
    ease: 'none',
    stagger: 0.12,
    scrollTrigger: { trigger: text, start: 'top 82%', end: 'bottom 45%', scrub: 0.4 },
  });
}
