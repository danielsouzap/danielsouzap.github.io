import { repos, stack } from '../data/content.js';
import { escapeHtml } from '../core/reveal.js';

const chips = (list) => `<div class="chips">${list.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join('')}</div>`;

/** Lista de repositórios do GitHub + cartões de stack (dados em data/content.js). */
export function initCode() {
  const list = document.querySelector('[data-repos]');
  const stackEl = document.querySelector('[data-stack]');
  if (!list || !stackEl) return;

  list.innerHTML = repos
    .map(
      (r, i) => `
      <li data-reveal>
        <a class="repo glass" href="${escapeHtml(r.url)}" target="_blank" rel="noopener" data-pulse data-tint="-0.3" data-cursor="Abrir">
          <span class="repo__n mono">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3 class="repo__name">${escapeHtml(r.name)}</h3>
            ${chips(r.stack)}
          </div>
          <p class="repo__text">${escapeHtml(r.text)}</p>
          <span class="repo__arrow" aria-hidden="true">↗</span>
        </a>
      </li>`
    )
    .join('');

  stackEl.innerHTML = stack
    .map(
      (s) => `
      <div class="stack__card glass" data-reveal>
        <h3 class="mono">${escapeHtml(s.title)}</h3>
        ${chips(s.items)}
      </div>`
    )
    .join('');
}
