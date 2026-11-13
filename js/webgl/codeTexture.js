import * as THREE from '../vendor/three.module.min.js';

/**
 * Gera as texturas usadas pelo shader de fundo:
 *  - um "mural" de código (Python, C, Java, SQL, JS) desenhado uma única vez
 *    em canvas 2D e rolado na GPU (custo zero por frame);
 *  - um atlas com os glifos 0 e 1 para a chuva binária.
 */

const SNIPPETS = [
  // Python
  `def registrar_saida(conn, produto_id, qtd):
    if qtd <= 0:
        raise ValueError("quantidade invalida")
    cur = conn.execute(
        "SELECT estoque FROM produtos WHERE id = ?",
        (produto_id,),
    )
    estoque = cur.fetchone()[0]
    if qtd > estoque:
        return False
    conn.execute(
        "UPDATE produtos SET estoque = ? WHERE id = ?",
        (estoque - qtd, produto_id),
    )
    conn.commit()
    return True

# giro = saidas / estoque_medio
def giro(saidas, estoque_medio):
    return saidas / max(estoque_medio, 1)`,

  // C
  `#include <stdio.h>

int eh_impar(int n) {
    /* -3 % 2 == -1 em C */
    return n % 2 != 0;
}

int main(void) {
    int n;
    while (scanf("%d", &n) != 1) {
        int c;
        while ((c = getchar()) != '\\n' && c != EOF);
        printf("entrada invalida\\n");
    }
    printf("%d\\n", eh_impar(n));
    return 0;
}`,

  // SQL
  `CREATE TRIGGER trg_turma_cheia
BEFORE INSERT ON matricula
FOR EACH ROW
BEGIN
  DECLARE vagas INT;
  SELECT capacidade - COUNT(m.id)
    INTO vagas
    FROM turma t
    LEFT JOIN matricula m ON m.turma_id = t.id
   WHERE t.id = NEW.turma_id
   GROUP BY t.id;
  IF vagas <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'turma cheia';
  END IF;
END;`,

  // Java
  `public final class Frame {
    private final long index;
    private final double fps;

    public Frame(long index, double fps) {
        this.index = index;
        this.fps = fps;
    }

    public double seconds() {
        return index / fps;
    }

    @Override
    public String toString() {
        return String.format("%.3fs", seconds());
    }
}`,

  // JavaScript
  `const lenis = new Lenis({ lerp: 0.1 });
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((t) => lenis.raf(t * 1000));

gsap.to(camera.position, {
  z: 2.4,
  ease: 'none',
  scrollTrigger: { scrub: true },
});

renderer.setAnimationLoop(() => {
  crystal.rotation.y += 0.002;
  renderer.render(scene, camera);
});`,

  // Python (EXIF)
  `from pathlib import Path
from PIL import Image, ExifTags

def data_da_foto(caminho: Path) -> str:
    exif = Image.open(caminho).getexif()
    for tag, valor in exif.items():
        if ExifTags.TAGS.get(tag) == "DateTime":
            return valor[:10].replace(":", "-")
    return "sem-data"

for foto in Path("brutos").glob("*.CR3"):
    destino = Path("clientes") / data_da_foto(foto)
    destino.mkdir(parents=True, exist_ok=True)
    foto.rename(destino / foto.name)`,
];

const COMMENT = /^\s*(#|\/\/|\/\*|--)/;

export async function createCodeTexture(renderer) {
  const size = 2048;
  const lines = 64;
  const lineH = size / lines;
  const cols = 3;
  const colW = size / cols;

  try {
    await document.fonts.load('500 20px "JetBrains Mono"');
  } catch (_) {
    /* segue com a mono do sistema */
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.font = '500 19px "JetBrains Mono", ui-monospace, Menlo, monospace';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';

  for (let c = 0; c < cols; c++) {
    // cada coluna empilha trechos diferentes até completar as 64 linhas
    const column = [];
    let s = c * 2;
    while (column.length < lines) {
      column.push(...SNIPPETS[s % SNIPPETS.length].split('\n'), '');
      s++;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(c * colW + 18, 0, colW - 36, size);
    ctx.clip();
    for (let l = 0; l < lines; l++) {
      const text = column[l];
      ctx.globalAlpha = COMMENT.test(text) ? 0.45 : 1;
      ctx.fillText(text, c * colW + 24, l * lineH + lineH / 2);
    }
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  return texture;
}

export function createBitsTexture() {
  const w = 36;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w * 2;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w * 2, h);
  ctx.fillStyle = '#fff';
  ctx.font = '500 44px "JetBrains Mono", ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('0', w / 2, h / 2 + 2);
  ctx.fillText('1', w + w / 2, h / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
