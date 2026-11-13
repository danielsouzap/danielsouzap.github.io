/**
 * Liga a interface ao fundo:
 *  - .glass      → brilho especular segue o ponteiro (variáveis --mx / --my)
 *  - [data-pulse] → ao entrar com o mouse, solta uma onda no fundo WebGL
 *  - [data-tint]  → aquece/esfria a cor do código enquanto em foco
 */
export function initGlass(scene) {
  document.addEventListener(
    'pointermove',
    (e) => {
      const panel = e.target.closest?.('.glass');
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      panel.style.setProperty('--my', `${e.clientY - rect.top}px`);
    },
    { passive: true }
  );

  if (!scene) return;

  document.addEventListener('pointerover', (e) => {
    const from = e.relatedTarget;

    const pulse = e.target.closest?.('[data-pulse]');
    if (pulse && !(from && pulse.contains(from))) {
      const rect = pulse.getBoundingClientRect();
      scene.pulse(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.2);
    }

    const tint = e.target.closest?.('[data-tint]');
    scene.setTintBoost(tint ? Number(tint.dataset.tint) : 0);
  });
}
