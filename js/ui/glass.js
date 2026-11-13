/**
 * Liga a interface ao fundo:
 *  - .glass      → brilho especular segue o ponteiro (variáveis --mx / --my)
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
    const tint = e.target.closest?.('[data-tint]');
    scene.setTintBoost(tint ? Number(tint.dataset.tint) : 0);
  });
}
