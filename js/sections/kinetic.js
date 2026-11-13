/* global gsap */
import { reducedMotion } from '../core/scroll.js';

/**
 * Peça de motion design (tipografia cinética) com o nome, feita em HTML + GSAP.
 * Roda em loop dentro do quadro da disciplina "Motion design".
 */

const ROLES = ['Film', 'Edit', 'Motion', 'Code'];
const chars = (word) => [...word].map((c) => `<span class="k-ch">${c}</span>`).join('');
const row = (text) => `<div class="kinetic__row"><span>${text.repeat(6)}</span></div>`;

export function kineticMarkup() {
  return `
    <div class="kinetic" data-kinetic aria-label="Daniel Souza, motion design">
      <div class="kinetic__rows" aria-hidden="true">
        ${row('DANIEL SOUZA / ')}${row('MOTION DESIGN / ')}${row('DANIEL SOUZA / ')}${row('MOTION DESIGN / ')}
      </div>
      <div class="kinetic__name" aria-hidden="true">
        <span class="k-line">${chars('DANIEL')}</span>
        <span class="k-line">${chars('SOUZA')}<span class="k-slash">/</span></span>
      </div>
      <div class="kinetic__roles" aria-hidden="true">
        ${ROLES.map((r) => `<span class="k-role">${r}</span>`).join('')}
      </div>
      <span class="kinetic__wipe" aria-hidden="true"></span>
      <span class="kinetic__dot" aria-hidden="true"></span>
    </div>`;
}

/** Monta a linha do tempo em loop. Devolve o timeline (pausado) ou null. */
export function initKinetic(root) {
  const el = root.querySelector('[data-kinetic]');
  if (!el) return null;

  const letters = el.querySelectorAll('.k-ch');
  const slash = el.querySelector('.k-slash');
  const roles = el.querySelectorAll('.k-role');
  const wipe = el.querySelector('.kinetic__wipe');
  const dot = el.querySelector('.kinetic__dot');
  const name = el.querySelector('.kinetic__name');

  gsap.set(roles, { autoAlpha: 0 });
  gsap.set(wipe, { scaleX: 0 });
  if (reducedMotion) return null;

  const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'expo.out' } });

  // 1. o nome sobe letra por letra
  tl.set(name, { autoAlpha: 1, scale: 1 })
    .fromTo(letters, { yPercent: 125, rotate: 10 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.055 })
    .fromTo(slash, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.6, ease: 'back.out(2.2)' }, '-=0.55')
    .fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, '<')

    // 2. respiro: as letras abrem e fecham, o ponto percorre a base
    .to(letters, { x: (i) => ((i % 6) - 2.5) * 5, duration: 0.9, ease: 'power2.inOut' }, '+=0.25')
    .to(dot, { left: '88%', duration: 0.9, ease: 'power2.inOut' }, '<')
    .to(letters, { x: 0, duration: 0.7, ease: 'power3.inOut' })

    // 3. cortina laranja leva o nome embora
    .set(wipe, { transformOrigin: '0% 50%' })
    .to(wipe, { scaleX: 1, duration: 0.5, ease: 'power3.in' }, '+=0.2')
    .set(name, { autoAlpha: 0 })
    .set(dot, { scale: 0, left: '12%' })
    .set(wipe, { transformOrigin: '100% 50%' })
    .to(wipe, { scaleX: 0, duration: 0.55, ease: 'power3.out' });

  // 4. as quatro disciplinas, uma por batida
  roles.forEach((role) => {
    tl.fromTo(role, { autoAlpha: 0, scale: 1.5, filter: 'blur(14px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.42, ease: 'power3.out' })
      .to(role, { autoAlpha: 0, scale: 0.86, duration: 0.22, ease: 'power2.in' }, '+=0.3');
  });

  // 5. volta para o início do loop
  tl.to({}, { duration: 0.15 });
  return tl;
}
