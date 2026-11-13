import * as THREE from '../vendor/three.module.min.js';
import { createCodeTexture, createBitsTexture } from './codeTexture.js';
import { createBackground } from './background.js';
import { createCrystal } from './crystal.js';
import { scrollState } from '../core/scroll.js';

/**
 * Coreografia 3D por seção (chave = atributo data-scene no HTML).
 * layout: forma do cristal · x/y/z/scale: posição do conjunto
 * spin: giro · drift: flutuação dos fragmentos
 * intensity/tint/warp: comportamento do fundo de código
 */
const KEYS = {
  hero: { layout: 'crystal', x: 2.75, y: 0.75, yNarrow: 1.35, z: 0, scale: 1.1, spin: 0.14, drift: 0, intensity: 0.26, tint: 0, warp: 1 },
  manifesto: { layout: 'burst', x: 0, y: 0, z: -2.5, scale: 1.1, spin: 0.04, drift: 1, intensity: 0.17, tint: 0.1, warp: 1.2 },
  disciplinas: { layout: 'ring', x: 0, y: 0, z: -3, scale: 1.05, spin: 0.05, drift: 0.6, intensity: 0.16, tint: 0.25, warp: 1 },
  trabalhos: { layout: 'burst', x: 0, y: 0, z: -6, scale: 1, spin: 0.03, drift: 1, intensity: 0.13, tint: 0.5, warp: 0.8 },
  codigo: { layout: 'helix', x: 3.6, y: 0, z: -1, scale: 0.9, spin: 0.2, drift: 0.25, intensity: 0.3, tint: 0, warp: 1.1 },
  contato: { layout: 'crystal', x: 2.8, y: 0.5, yNarrow: 1.5, z: 0, scale: 1.25, spin: 0.16, drift: 0, intensity: 0.2, tint: 0.45, warp: 1 },
};

const NUMERIC = ['x', 'y', 'z', 'scale', 'spin', 'drift', 'intensity', 'tint', 'warp'];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function createEnvironment(renderer) {
  // estúdio procedural: softboxes teal e laranja para os reflexos do vidro
  const env = new THREE.Scene();
  env.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(30, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x020305, side: THREE.BackSide })
    )
  );
  const box = (color, power, pos, w, h) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  box(0xffffff, 2.6, [0, 12, 4], 14, 6);
  box(0x3fd0c9, 2.4, [-12, 2, 4], 5, 12);
  box(0xff6b2c, 2.4, [12, -2, 2], 4, 10);
  box(0xbfe9ff, 1, [0, -10, -6], 16, 5);
  box(0xffffff, 1.2, [3, 3, 14], 3, 3);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.03).texture;
  pmrem.dispose();
  return texture;
}

