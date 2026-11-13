/* global gsap, ScrollTrigger */
import { reducedMotion } from './scroll.js';

/** Quebra o texto de um elemento em <span class="word"> preservando espaços. */
export function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.innerHTML = words.map((w) => `<span class="word" aria-hidden="true">${w}</span>`).join(' ');
  return [...el.querySelectorAll('.word')];
}

/** Entrada padrão para tudo que tiver [data-reveal]. */
export function initReveals(root = document) {
  const items = [...root.querySelectorAll('[data-reveal]')];
  if (!items.length || reducedMotion) return;

  gsap.set(items, { autoAlpha: 0, y: 48 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
  });
}

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
