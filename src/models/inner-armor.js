import { movieDetail } from "./movie-detail.js";

// Close the silhouette with layered inner armor. These shallow shells travel
// with the existing joints rather than forming a rigid block across them.
export function innerArmor(k, parts) {
  const { box, cyl, rod, plate, m } = k;
  const { shell, cable, torus } = movieDetail(k);
  const get = (name) => parts.find((p) => p.g.name === name)?.g;
  const spine = get("vertebral frame");
  shell(
    spine,
    [
      [-0.68, 0.18, 0, 0],
      [-0.3, 0.33, 0, -0.03],
      [0.1, 0.55, 0, -0.06],
      [0.57, 0.67, 0, -0.08],
    ],
    [0, 0, -0.08],
    m.gunmetal,
    [0, 0, 0],
    0.09,
    0.06,
  );
  // Interleaved abdominal plates cover sightlines while preserving seams.
  for (let i = 0; i < 6; i++) {
    const y = -0.51 + i * 0.145,
      w = 0.28 + i * 0.047;
    for (const s of [-1, 1]) {
      plate(
        spine,
        w,
        0.18,
        0.045,
        [s * (0.1 + w * 0.32), y, 0.2],
        i % 2 ? m.steel : m.gunmetal,
        [0.13, s * 0.2, -s * 0.27],
        "shield",
      );
      rod(
        spine,
        [s * 0.13, y - 0.015, 0.25],
        [s * (0.23 + w * 0.6), y + 0.065, 0.17],
        0.025,
        m.steel,
      );
    }
  }
  // Collar seat eliminates the exposed stick-like neck.
  const head = get("segmented movie helmet");
  cyl(head, 0.18, 0.18, [0, -0.36, -0.015], m.gunmetal, "y", 0.22, 24);
  for (let i = 0; i < 4; i++)
    torus(head, 0.17, 0.018, [0, -0.41 + i * 0.035, -0.015], m.steel, [
      Math.PI / 2,
      0,
      0,
    ]);
  for (const s of [-1, 1]) {
    const chest = get(`windshield pectoral ${s}`);
    shell(
      chest,
      [
        [-0.6, 0.19, 0, 0],
        [-0.24, 0.3, 0, -0.03],
        [0.28, 0.37, 0, -0.07],
      ],
      [0, 0, -0.04],
      m.gunmetal,
      [0, 0, 0],
      0.04,
      0.055,
    );
    // Folded flanges give the red chest stamping a visible return edge.
    for (let i = 0; i < 3; i++)
      plate(
        chest,
        0.15,
        0.22,
        0.045,
        [s * 0.24, -0.39 + i * 0.13, 0.16],
        m.red,
        [0, s * 0.4, -s * 0.12],
        "shield",
      );
    const arm = get(`brachial actuator ${s}`);
    shell(
      arm,
      [
        [-0.36, 0.16, 0, 0],
        [-0.12, 0.22, 0, 0.015],
        [0.27, 0.2, 0, 0],
      ],
      [0, 0, -0.02],
      m.gunmetal,
      [0, 0, 0],
      0.08,
      0.08,
    );
    for (let i = 0; i < 4; i++)
      plate(
        arm,
        0.24,
        0.105,
        0.045,
        [0, -0.23 + i * 0.12, 0.225],
        m.steel,
        [0.25, 0, s * 0.1],
        "shield",
      );
    const forearm = get(`layered forearm ${s}`);
    shell(
      forearm,
      [
        [-0.42, 0.16, 0, -0.03],
        [-0.12, 0.25, 0, 0],
        [0.28, 0.23, 0, -0.04],
      ],
      [0, 0, -0.08],
      m.gunmetal,
      [0, Math.PI, 0],
      0.075,
      0.065,
    );
    const thigh = get(`sculpted thigh ${s}`);
    shell(
      thigh,
      [
        [-0.39, 0.2, 0, -0.025],
        [-0.11, 0.28, -s * 0.025, 0.035],
        [0.23, 0.29, 0, 0],
        [0.39, 0.19, s * 0.02, -0.03],
      ],
      [-s * 0.025, 0, 0.18],
      m.blue,
      [0, -s * 0.18, 0],
      0.115,
      0.045,
    );
    for (let i = 0; i < 3; i++)
      plate(
        thigh,
        0.2,
        0.09,
        0.028,
        [-s * 0.06, -0.18 + i * 0.12, 0.34],
        m.steel,
        [0.15, 0, -s * 0.12],
        "shield",
      );
    const shin = get(`open shin mechanism ${s}`);
    shell(
      shin,
      [
        [-0.56, 0.18, 0, 0],
        [-0.1, 0.25, 0, -0.015],
        [0.54, 0.2, 0, -0.025],
      ],
      [0, 0, -0.12],
      m.gunmetal,
      [0, Math.PI, 0],
      0.08,
      0.055,
    );
    for (let i = 0; i < 5; i++) {
      plate(
        shin,
        0.23,
        0.16,
        0.035,
        [-s * 0.025, -0.4 + i * 0.2, 0.19],
        m.gunmetal,
        [0.16, 0, s * 0.15],
        "shield",
      );
      rod(
        shin,
        [s * 0.12, -0.46 + i * 0.2, 0.22],
        [s * 0.25, -0.39 + i * 0.2, 0.15],
        0.025,
        m.steel,
      );
    }
    const shoulder = get(`swept shoulder hood ${s}`);
    shell(
      shoulder,
      [
        [-0.3, 0.25, s * 0.09, -0.04],
        [0, 0.35, 0, 0],
        [0.25, 0.16, -s * 0.1, -0.08],
      ],
      [0, 0, -0.11],
      m.gunmetal,
      [0, Math.PI, 0],
      0.05,
      0.045,
    );
    const pelvis = get("pelvis transmission");
    shell(
      pelvis,
      [
        [-0.28, 0.14, 0, -0.02],
        [0.04, 0.2, 0, 0.02],
        [0.25, 0.14, 0, 0],
      ],
      [s * 0.26, -0.06, 0.11],
      m.gunmetal,
      [0, s * 0.25, -s * 0.12],
      0.05,
      0.04,
    );
    cable(
      spine,
      [
        [s * 0.42, -0.25, 0.03],
        [s * 0.57, 0.08, 0.06],
        [s * 0.62, 0.4, 0],
      ],
      0.04,
      m.black,
    );
  }
}
