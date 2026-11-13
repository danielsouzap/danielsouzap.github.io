/* global gsap */

/** Cursor customizado (só em dispositivos com mouse). */
export function initCursor() {
  const el = document.querySelector('[data-cursor-el]');
  if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const label = el.querySelector('.cursor__label');
  const moveX = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
  const moveY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
  let shown = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (!shown) {
        shown = true;
        document.documentElement.classList.add('has-cursor');
        gsap.set(el, { x: e.clientX, y: e.clientY });
      }
      moveX(e.clientX);
      moveY(e.clientY);
    },
    { passive: true }
  );

  document.addEventListener('pointerover', (e) => {
    const labelled = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button');
    el.classList.toggle('has-label', !!labelled);
    el.classList.toggle('is-link', !labelled && !!link);
    if (labelled) label.textContent = labelled.dataset.cursor;
  });
}
