import * as THREE from "three";
import { movieDetail } from "./movie-detail.js";

// Detail stays inside its moving assembly and is included in material batching.
export function precisionDetail(k, parts) {
  const { box, cyl, rod, mesh, m } = k;
  const { torus, cable } = movieDetail(k);
  const part = (name) => parts.find((p) => p.g.name === name)?.g;
  const probe = new THREE.Raycaster();
  const direction = new THREE.Vector3(0, 0, -1);
  function fastener(g, x, y, z, r = 0.018) {
    // Seat hardware against the curved armor instead of leaving floating bolts.
    g.updateMatrixWorld(true);
    probe.set(new THREE.Vector3(x, y, z + 0.12), direction);
    probe.far = 0.24;
    const hit = probe.intersectObjects(g.children, true)[0];
    if (!hit) return;
    z = hit.point.z + 0.003;
    cyl(g, r * 1.45, 0.009, [x, y, z], m.black, "z", r * 1.45, 12);
    cyl(g, r, 0.017, [x, y, z + 0.009], m.steel, "z", r, 6);
    box(
      g,
      [r * 0.85, 0.004, 0.004],
      [x, y, z + 0.019],
      m.black,
      [0, 0, 0.3],
      0,
    );
  }
  function grille(g, pos, w, h) {
    box(g, [w, h, 0.025], pos, m.black);
    for (let i = 0; i < 9; i++)
      box(
        g,
        [w * 0.88, 0.011, 0.025],
        [pos[0], pos[1] - h * 0.4 + i * h * 0.1, pos[2] + 0.02],
        m.steel,
      );
    for (const x of [-1, 1])
      for (const y of [-1, 1])
        fastener(
          g,
          pos[0] + x * w * 0.44,
          pos[1] + y * h * 0.44,
          pos[2] + 0.031,
          0.013,
        );
  }
  for (const s of [-1, 1]) {
    const chest = part(`windshield pectoral ${s}`);
    for (const x of [-0.33, 0.33])
      for (const y of [-0.02, 0.38]) fastener(chest, x, y, 0.295, 0.014);
    grille(chest, [-s * 0.03, -0.47, 0.363], 0.18, 0.095);
    // Window gasket and twin wiper hinges.
    for (const x of [-0.34, 0.34])
      rod(chest, [x, 0.015, 0.304], [x, 0.345, 0.304], 0.009, m.black);
    cyl(chest, 0.026, 0.028, [-s * 0.22, 0.025, 0.317], m.gunmetal, "z");
    const arm = part(`layered forearm ${s}`);
    for (let i = 0; i < 5; i++)
      fastener(arm, s * 0.24, -0.34 + i * 0.14, 0.33, 0.016);
    grille(arm, [s * 0.13, 0.16, 0.347], 0.19, 0.18);
    for (let i = 0; i < 3; i++)
      cable(
        arm,
        [
          [s * (-0.12 + i * 0.05), 0.34, 0.19],
          [s * (-0.2 + i * 0.05), 0.08, 0.27],
          [s * (-0.18 + i * 0.05), -0.32, 0.28],
        ],
        0.012,
        i === 1 ? m.brass : m.black,
      );
    const shin = part(`open shin mechanism ${s}`);
    for (let i = 0; i < 7; i++) {
      const y = -0.48 + i * 0.15;
      box(
        shin,
        [0.095, 0.05, 0.032],
        [-s * 0.04, y, 0.31],
        m.steel,
        [0, 0, s * 0.12],
        0.004,
      );
      fastener(shin, s * 0.31, y, 0.24, 0.016);
    }
    grille(shin, [s * 0.3, 0.3, 0.24], 0.12, 0.26);
    const thigh = part(`sculpted thigh ${s}`);
    for (let i = 0; i < 5; i++)
      fastener(thigh, s * 0.19, -0.27 + i * 0.12, 0.27, 0.014);
    const shoulder = part(`swept shoulder hood ${s}`);
    for (let i = 0; i < 5; i++)
      fastener(shoulder, s * (0.09 + i * 0.048), -0.2 + i * 0.08, 0.25, 0.014);
    const foot = part(`three prong foot ${s}`);
    for (const x of [-0.2, 0.2])
      for (let i = 0; i < 4; i++)
        box(
          foot,
          [0.22, 0.026, 0.022],
          [x, 0.033, 0.18 + i * 0.1],
          m.gunmetal,
          [0, 0, 0],
          0.003,
        );
    const exhaust = part(`exhaust ${s}`);
    for (let i = 0; i < 8; i++) {
      torus(exhaust, 0.102, 0.009, [0, -0.4 + i * 0.1, 0], m.steel, [
        Math.PI / 2,
        0,
        0,
      ]);
      for (const x of [-0.035, 0.035])
        cyl(
          exhaust,
          0.015,
          0.008,
          [x, -0.37 + i * 0.1, 0.1],
          m.black,
          "z",
          0.015,
          8,
        );
    }
    const tank = part(`fuel reservoir ${s}`);
    cyl(tank, 0.065, 0.055, [0, 0.28, 0.16], m.chrome, "z", 0.065, 16);
    fastener(tank, 0, 0.28, 0.19, 0.02);
  }
  const radiator = part("radiator");
  for (let i = 0; i < 9; i++)
    for (const x of [-0.69, 0.69])
      fastener(radiator, x, -0.44 + i * 0.11, 0.09, 0.013);
  const bumper = part("bumper");
  for (const x of [-0.96, -0.81, 0.81, 0.96])
    fastener(bumper, x, 0, 0.102, 0.026);
  const spine = part("vertebral frame");
  for (const s of [-1, 1])
    for (let i = 0; i < 3; i++)
      cable(
        spine,
        [
          [s * (0.13 + i * 0.04), -0.57, 0.21],
          [s * (0.24 + i * 0.04), -0.17, 0.28],
          [s * (0.28 + i * 0.04), 0.28, 0.23],
        ],
        0.014,
        i === 1 ? m.brass : m.black,
      );
}
