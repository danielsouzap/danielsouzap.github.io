import * as THREE from '../vendor/three.module.min.js';

/**
 * Cristal de vidro formado por 80 fragmentos (as faces de um icosaedro
 * subdividido, extrudadas para dentro). Cada fragmento conhece sua posição
 * em vários "layouts" e o scroll interpola entre eles:
 *
 *   crystal  → montado
 *   burst    → explodido ao redor da câmera
 *   ring     → cinturão orbitando o conteúdo
 *   helix    → coluna em espiral
 */

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shardGeometry(a, b, c, rand) {
  const centroid = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
  const out = 1 + rand() * 0.2;
  const inner = 0.42 + rand() * 0.3;
  const gap = 0.92;

  const o = [a, b, c].map((v) => v.clone().lerp(centroid, 1 - gap).multiplyScalar(out));
  const i = o.map((v) => v.clone().multiplyScalar(inner));

  const center = new THREE.Vector3();
  [...o, ...i].forEach((v) => center.add(v));
  center.divideScalar(6);
  [...o, ...i].forEach((v) => v.sub(center));

  const tris = [o[0], o[1], o[2], i[2], i[1], i[0]];
  for (let k = 0; k < 3; k++) {
    const k1 = (k + 1) % 3;
    tris.push(o[k], i[k], i[k1], o[k], i[k1], o[k1]);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(tris);
  geometry.computeVertexNormals();
  return { geometry, center };
}

export function createCrystal() {
  const rand = mulberry32(20221107);
  const group = new THREE.Group();

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 1,
    thickness: 0.9,
    ior: 1.5,
    roughness: 0.06,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    iridescence: 0.5,
    iridescenceIOR: 1.3,
    attenuationColor: new THREE.Color(0x7fe9e2),
    attenuationDistance: 5,
    envMapIntensity: 1,
    flatShading: true,
  });

  // arestas luminosas: definem as facetas mesmo sobre o fundo escuro
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x9ff3ee, transparent: true, opacity: 0.22 });

  const base = new THREE.IcosahedronGeometry(1, 1);
  const pos = base.attributes.position;
  const shards = [];
  const count = pos.count / 3;

  for (let f = 0; f < count; f++) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, f * 3);
    const b = new THREE.Vector3().fromBufferAttribute(pos, f * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, f * 3 + 2);
    const { geometry, center } = shardGeometry(a, b, c, rand);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 20), edgeMaterial));
    group.add(mesh);

    const dir = center.clone().normalize();
    const randomQuat = () =>
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2)
      );
    const angle = (f / count) * Math.PI * 2;
    const turn = (f / count) * Math.PI * 7;

    shards.push({
      mesh,
      delay: rand(),
      phase: rand() * Math.PI * 2,
      layouts: {
        crystal: { p: center.clone(), q: new THREE.Quaternion(), s: 1 },
        burst: {
          p: dir
            .clone()
            .multiplyScalar(2.4 + rand() * 3.2)
            .add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(1.6)),
          q: randomQuat(),
          s: 0.3 + rand() * 0.45,
        },
        ring: {
          // cinturão em volta do eixo Y: tolera o giro contínuo do conjunto
          p: (() => {
            const radius = 3.4 + rand() * 1.8;
            return new THREE.Vector3(Math.cos(angle) * radius, (rand() - 0.5) * 4.6, Math.sin(angle) * radius);
          })(),
          q: randomQuat(),
          s: 0.3 + rand() * 0.4,
        },
        helix: {
          p: new THREE.Vector3(Math.cos(turn) * 1.05, (f / count - 0.5) * 7.5, Math.sin(turn) * 1.05),
          q: randomQuat(),
          s: 0.5 + rand() * 0.5,
        },
      },
    });
  }

  const tmpP = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const smooth = (x) => x * x * (3 - 2 * x);

  /** Interpola do layout `from` ao `to` (t: 0..1), com atraso por fragmento. */
  function update(from, to, t, time, drift) {
    for (const s of shards) {
      const A = s.layouts[from];
      const B = s.layouts[to];
      const local = smooth(THREE.MathUtils.clamp(t * 1.5 - s.delay * 0.5, 0, 1));

      tmpP.lerpVectors(A.p, B.p, local);
      tmpP.y += Math.sin(time * 0.6 + s.phase) * 0.07 * drift;
      tmpP.x += Math.cos(time * 0.45 + s.phase * 1.7) * 0.05 * drift;
      tmpQ.slerpQuaternions(A.q, B.q, local);

      s.mesh.position.copy(tmpP);
      s.mesh.quaternion.copy(tmpQ);
      if (drift > 0.01) {
        s.mesh.rotateX(Math.sin(time * 0.25 + s.phase) * 0.35 * drift);
        s.mesh.rotateY(time * 0.08 * drift);
      }
      s.mesh.scale.setScalar(A.s + (B.s - A.s) * local);
    }
  }

  return { group, material, update };
}
