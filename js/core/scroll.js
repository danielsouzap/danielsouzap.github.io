/* global gsap, ScrollTrigger, Lenis */

/**
 * Scroll suave (Lenis) sincronizado com o GSAP ScrollTrigger.
 * `scrollState` é lido pelo WebGL a cada frame.
 */

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const scrollState = { y: 0, velocity: 0, progress: 0, direction: 1 };

let lenis = null;

export function initScroll() {
  gsap.registerPlugin(ScrollTrigger);

  if (!reducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', (e) => {
      scrollState.y = e.scroll;
      scrollState.velocity = e.velocity;
      scrollState.progress = e.progress;
      scrollState.direction = e.direction || scrollState.direction;
      ScrollTrigger.update();
    });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    let lastY = window.scrollY;
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scrollState.direction = y >= lastY ? 1 : -1;
        scrollState.velocity = y - lastY;
        scrollState.y = y;
        scrollState.progress = max > 0 ? y / max : 0;
        lastY = y;
      },
      { passive: true }
    );
  }

  // âncoras internas
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    scrollTo(target);
  });
}

export function scrollTo(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

export function stopScroll() {
  if (lenis) lenis.stop();
  else document.body.style.overflow = 'hidden';
}

export function startScroll() {
  if (lenis) lenis.start();
  else document.body.style.overflow = '';
}
