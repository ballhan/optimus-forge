import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { movieDetail } from "./movie-detail.js";

// Inspection mechanisms: hinged armor covers, articulated hands, cooling
// rotors, and the chest radio array this scout talks through.
export function buildBeeMechanisms(k, parts) {
  const { mesh, box, cyl, rod, plate, m } = k;
  const { shell, torus, cable, gear } = movieDetail(k);
  const hinges = [],
    rotors = [],
    interior = [],
    fingers = [],
    actuators = [],
    bars = [];
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
    torus(g, r, 0.024, pos, m.steel);
    cyl(g, r * 0.94, 0.06, pos, m.black, "z");
    const spin = pivot(g, [pos[0], pos[1], pos[2] + 0.055]);
    cyl(spin, r * 0.26, 0.07, [0, 0, 0], m.brass, "z", r * 0.17, 16);
    // Box blades: an extruded profile this small would be swallowed by its bevel.
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      box(
        spin,
        [r * 0.26, r * 0.62, 0.02],
        [Math.sin(a) * r * 0.56, Math.cos(a) * r * 0.56, 0],
        m.steel,
        [0.22, 0.2, -a - 0.4],
        0.004,
      );
    }
    batch(spin);
    rotors.push(spin);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      cyl(
        g,
        0.014,
        0.028,
        [pos[0] + Math.sin(a) * r, pos[1] + Math.cos(a) * r, pos[2] + 0.014],
        m.chrome,
        "z",
        0.014,
        6,
      );
    }
  }
  function flap(parent, pos, w, h, side, material = m.yellow, axis = "y") {
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
    for (let i = 0; i < 4; i++)
      box(
        g,
        [w * 0.5, 0.012, 0.016],
        [side * w * 0.33, -h * 0.24 + i * h * 0.14, 0.072],
        m.gunmetal,
      );
    batch(g);
    hinges.push({ g, axis, angle: side * 1.3 });
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1, 8),
      m.gunmetal,
    );
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 1, 8),
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
        pos[2] - 0.14,
      ),
      end: new THREE.Vector3(side * w * 0.46, 0.11, -0.015),
    });
    return g;
  }
  const signal = new THREE.MeshStandardMaterial({
    color: "#ffd45e",
    emissive: "#ffae1c",
    emissiveIntensity: 1.8,
    metalness: 0.2,
    roughness: 0.3,
  });
  // Radio array: a column of lamps per channel, lit from the bottom up.
  function equalizer(g, pos, side) {
    const frame = pivot(g, pos);
    box(frame, [0.42, 0.34, 0.05], [0, 0, 0], m.black);
    torus(frame, 0.2, 0.014, [0, 0, 0.03], m.chrome);
    for (let channel = 0; channel < 5; channel++) {
      const x = -0.16 + channel * 0.08;
      for (let level = 0; level < 5; level++) {
        const lamp = box(
          frame,
          [0.05, 0.04, 0.02],
          [x, -0.12 + level * 0.06, 0.035],
          signal,
          [0, 0, 0],
          0.004,
        );
        bars.push({ lamp, channel: channel + (side > 0 ? 5 : 0), level });
      }
    }
    for (const x of [-0.19, 0.19])
      rod(frame, [x, -0.15, 0.03], [x, 0.15, 0.03], 0.012, m.steel);
    return frame;
  }
  for (const s of [-1, 1]) {
    const shoulder = mount(`shoulder actuator ${s}`);
    turbine(shoulder, [s * 0.04, 0.0, 0.26], 0.2);
    for (let i = 0; i < 2; i++)
      flap(
        shoulder,
        [s * (-0.16 + i * 0.2), 0.04 - i * 0.08, 0.24],
        0.2,
        0.5 - i * 0.07,
        s,
        i % 2 ? m.black : m.yellow,
      );
    const forearm = mount(`combat forearm ${s}`);
    turbine(forearm, [-s * 0.12, 0.12, 0.26], 0.12);
    flap(forearm, [-s * 0.12, -0.1, 0.3], 0.28, 0.66, s, m.yellow);
    for (let i = 0; i < 3; i++)
      cable(
        forearm,
        [
          [s * (-0.14 + i * 0.05), 0.28, 0.09],
          [s * (-0.22 + i * 0.055), -0.04, 0.17],
          [s * (-0.12 + i * 0.055), -0.34, 0.17],
        ],
        0.015,
        i === 1 ? m.brass : m.black,
      );
    const thigh = mount(`thigh strut ${s}`);
    turbine(thigh, [0, 0.06, 0.36], 0.16);
    flap(thigh, [-s * 0.16, 0.02, 0.38], 0.26, 0.58, s, m.yellow);
    const shin = mount(`shin frame ${s}`);
    turbine(shin, [0, -0.06, 0.32], 0.14);
    for (const side of [-1, 1])
      flap(shin, [side * 0.14, 0.18, 0.26], 0.16, 0.74, side, m.yellow);
    // Chest radio panels sit behind the hood armor.
    const chest = pivot(mount(`hood chest plate ${s}`), [0, 0, 0]);
    interior.push(chest);
    equalizer(chest, [s * 0.2, 0.1, 0.12], s);
    for (let i = 0; i < 3; i++)
      plate(
        chest,
        0.16,
        0.1,
        0.04,
        [s * 0.22, -0.4 + i * 0.12, 0.1],
        m.black,
        [0.1, s * 0.3, -s * 0.16],
        "shield",
      );
    turbine(chest, [-s * 0.17, -0.3, 0.12], 0.13);
    // Complete articulated hands: five digits, three independently rotating links.
    const hand = mount(`servo hand ${s}`);
    shell(
      hand,
      [
        [-0.14, 0.16, 0, 0],
        [0.05, 0.21, 0, 0.025],
        [0.17, 0.15, 0, -0.02],
      ],
      [0, 0, 0],
      m.gunmetal,
      [0, 0, 0],
      0.06,
      0.13,
    );
    for (let i = 0; i < 4; i++)
      plate(
        hand,
        0.07,
        0.18,
        0.03,
        [-0.15 + i * 0.1, 0.02, 0.14],
        m.steel,
        [0, 0, 0],
        "shield",
      );
    gear(hand, 0.085, [0, 0.21, 0.02], [0, 0, 0], 12);
    for (let digit = 0; digit < 5; digit++) {
      const thumb = digit === 4;
      let parent = pivot(
        hand,
        thumb ? [-s * 0.2, -0.01, 0.03] : [-0.15 + digit * 0.1, -0.13, 0.07],
      );
      if (thumb) parent.rotation.z = -s * 0.65;
      for (let joint = 0; joint < 3; joint++) {
        const length =
          (thumb ? 0.105 : [0.14, 0.17, 0.155, 0.13][digit]) *
          (1 - joint * 0.13);
        const phalanx = pivot(parent, [0, joint ? -0.11 : 0, 0]);
        cyl(phalanx, 0.04, 0.082, [0, 0, 0], m.gunmetal, "x");
        box(
          phalanx,
          [0.07, length, 0.06],
          [0, -length * 0.43, 0],
          m.steel,
          [0, 0, 0],
          0.01,
        );
        plate(
          phalanx,
          0.064,
          length * 0.7,
          0.018,
          [0, -length * 0.4, 0.04],
          m.chrome,
          [0, 0, 0],
          "shield",
        );
        for (const x of [-0.04, 0.04])
          cyl(phalanx, 0.022, 0.008, [x, 0, 0], m.brass, "x", 0.022, 8);
        batch(phalanx);
        fingers.push({ g: phalanx, digit, joint });
        parent = phalanx;
      }
    }
  }
  const core = mount("spinal column");
  turbine(core, [0, 0.3, 0.22], 0.12);
  const glow = new THREE.MeshStandardMaterial({
    color: "#ffd27a",
    emissive: "#ffb32a",
    emissiveIntensity: 2.5,
    metalness: 0.15,
    roughness: 0.25,
  });
  mesh(core, new THREE.IcosahedronGeometry(0.075, 1), glow, [0, 0.06, 0.24]);
  const axis = new THREE.Vector3(0, 1, 0),
    a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    delta = new THREE.Vector3();
  let phase = 0,
    lastTime = 0;
  function pose(t, time, armor, grip, live) {
    if (live) phase += Math.max(0, Math.min(0.1, time - lastTime)) * 2.6;
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
    // Each channel holds a level; lamps below it read lit, the rest read dark.
    for (const bar of bars) {
      const level = live
        ? 2.6 +
          2.2 * Math.sin(time * 5.5 + bar.channel * 1.3) * Math.sin(time * 2.1)
        : 1.2;
      const lit = bar.level < level;
      bar.lamp.material = lit ? signal : m.black;
    }
    for (const g of interior) g.visible = robot > 0.15;
    signal.emissiveIntensity = live ? 2.4 : 0.7;
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
