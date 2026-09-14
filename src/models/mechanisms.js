import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { movieDetail } from "./movie-detail.js";

export function buildMechanisms(k, parts) {
  const { mesh, box, cyl, rod, plate, m } = k;
  const { shell, torus, cable } = movieDetail(k);
  const hinges = [],
    rotors = [],
    fingers = [],
    actuators = [];
  let componentCount = 0;
  function mount(name) {
    const p = parts.find((p) => p.g.name === name),
      g = new THREE.Group();
    p.g.add(g);
    if (p.pivot) g.position.copy(p.pivot).negate();
    return g;
  }
  function pivot(parent, pos) {
    const g = new THREE.Group();
    g.position.set(...pos);
    parent.add(g);
    return g;
  }
  function batch(g) {
    g.updateWorldMatrix(true, true);
    const inverse = g.matrixWorld.clone().invert(),
      groups = new Map();
    g.traverse((o) => {
      if (!o.isMesh) return;
      componentCount++;
      const geometry = o.geometry
        .clone()
        .applyMatrix4(inverse.clone().multiply(o.matrixWorld));
      if (!groups.has(o.material)) groups.set(o.material, []);
      groups
        .get(o.material)
        .push(geometry.index ? geometry.toNonIndexed() : geometry);
    });
    g.clear();
    for (const [material, geos] of groups) {
      mesh(g, mergeGeometries(geos, false), material);
      geos.forEach((x) => x.dispose());
    }
  }
  function turbine(g, pos, r) {
    torus(g, r, 0.026, pos, m.steel);
    cyl(g, r * 0.94, 0.07, pos, m.black, "z");
    const spin = pivot(g, [pos[0], pos[1], pos[2] + 0.06]);
    cyl(spin, r * 0.28, 0.075, [0, 0, 0], m.brass, "z", r * 0.18, 16);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      plate(
        spin,
        r * 0.18,
        r * 0.56,
        0.02,
        [Math.sin(a) * r * 0.58, Math.cos(a) * r * 0.58, 0],
        m.steel,
        [0.22, 0.2, -a - 0.4],
        "blade",
      );
    }
    batch(spin);
    rotors.push(spin);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      cyl(
        g,
        0.015,
        0.03,
        [pos[0] + Math.sin(a) * r, pos[1] + Math.cos(a) * r, pos[2] + 0.015],
        m.chrome,
        "z",
        0.015,
        6,
      );
    }
  }
  function flap(parent, pos, w, h, side, material = m.blue, axis = "y") {
    const g = pivot(parent, pos);
    shell(
      g,
      [
        [-h * 0.48, w * 0.28, side * w * 0.22, 0],
        [-h * 0.15, w * 0.52, side * w * 0.36, 0.02],
        [h * 0.3, w * 0.46, side * w * 0.4, 0],
        [h * 0.5, w * 0.14, side * w * 0.25, -0.06],
      ],
      [0, 0, 0],
      material,
      [0, 0, 0],
      0.08,
      0.045,
    );
    for (let i = 0; i < 5; i++)
      box(
        g,
        [w * 0.55, 0.012, 0.016],
        [side * w * 0.33, -h * 0.26 + i * h * 0.115, 0.075],
        m.gunmetal,
      );
    batch(g);
    hinges.push({ g, axis, angle: side * 1.15 });
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 1, 8),
      m.gunmetal,
    );
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.017, 0.017, 1, 8),
      m.chrome,
    );
    parent.add(sleeve, shaft);
    actuators.push({
      g,
      parent,
      sleeve,
      shaft,
      anchor: new THREE.Vector3(
        pos[0] - side * 0.08,
        pos[1] - 0.12,
        pos[2] - 0.15,
      ),
      end: new THREE.Vector3(side * w * 0.48, 0.12, -0.015),
    });
    return g;
  }
  for (const s of [-1, 1]) {
    const shoulder = mount(`swept shoulder hood ${s}`);
    turbine(shoulder, [s * 0.05, -0.015, 0.33], 0.255);
    for (let i = 0; i < 3; i++)
      flap(
        shoulder,
        [s * (-0.22 + i * 0.18), 0.04 - i * 0.085, 0.3],
        0.22,
        0.58 - i * 0.07,
        s,
        i % 2 ? m.red : m.blue,
      );
    const forearm = mount(`layered forearm ${s}`);
    turbine(forearm, [-s * 0.13, 0.1, 0.29], 0.13);
    flap(forearm, [-s * 0.13, -0.11, 0.34], 0.32, 0.77, s, m.red);
    for (let i = 0; i < 4; i++)
      cable(
        forearm,
        [
          [s * (-0.16 + i * 0.055), 0.3, 0.1],
          [s * (-0.24 + i * 0.06), -0.05, 0.19],
          [s * (-0.14 + i * 0.06), -0.37, 0.19],
        ],
        0.017,
        i === 1 ? m.brass : m.black,
      );
    const thigh = mount(`sculpted thigh ${s}`);
    turbine(thigh, [0, 0.08, 0.4], 0.18);
    flap(thigh, [-s * 0.18, 0.04, 0.42], 0.29, 0.65, s, m.blue);
    const shin = mount(`open shin mechanism ${s}`);
    turbine(shin, [0, -0.04, 0.35], 0.15);
    for (const side of [-1, 1])
      flap(shin, [side * 0.16, 0.2, 0.28], 0.18, 0.86, side, m.blue);
    // Complete articulated hands: five digits, three independently rotating links.
    const hand = mount(`segmented fist ${s}`);
    shell(
      hand,
      [
        [-0.15, 0.18, 0, 0],
        [0.06, 0.23, 0, 0.025],
        [0.19, 0.16, 0, -0.02],
      ],
      [0, 0, 0],
      m.gunmetal,
      [0, 0, 0],
      0.065,
      0.14,
    );
    for (let i = 0; i < 4; i++)
      plate(
        hand,
        0.075,
        0.2,
        0.035,
        [-0.165 + i * 0.11, 0.025, 0.15],
        m.steel,
        [0, 0, 0],
        "shield",
      );
    for (let digit = 0; digit < 5; digit++) {
      const thumb = digit === 4;
      let parent = pivot(
        hand,
        thumb
          ? [-s * 0.22, -0.01, 0.035]
          : [-0.165 + digit * 0.11, -0.14, 0.08],
      );
      if (thumb) parent.rotation.z = -s * 0.65;
      for (let joint = 0; joint < 3; joint++) {
        const length =
          (thumb ? 0.115 : [0.15, 0.18, 0.17, 0.14][digit]) *
          (1 - joint * 0.13);
        const phalanx = pivot(parent, [0, joint ? -0.12 : 0, 0]);
        cyl(phalanx, 0.043, 0.09, [0, 0, 0], m.gunmetal, "x");
        box(
          phalanx,
          [0.076, length, 0.065],
          [0, -length * 0.43, 0],
          m.steel,
          [0, 0, 0],
          0.01,
        );
        plate(
          phalanx,
          0.07,
          length * 0.7,
          0.02,
          [0, -length * 0.4, 0.043],
          m.chrome,
          [0, 0, 0],
          "shield",
        );
        for (const x of [-0.044, 0.044])
          cyl(phalanx, 0.024, 0.009, [x, 0, 0], m.brass, "x", 0.024, 8);
        batch(phalanx);
        fingers.push({ g: phalanx, digit, joint });
        parent = phalanx;
      }
    }
    // Shoulder hoses and segmented collar trim add mass at silhouette scale.
    const chest = mount(`windshield pectoral ${s}`);
    for (let i = 0; i < 4; i++)
      plate(
        chest,
        0.18,
        0.1,
        0.045,
        [s * 0.27, -0.48 + i * 0.11, 0.28],
        m.red,
        [0.1, s * 0.35, -s * 0.18],
        "shield",
      );
    turbine(chest, [-s * 0.17, -0.38, 0.34], 0.085);
  }
  const core = mount("sternum lock");
  turbine(core, [0, -0.06, 0.19], 0.13);
  const glow = new THREE.MeshStandardMaterial({
    color: "#72ddff",
    emissive: "#28bfff",
    emissiveIntensity: 2.5,
    metalness: 0.15,
    roughness: 0.25,
  });
  mesh(core, new THREE.IcosahedronGeometry(0.07, 1), glow, [0, -0.06, 0.28]);
  k.m.eye.color.set("#58cfff");
  const axis = new THREE.Vector3(0, 1, 0),
    a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    delta = new THREE.Vector3();
  let phase = 0,
    lastTime = 0;
  function pose(t, time, armor, grip, live) {
    if (live) phase += Math.max(0, Math.min(0.1, time - lastTime)) * 2.2;
    lastTime = time;
    const robot = 1 - THREE.MathUtils.smoothstep(t, 0.03, 0.25);
    const opening = armor * robot;
    for (const h of hinges) h.g.rotation[h.axis] = h.angle * opening;
    for (const r of rotors) r.rotation.z = phase;
    for (const f of fingers)
      f.g.rotation.x =
        0.12 +
        (grip + (live ? 0.13 * Math.sin(time * 1.7 + f.digit * 0.4) : 0)) *
          (f.joint ? 1.2 : 0.85);
    for (const link of actuators) {
      link.g.updateMatrix();
      b.copy(link.end).applyMatrix4(link.g.matrix);
      a.copy(link.anchor);
      const length = a.distanceTo(b);
      delta.subVectors(b, a).normalize();
      link.sleeve.position.copy(a).lerp(b, 0.25);
      link.shaft.position.copy(a).lerp(b, 0.75);
      link.sleeve.quaternion.setFromUnitVectors(axis, delta);
      link.shaft.quaternion.copy(link.sleeve.quaternion);
      link.sleeve.scale.y = link.shaft.scale.y = length * 0.5;
    }
    glow.emissiveIntensity = live ? 2 + Math.sin(time * 3) * 0.7 : 1;
  }
  return {
    pose,
    components: componentCount,
    hinges: hinges.length,
    fingerJoints: fingers.length,
    get phase() {
      return phase;
    },
  };
}
