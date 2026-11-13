/* global gsap */
import { reducedMotion } from '../core/scroll.js';

export function initContact() {
  const title = document.querySelector('[data-contact-title]');
  if (!title || reducedMotion) return;

  gsap.from(title.querySelectorAll('.hero__line > span'), {
    yPercent: 115,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: title, start: 'top 85%', once: true },
  });
}
