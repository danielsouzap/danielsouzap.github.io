/* global ScrollTrigger */
/**
 * Ponto de entrada.
 *   core/      scroll suave e utilitários de animação
 *   webgl/     fundo de código + cristal 3D (Three.js)
 *   ui/        navegação, vidro, preloader, lightbox
 *   sections/  animações de cada seção (GSAP + ScrollTrigger)
 *   data/      textos, imagens e links dos projetos
 */
import { initScroll, startScroll, stopScroll, reducedMotion } from './core/scroll.js';
import { initReveals } from './core/reveal.js';
import { runPreloader } from './ui/preloader.js';
import { initNav } from './ui/nav.js';
import { initGlass } from './ui/glass.js';
import { initLightbox } from './ui/lightbox.js';
import { initHero } from './sections/hero.js';
import { initManifesto } from './sections/manifesto.js';
import { initDisciplines } from './sections/disciplines.js';
import { initWork } from './sections/work.js';
import { initCode } from './sections/code.js';
import { initContact } from './sections/contact.js';

async function loadScene() {
  const canvas = document.getElementById('gl');
  try {
    const { initScene } = await import('./webgl/scene.js');
    return await initScene(canvas);
  } catch (error) {
    console.warn('[webgl] indisponível, usando fundo estático.', error);
    document.documentElement.classList.add('no-webgl');
    canvas.remove();
    return null;
  }
}

async function boot() {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  initScroll();
  stopScroll();

  // conteúdo dinâmico primeiro, para o ScrollTrigger medir o layout final
  initCode();
  initDisciplines();
  initWork();
  initManifesto();
  initContact();
  const hero = initHero();
  initReveals();
  initNav();
  initLightbox();

  const sceneReady = loadScene().then((scene) => initGlass(scene));
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

  await runPreloader(Promise.all([sceneReady, fontsReady]));

  ScrollTrigger.refresh();
  startScroll();
  hero.intro();
  if (reducedMotion) document.documentElement.classList.add('reduced-motion');
}

boot().catch((error) => {
  // nunca deixar o visitante preso no preloader
  console.error(error);
  document.body.classList.remove('is-loading');
  document.querySelector('[data-preloader]')?.remove();
});
