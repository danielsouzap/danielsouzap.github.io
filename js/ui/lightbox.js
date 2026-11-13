import { startScroll, stopScroll } from '../core/scroll.js';

const box = document.querySelector('[data-lightbox]');
const stage = document.querySelector('[data-lightbox-stage]');

function close() {
  box.classList.remove('is-open');
  box.setAttribute('aria-hidden', 'true');
  stage.replaceChildren();
  startScroll();
}

/** Abre um vídeo: arquivo (.mp4/.webm/.mov) ou URL de embed (YouTube/Vimeo). */
export function openVideo(src) {
  if (!src || !box) return;
  let node;
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(src)) {
    node = document.createElement('video');
    node.src = src;
    node.controls = true;
    node.autoplay = true;
    node.playsInline = true;
  } else {
    node = document.createElement('iframe');
    node.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
    node.allow = 'autoplay; fullscreen; picture-in-picture';
    node.allowFullscreen = true;
    node.title = 'Vídeo';
  }
  stage.replaceChildren(node);
  box.classList.add('is-open');
  box.setAttribute('aria-hidden', 'false');
  stopScroll();
}

export function initLightbox() {
  if (!box) return;
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.closest('[data-lightbox-close]')) close();
  });
  window.addEventListener('keydown', (e) => e.key === 'Escape' && box.classList.contains('is-open') && close());
}
