/* global gsap, ScrollTrigger */
import { scrollState, startScroll, stopScroll } from '../core/scroll.js';

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  const bar = document.querySelector('[data-progress]');
  const links = [...document.querySelectorAll('.nav__links a')];

  // menu mobile
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) stopScroll();
    else startScroll();
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && menu.classList.contains('is-open') && setMenu(false));

  // esconde ao descer, mostra ao subir + barra de progresso
  gsap.ticker.add(() => {
    const hide = scrollState.direction > 0 && scrollState.y > window.innerHeight * 0.6;
    nav.classList.toggle('is-hidden', hide && !menu.classList.contains('is-open'));
    bar.style.transform = `scaleX(${scrollState.progress})`;
  });

  // link ativo
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });
}
