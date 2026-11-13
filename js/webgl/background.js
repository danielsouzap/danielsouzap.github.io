import * as THREE from '../vendor/three.module.min.js';

/**
 * Fundo em tela cheia: mural de código + chuva binária vistos através de
 * "vidro líquido" (bolhas refrativas, ondas do ponteiro, distorção fluida).
 * É um objeto opaco da cena, então o cristal 3D também o refrata de verdade.
 */

export const TRAIL = 10;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uCode;
  uniform sampler2D uBits;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;      // ponteiro suavizado (uv)
  uniform vec4 uTrail[${TRAIL}]; // x, y, idade 0..1, força
  uniform float uScroll;    // scroll em "telas"
  uniform float uVel;       // velocidade do scroll
  uniform float uIntensity; // presença do código
  uniform float uTint;      // 0 = teal, 1 = laranja
  uniform float uWarp;

  const vec3 INK = vec3(0.0035, 0.0055, 0.009);
  const vec3 TEAL = vec3(0.06, 0.62, 0.58);
  const vec3 ORANGE = vec3(1.0, 0.17, 0.03);

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + 11.7;
      a *= 0.5;
    }
    return v;
  }

  float codeAt(vec2 q, float scale, vec2 offset) {
    return texture2D(uCode, q * scale + offset).r;
  }

  // chuva binária: cada célula sorteia 0 ou 1 e as colunas "caem"
  float bitsAt(vec2 q) {
    vec2 grid = vec2(92.0, 50.0);
    float col = floor(q.x * grid.x);
    float speed = 0.02 + hash(vec2(col, 3.0)) * 0.05;
    vec2 g = vec2(q.x * grid.x, (q.y + uTime * speed) * grid.y);
    vec2 cell = floor(g);
    vec2 local = fract(g);
    float flip = floor(uTime * (0.4 + hash(cell) * 2.0));
    float glyph = step(0.5, hash(cell + flip * 0.37));
    vec2 uv = vec2((local.x + glyph) * 0.5, local.y);
    float ink = texture2D(uBits, uv).r;
    // cabeça brilhante descendo por coluna
    float head = fract(q.y * 0.9 + uTime * speed * 4.0 + hash(vec2(col, 9.0)));
    float tail = pow(1.0 - head, 6.0);
    float sparse = step(0.74, hash(vec2(col, 21.0)));
    return ink * (0.02 + tail * 0.8) * sparse;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    float t = uTime;

    // --- distorção fluida de base ---------------------------------------
    vec2 flow = vec2(fbm(p * 1.1 + vec2(0.0, t * 0.05)), fbm(p * 1.1 + vec2(5.2, -t * 0.04))) - 0.5;
    vec2 q = p + flow * 0.07 * uWarp;

    // --- ondas deixadas pelo ponteiro / interface -----------------------
    float ripple = 0.0;
    for (int i = 0; i < ${TRAIL}; i++) {
      vec4 tr = uTrail[i];
      vec2 d = p - vec2(tr.x * aspect, tr.y);
      float r = length(d);
      float life = 1.0 - tr.z;
      float front = tr.z * 0.55;
      float w = sin((r - front) * 46.0) * exp(-abs(r - front) * 9.0) * life * tr.w;
      q += normalize(d + 1e-5) * w * 0.012;
      ripple += abs(w);
    }

    // --- bolhas de vidro líquido (metaballs) -----------------------------
    vec2 c0 = vec2(uMouse.x * aspect, uMouse.y);
    vec2 c1 = vec2(aspect * (0.5 + 0.34 * sin(t * 0.11)), 0.5 + 0.3 * cos(t * 0.13 + 1.0));
    vec2 c2 = vec2(aspect * (0.5 + 0.4 * cos(t * 0.07 + 2.0)), 0.5 + 0.36 * sin(t * 0.09 + 4.0));
    vec2 c3 = vec2(aspect * (0.5 + 0.22 * sin(t * 0.16 + 5.0)), 0.5 + 0.4 * sin(t * 0.06 + 2.5));

    float field = 0.0;
    vec2 grad = vec2(0.0);
    vec2 dd; float d2; float rr;

    dd = p - c0; d2 = dot(dd, dd) + 1e-4; rr = 0.018; field += rr / d2; grad -= 2.0 * rr * dd / (d2 * d2);
    dd = p - c1; d2 = dot(dd, dd) + 1e-4; rr = 0.036; field += rr / d2; grad -= 2.0 * rr * dd / (d2 * d2);
    dd = p - c2; d2 = dot(dd, dd) + 1e-4; rr = 0.026; field += rr / d2; grad -= 2.0 * rr * dd / (d2 * d2);
    dd = p - c3; d2 = dot(dd, dd) + 1e-4; rr = 0.014; field += rr / d2; grad -= 2.0 * rr * dd / (d2 * d2);

    float inside = smoothstep(0.92, 1.08, field);
    float rim = exp(-pow((field - 1.0) * 5.0, 2.0));
    vec2 gdir = normalize(grad + 1e-6);
    // lente: desloca mais na borda e relaxa no miolo (evita o "olho" no centro)
    float core = exp(-max(field - 1.0, 0.0) * 0.55);
    q += gdir * (inside * 0.028 * core + rim * 0.05);

    // --- base: tinta com névoa de cor ------------------------------------
    float n1 = fbm(p * 0.8 + vec2(t * 0.02, 0.0));
    float n2 = fbm(p * 0.6 + vec2(9.0, -t * 0.015));
    vec3 col = INK;
    col += TEAL * 0.03 * smoothstep(0.4, 0.95, n1);
    col += ORANGE * 0.03 * smoothstep(0.5, 1.0, n2) * (0.4 + uTint);

    // --- camadas de código ------------------------------------------------
    float scroll = uScroll;
    vec2 o1 = vec2(0.0, -(t * 0.012 + scroll * 0.32));
    vec2 o2 = vec2(0.37, -(t * 0.007 + scroll * 0.16));
    float ca = clamp(uVel, -1.0, 1.0) * 0.012;

    float cG = codeAt(q, 0.95, o1);
    float cR = codeAt(q + vec2(0.0, ca), 0.95, o1);
    float cB = codeAt(q - vec2(0.0, ca), 0.95, o1);
    float far = codeAt(q, 1.9, o2);

    // linhas "em execução"
    float line = floor((q.y * 0.95 + o1.y) * 64.0);
    float exec = step(0.94, hash(vec2(line, floor(t * 0.6))));

    float warm = clamp(uTint * 0.5 + inside * 0.45 * core + exec * 0.8, 0.0, 1.0);
    vec3 codeCol = mix(TEAL, ORANGE, warm);

    col += codeCol * vec3(cR, cG, cB) * (0.24 + exec * 0.3 + inside * 0.22) * uIntensity;
    col += TEAL * far * 0.04 * uIntensity;
    col += mix(TEAL, vec3(0.7, 1.0, 0.95), 0.4) * bitsAt(q - vec2(0.0, scroll * 0.08)) * 0.16 * uIntensity;

    // --- vidro: borda especular e leve ganho interno -----------------------
    col *= 1.0 + inside * 0.12;
    col += inside * TEAL * 0.012;
    col += rim * (vec3(0.5, 0.9, 0.88) * 0.035 + ORANGE * 0.02 * uTint);
    col += ripple * TEAL * 0.05;

    // --- vinheta e grão -----------------------------------------------------
    vec2 vg = vUv - 0.5;
    col *= 1.0 - dot(vg, vg) * 1.15;
    col += (hash(vUv * uRes + fract(t) * 100.0) - 0.5) * 0.012;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createBackground(codeTexture, bitsTexture) {
  const uniforms = {
    uCode: { value: codeTexture },
    uBits: { value: bitsTexture },
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector4(0, 0, 1, 0)) },
    uScroll: { value: 0 },
    uVel: { value: 0 },
    uIntensity: { value: 0.6 },
    uTint: { value: 0 },
    uWarp: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;

  return { mesh, uniforms };
}
