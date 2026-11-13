/* global gsap, ScrollTrigger */
import { showreel, works } from '../data/content.js';
import { escapeHtml } from '../core/reveal.js';
import { openVideo } from '../ui/lightbox.js';

/** 1) Zoom in: o quadro do showreel cresce até ocupar a tela inteira. */
function initReel() {
  const reel = document.querySelector('[data-reel]');
  if (!reel) return;

  const frame = reel.querySelector('[data-reel-frame]');
  const media = reel.querySelector('[data-reel-media]');
  const caption = reel.querySelector('[data-reel-caption]');
  const left = reel.querySelector('[data-reel-word="left"]');
  const right = reel.querySelector('[data-reel-word="right"]');

  const isFile = /\.(mp4|webm|mov)(\?.*)?$/i.test(showreel.video);
  const poster = escapeHtml(showreel.poster);
  media.innerHTML = isFile
    ? `<img class="reel__backdrop" src="${poster}" alt="" decoding="async">
       <video class="reel__video" src="${escapeHtml(showreel.video)}" poster="${poster}" muted loop playsinline preload="metadata" aria-label="${escapeHtml(showreel.label)}"></video>`
    : `<img src="${poster}" alt="${escapeHtml(showreel.label)}" decoding="async">`;

  // o vídeo só roda (sem som) enquanto a seção está na tela
  const video = media.querySelector('video');
  if (video) {
    ScrollTrigger.create({
      trigger: reel,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? video.play().catch(() => {}) : video.pause()),
    });
  }
  caption.innerHTML = `<span>${escapeHtml(showreel.label)}</span>${
    showreel.video ? '<button class="reel__play" type="button" data-pulse>▶ Assistir com som</button>' : ''
  }`;
  caption.querySelector('.reel__play')?.addEventListener('click', () => openVideo(showreel.video));

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: reel, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    })
    .fromTo(frame, { scale: 0.36, yPercent: 9, borderRadius: 48 }, { scale: 1, yPercent: 0, borderRadius: 0, duration: 1, ease: 'power2.inOut' }, 0)
    .fromTo(media, { scale: 1.7 }, { scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
    .to(left, { yPercent: -80, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0)
    .to(right, { yPercent: -80, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0.04)
    .to(caption, { autoAlpha: 1, duration: 0.2 }, 0.85)
    .to({}, { duration: 0.35 }); // respiro com o quadro em tela cheia
}

/** 2) Galeria horizontal dirigida pelo scroll vertical. */
function initGallery() {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;
  const track = gallery.querySelector('[data-gallery-track]');

  // foto do trabalho > logo do cliente > nome em texto
  const media = (w) => {
    if (w.image) {
      const badge = w.logo ? `<span class="card__badge"><img src="${escapeHtml(w.logo)}" alt=""></span>` : '';
      return `<div class="card__media"><img class="card__photo" src="${escapeHtml(w.image)}" alt="${escapeHtml(w.client)}" loading="lazy" decoding="async">${badge}</div>`;
    }
    if (w.logo) return `<div class="card__media card__media--logo glass"><img class="card__logo" src="${escapeHtml(w.logo)}" alt="Logo ${escapeHtml(w.client)}" loading="lazy" decoding="async"></div>`;
    return `<div class="card__media card__media--logo glass"><span class="card__wordmark">${escapeHtml(w.client)}</span></div>`;
  };

  const cards = works
    .map(
      (w, i) => `
      <article class="card${w.video ? ' is-playable' : ''}${w.portrait ? ' card--portrait' : ''}" data-tint="0.35" ${
        w.video ? `data-video="${escapeHtml(w.video)}" data-cursor="Play" tabindex="0" role="button"` : ''
      }>
        ${media(w)}
        <div class="card__info">
          <h3 class="card__client">${escapeHtml(w.client)}</h3>
          <p class="card__meta mono"><b>${String(i + 1).padStart(2, '0')}</b>${w.tags.map(escapeHtml).join(' · ')}</p>
        </div>
      </article>`
    )
    .join('');

  track.innerHTML = `
    <div class="gallery__intro">
      <h3>Marcas que já <em>filmei.</em></h3>
      <p>Roteiro, captação, edição e motion para engenharia, finanças, alimentação e varejo.</p>
    </div>
    ${cards}
    <div class="gallery__end glass">
      <p>Tem um projeto em mente?</p>
      <a class="btn btn--small" href="#contato" data-pulse>Vamos conversar</a>
    </div>`;

  track.addEventListener('click', (e) => {
    const card = e.target.closest('[data-video]');
    if (card) openVideo(card.dataset.video);
  });
  track.addEventListener('keydown', (e) => {
    const card = e.target.closest?.('[data-video]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openVideo(card.dataset.video);
    }
  });

  // a altura da seção define quanto scroll vertical vira deslocamento horizontal
  let distance = 0;
  const measure = () => {
    distance = Math.max(0, track.scrollWidth - window.innerWidth);
    gallery.style.height = `${window.innerHeight + distance}px`;
  };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);

  const trigger = { trigger: gallery, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true };
  gsap.to(track, { x: () => -distance, ease: 'none', scrollTrigger: trigger });
  const photos = track.querySelectorAll('.card__photo');
  if (photos.length) gsap.fromTo(photos, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { ...trigger } });
}

export function initWork() {
  initReel();
  initGallery();
}
