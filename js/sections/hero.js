/* global gsap */
import { reducedMotion } from '../core/scroll.js';

export function initHero() {
  const hero = document.querySelector('.hero');
  const lines = hero.querySelectorAll('[data-hero-line]');
  const fades = hero.querySelectorAll('[data-hero-fade]');

  if (reducedMotion) return { intro() {} };

  gsap.set(lines, { yPercent: 115 });
  gsap.set(fades, { autoAlpha: 0, y: 24 });

  // saída no scroll: o título sobe mais devagar e some
  gsap.to(hero.querySelector('.hero__title'), {
    yPercent: -18,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 35%', scrub: true },
  });
  gsap.to(hero.querySelector('.hero__foot'), {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '40% top', scrub: true },
  });

  return {
    intro() {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to(lines, { yPercent: 0, duration: 1.5, stagger: 0.12 }, 0.15)
        .to(fades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.55);
    },
  };
}
