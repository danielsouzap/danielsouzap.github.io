/* global gsap */

/**
 * Contador 0→100. Sobe até 90 sozinho e só fecha quando `ready` resolver
 * (fontes + WebGL). Resolve quando a cortina termina de subir.
 */
export function runPreloader(ready) {
  const el = document.querySelector('[data-preloader]');
  const num = document.querySelector('[data-preloader-num]');
  if (!el) return Promise.resolve();

  const state = { v: 0 };
  const render = () => {
    num.textContent = Math.round(state.v);
  };

  return new Promise((resolve) => {
    gsap.to(state, { v: 90, duration: 1.8, ease: 'power2.out', onUpdate: render });

    ready.finally(() => {
      gsap.to(state, {
        v: 100,
        duration: 0.5,
        ease: 'power1.inOut',
        overwrite: true,
        onUpdate: render,
        onComplete: () => {
          document.body.classList.remove('is-loading');
          gsap
            .timeline({ onComplete: () => el.remove() })
            .to(el.firstElementChild, { autoAlpha: 0, y: -30, duration: 0.45, ease: 'power2.in' })
            .add(resolve)
            .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, '<');
        },
      });
    });
  });
}
