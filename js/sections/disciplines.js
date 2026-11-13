/* global gsap */
import { disciplines } from '../data/content.js';
import { escapeHtml } from '../core/reveal.js';
import { kineticMarkup, initKinetic } from './kinetic.js';

/**
 * Seção fixa (sticky): a cada "tela" de scroll a imagem é trocada por uma
 * cortina (clip-path) enquanto dá zoom out, e o texto acompanha.
 */
export function initDisciplines() {
  const section = document.querySelector('[data-disc]');
  if (!section) return;

  const itemsEl = section.querySelector('[data-disc-items]');
  const mediaEl = section.querySelector('[data-disc-media]');
  const currentEl = section.querySelector('[data-disc-current]');
  const barEl = section.querySelector('[data-disc-bar]');
  const total = disciplines.length;

  itemsEl.innerHTML = disciplines
    .map(
      (d) => `
      <article class="disc__item">
        <h2 class="disc__title">${escapeHtml(d.title)}</h2>
        <p class="disc__text">${escapeHtml(d.text)}</p>
        <div class="chips">${d.tags.map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>
      </article>`
    )
    .join('');

  mediaEl.innerHTML = disciplines
    .map(
      (d, i) => `
      <div class="disc__img" style="z-index:${i + 1}">
        ${
          d.motion
            ? kineticMarkup()
            : `<img src="${escapeHtml(d.image)}" alt="${escapeHtml(d.title)}" style="object-position:${escapeHtml(d.position || '50% 50%')}" ${i ? 'loading="lazy"' : ''} decoding="async">`
        }
      </div>`
    )
    .join('');

  const items = [...itemsEl.children];
  const wraps = [...mediaEl.children];
  const imgs = wraps.map((w) => w.firstElementChild);

  // a peça de motion só roda enquanto a disciplina dela está em cena
  const kinetic = initKinetic(mediaEl);
  const motionIndex = disciplines.findIndex((d) => d.motion);

  let active = -1;
  const setActive = (index) => {
    if (index === active) return;
    active = index;
    if (kinetic) index === motionIndex ? kinetic.restart() : kinetic.pause();
    items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
      item.classList.toggle('is-past', i < index);
    });
    currentEl.textContent = disciplines[index].index;
  };
  setActive(0);

  // linha do tempo com 1 unidade por disciplina
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        setActive(Math.min(total - 1, Math.floor(self.progress * total + 0.22)));
        barEl.style.transform = `scaleX(${self.progress})`;
      },
    },
  });

  tl.fromTo(imgs[0], { scale: 1.35 }, { scale: 1.05, duration: 1 }, 0);

  for (let i = 1; i < total; i++) {
    const at = i - 0.45;
    tl.fromTo(wraps[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'power2.inOut' }, at)
      .fromTo(imgs[i], { scale: i === motionIndex ? 1.2 : 1.6 }, { scale: i === motionIndex ? 1 : 1.05, duration: i === motionIndex ? 0.6 : 1.45 }, at)
      .to(imgs[i - 1], { yPercent: -12, duration: 0.45, ease: 'power2.inOut' }, at);
  }
  tl.to({}, { duration: 0.001 }, total);
}