export async function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 9);

  scene.environment = createEnvironment(renderer);

  const [codeTexture, bitsTexture] = [await createCodeTexture(renderer), createBitsTexture()];
  const background = createBackground(codeTexture, bitsTexture);
  scene.add(background.mesh);
  const U = background.uniforms;

  const crystal = createCrystal();
  const rig = new THREE.Group(); // inclinação pelo ponteiro
  const spinner = new THREE.Group(); // giro contínuo
  spinner.add(crystal.group);
  rig.add(spinner);
  scene.add(rig);

  const keyLight = new THREE.PointLight(0xff6b2c, 22, 30);
  keyLight.position.set(5, 3, 6);
  const rimLight = new THREE.PointLight(0x3fd0c9, 22, 30);
  rimLight.position.set(-6, -2, 4);
  scene.add(keyLight, rimLight);

  // --- estado ---------------------------------------------------------------
  const sections = [...document.querySelectorAll('[data-scene]')].filter((el) => KEYS[el.dataset.scene]);
  const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 };
  const current = { ...KEYS.hero };
  let f = 0;
  let tintBoost = 0;
  let tintBoostSmooth = 0;
  let width = 1;
  let height = 1;
  let narrow = 0;

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX / width;
      pointer.y = 1 - e.clientY / height;
    },
    { passive: true }
  );

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    U.uRes.value.set(width * dpr, height * dpr);
    narrow = 1 - clamp((camera.aspect - 0.7) / 0.7, 0, 1); // 1 = retrato
  }
  window.addEventListener('resize', resize);
  resize();

  /** posição contínua entre seções: 0 = hero, 1 = manifesto, 1.5 = a meio caminho… */
  function sceneProgress() {
    let value = 0;
    for (let i = 1; i < sections.length; i++) {
      const top = sections[i].getBoundingClientRect().top;
      const enter = clamp(1 - top / height, 0, 1);
      if (enter > 0) value = i - 1 + enter;
    }
    return value;
  }

  const key = (i) => KEYS[sections[clamp(i, 0, sections.length - 1)].dataset.scene];
  const valueOf = (k, name) => (name === 'y' && k.yNarrow !== undefined ? lerp(k.y, k.yNarrow, narrow) : k[name]);

  // --- loop ----------------------------------------------------------------
  let last = performance.now();
  let slowFrames = 0;
  let frames = 0;

  function frame() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const time = now / 1000;

    // degrada a resolução se a máquina não acompanhar
    if (frames < 150) {
      frames++;
      if (dt > 0.03) slowFrames++;
      if (frames === 150 && slowFrames > 60 && dpr > 1) {
        dpr = 1;
        renderer.setPixelRatio(dpr);
        resize();
      }
    }

    f = lerp(f, sceneProgress(), 1 - Math.pow(0.001, dt));
    const i = Math.floor(f);
    const t = f - i;
    const A = key(i);
    const B = key(i + 1);
    const eased = t * t * (3 - 2 * t);
    for (const name of NUMERIC) current[name] = lerp(valueOf(A, name), valueOf(B, name), eased);

    // cristal
    crystal.update(A.layout, B.layout, t, time, current.drift);
    const sideFactor = 1 - narrow * 0.85;
    const sizeFactor = 1 - narrow * 0.38;
    crystal.group.position.set(0, 0, 0);
    rig.position.set(current.x * sideFactor, current.y, current.z);
    rig.scale.setScalar(current.scale * sizeFactor);
    spinner.rotation.y += current.spin * dt;
    spinner.rotation.x = Math.sin(time * 0.2) * 0.12;

    pointer.sx = lerp(pointer.sx, pointer.x, 1 - Math.pow(0.02, dt));
    pointer.sy = lerp(pointer.sy, pointer.y, 1 - Math.pow(0.02, dt));
    rig.rotation.y = (pointer.sx - 0.5) * 0.5;
    rig.rotation.x = -(pointer.sy - 0.5) * 0.35;
    camera.position.x = (pointer.sx - 0.5) * 0.35;
    camera.position.y = (pointer.sy - 0.5) * 0.25;
    camera.lookAt(0, 0, 0);

    // fundo
    tintBoostSmooth = lerp(tintBoostSmooth, tintBoost, 1 - Math.pow(0.01, dt));
    U.uTime.value = time;
    U.uScroll.value = scrollState.y / height;
    U.uVel.value = lerp(U.uVel.value, clamp(scrollState.velocity / 40, -1, 1), 0.1);
    U.uIntensity.value = current.intensity * (1 - narrow * 0.45); // telas estreitas: texto fica sobre o código
    U.uTint.value = clamp(current.tint + tintBoostSmooth, 0, 1);
    U.uWarp.value = current.warp + Math.abs(U.uVel.value) * 1.5;

    renderer.render(scene, camera);
  }

  // primeiro frame já compila shaders antes do preloader sair
  frame();
  gsap.ticker.add(frame);

  return {
    /** aquece (+) ou esfria (−) a cor do código enquanto algo está em foco */
    setTintBoost(value) {
      tintBoost = value;
    },
  };
}
