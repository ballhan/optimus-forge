import * as THREE from "three";
import { movieDetail } from "./movie-detail.js";

// Original procedural interpretation of a 2007-era scout Autobot whose
// alternate mode is a muscle coupe. Geometry is authored in robot orientation
// around each assembly's own robot-mode position; the vehicle-mode placement
// and rotation come from the rig() endpoints.
//
// Robot landmarks: crown 5.02, shoulders 4.05, chest 3.85, pelvis 2.72,
// knees 1.58, ankles 0.48. Coupe landmarks: wheels y 0.44 (r 0.42) at
// z ±1.5, sills y 0.36, beltline y 1.02, hood y 1.05, roof y 1.53.
export function buildBeeRig(k) {
  const { mesh, box, cyl, rod, plate, vents, wheel, rig, m } = k;
  const { cable, torus, gear, piston, shell, feather, rib, engine, armorCuts } =
    movieDetail(k);
  const rad = Math.PI / 2;

  // Seated hardware: a bolt head sunk onto whatever surface is behind it.
  const probe = new THREE.Raycaster();
  const back = new THREE.Vector3(0, 0, -1);
  function fastener(g, x, y, z, r = 0.016) {
    g.updateMatrixWorld(true);
    probe.set(new THREE.Vector3(x, y, z + 0.12), back);
    probe.far = 0.24;
    const hit = probe.intersectObjects(g.children, true)[0];
    if (!hit) return;
    z = hit.point.z + 0.003;
    cyl(g, r * 1.45, 0.009, [x, y, z], m.black, "z", r * 1.45, 12);
    cyl(g, r, 0.017, [x, y, z + 0.009], m.steel, "z", r, 6);
  }
  function louvres(g, pos, w, h, count = 6) {
    box(g, [w, h, 0.03], pos, m.black);
    for (let i = 0; i < count; i++)
      box(
        g,
        [w * 0.9, h / count / 2.4, 0.03],
        [pos[0], pos[1] - h * 0.4 + (i * h * 0.8) / (count - 1), pos[2] + 0.024],
        m.steel,
        [0.35, 0, 0],
        0.004,
      );
  }
  // Racing-stripe skins share one vehicle-space projection, so the bands stay
  // continuous across separately articulated panels.
  function stripedPanel(g, w, d, pos, rot = [0, 0, 0], thickness = 0.055) {
    return box(g, [w, thickness, d], pos, m.stripe, rot, 0.02);
  }

  const pelvis = rig("pelvis core", [0, 2.72, -0.05], [0, 0.66, -0.52], 0.3, 0.8);
  box(pelvis, [0.86, 0.46, 0.54], [0, 0, 0], m.gunmetal);
  box(pelvis, [0.5, 0.2, 0.44], [0, -0.28, 0.02], m.steel, [0, 0, 0], 0.06);
  engine(pelvis, [0, 0.04, -0.12], 0.62);
  for (const s of [-1, 1]) {
    gear(pelvis, 0.19, [s * 0.43, 0.02, 0.04], [0, s * rad, 0], 18);
    piston(pelvis, [s * 0.15, 0.14, 0.18], [s * 0.34, -0.26, 0.08], 0.04);
    torus(pelvis, 0.075, 0.022, [s * 0.24, 0.24, 0.2], m.chrome);
    feather(pelvis, [s * 0.38, -0.16, 0.16], 0.33, 0.52, m.yellow, [
      0,
      s * 0.3,
      -s * 0.22,
    ]);
    cable(
      pelvis,
      [
        [s * 0.1, 0.24, 0.16],
        [s * 0.28, 0.02, 0.22],
        [s * 0.22, -0.24, 0.18],
      ],
      0.026,
      m.gunmetal,
    );
  }
  plate(pelvis, 0.42, 0.3, 0.06, [0, -0.16, 0.3], m.yellow, [0, 0, 0], "shield");

  const spine = rig(
    "spinal column",
    [0, 3.5, -0.12],
    [0, 0.8, 0.02],
    0.26,
    0.78,
    [rad, 0, 0],
  );
  box(spine, [0.32, 1.06, 0.34], [0, 0, 0], m.gunmetal);
  for (let i = 0; i < 8; i++) {
    const y = -0.42 + i * 0.12;
    plate(spine, 0.26, 0.09, 0.1, [0, y, 0.19], m.steel, [0.16, 0, 0], "shield");
    cyl(spine, 0.04, 0.09, [0, y, 0.28], m.black, "z");
  }
  engine(spine, [0, 0.12, 0.02], 0.62);
  for (const s of [-1, 1]) {
    piston(spine, [s * 0.12, -0.4, 0.14], [s * 0.4, 0.38, 0.04], 0.042);
    cable(
      spine,
      [
        [s * 0.1, -0.48, 0.16],
        [s * 0.32, -0.1, 0.2],
        [s * 0.44, 0.34, 0.04],
      ],
      0.03,
      m.gunmetal,
    );
    rib(spine, [s * 0.2, -0.3, -0.12], [s * 0.26, 0.36, -0.14], 0.05);
    for (let i = 0; i < 3; i++)
      rod(
        spine,
        [s * 0.12, -0.24 + i * 0.2, 0.2],
        [s * (0.3 + i * 0.04), -0.08 + i * 0.2, 0.1],
        0.03,
        m.chrome,
      );
  }

  // Split hood halves form the pectorals; their outer edges keep the stripe run.
  for (const s of [-1, 1]) {
    const chest = rig(
      `hood chest plate ${s}`,
      [s * 0.48, 3.62, 0.26],
      [s * 0.48, 1.03, 1.46],
      0.18,
      0.74,
      [-rad * 0.99, 0, 0],
      [0.14, s * 0.16, -s * 0.12],
      [s * 0.2, 0.16, 0.26],
    );
    stripedPanel(chest, 0.96, 1.34, [0, 0, 0], [rad, 0, 0]);
    shell(
      chest,
      [
        [-0.52, 0.42, 0, 0],
        [-0.14, 0.46, 0, 0.035],
        [0.3, 0.43, 0, 0.01],
        [0.56, 0.32, -s * 0.03, -0.05],
      ],
      [0, 0, 0.02],
      m.stripe,
      [0, 0, 0],
      0.035,
      0.05,
    );
    // Cowl scoop and hood pins sit proud of the skin.
    box(chest, [0.3, 0.16, 0.16], [-s * 0.16, 0.34, 0.08], m.black, [0.25, 0, 0]);
    for (const y of [-0.44, 0.44]) fastener(chest, s * 0.3, y, 0.12, 0.022);
    armorCuts(chest, [s * 0.2, -0.14, 0.1], 0.26, 0.36);
    plate(
      chest,
      0.32,
      0.3,
      0.02,
      [s * 0.24, -0.4, 0.05],
      m.black,
      [0, 0, -s * 0.1],
      "shield",
    );
    for (let i = 0; i < 3; i++)
      rod(
        chest,
        [-s * 0.3, -0.44 + i * 0.26, 0.05],
        [-s * 0.34, -0.26 + i * 0.26, 0.05],
        0.016,
        m.chrome,
      );
  }

  const canopy = rig(
    "windshield collar",
    [0, 4.0, 0.14],
    [0, 1.27, 0.5],
    0.2,
    0.72,
    [-0.95, 0, 0],
    [0.34, 0, 0],
  );
  box(canopy, [1.5, 0.62, 0.07], [0, 0, 0], m.gunmetal, [0, 0, 0], 0.03);
  plate(canopy, 1.4, 0.55, 0.03, [0, 0, 0.05], m.glass, [0, 0, 0], "window");
  for (const s of [-1, 1]) {
    rod(canopy, [s * 0.68, -0.3, 0.05], [s * 0.6, 0.3, 0.05], 0.018, m.black);
    cyl(canopy, 0.03, 0.03, [s * 0.2, -0.32, 0.07], m.gunmetal, "z");
    rod(canopy, [s * 0.2, -0.3, 0.08], [s * 0.05, 0.14, 0.08], 0.011, m.black);
  }
  box(canopy, [1.42, 0.06, 0.05], [0, 0.32, 0.03], m.black);

  const roof = rig(
    "roof shell",
    [0, 4.22, -0.46],
    [0, 1.47, -0.4],
    0.12,
    0.66,
    [-rad, 0, 0],
    [-0.08, 0, 0],
    [0, 0.22, -0.2],
  );
  stripedPanel(roof, 1.54, 1.52, [0, 0, 0], [rad, 0, 0], 0.07);
  for (const s of [-1, 1]) {
    box(roof, [0.08, 1.46, 0.1], [s * 0.74, 0, 0.02], m.black);
    rib(roof, [s * 0.52, -0.68, -0.07], [s * 0.52, 0.66, -0.07], 0.045);
  }
  plate(roof, 1.26, 0.54, 0.04, [0, 0.42, -0.05], m.glass, [0, 0, 0], "window");
  vents(roof, [0, -0.54, 0.03], 0.4, 0.14, 5);

  for (const s of [-1, 1]) {
    // Fastback sails close the rear quarter; on the robot they are back blades.
    const sail = rig(
      `sail panel ${s}`,
      [s * 0.54, 4.02, -0.66],
      [s * 0.52, 1.24, -1.24],
      0.16,
      0.7,
      [0, 0, 0],
      [0.1, -s * 0.34, s * 0.22],
      [s * 0.16, 0.16, -0.24],
    );
    box(sail, [0.1, 0.52, 0.94], [0, 0, 0], m.stripe, [0, 0, 0], 0.03);
    shell(
      sail,
      [
        [-0.44, 0.24, 0, 0],
        [-0.02, 0.27, 0, 0.03],
        [0.42, 0.16, 0, -0.03],
      ],
      [s * 0.07, 0.02, 0],
      m.yellow,
      [0, -s * rad, rad],
      0.05,
      0.05,
    );
    plate(
      sail,
      0.62,
      0.3,
      0.03,
      [s * 0.02, 0.1, 0.12],
      m.glass,
      [0, s * rad, 0],
      "window",
    );
    box(sail, [0.07, 0.1, 0.9], [s * 0.05, 0.25, 0], m.black);
    box(sail, [0.09, 0.14, 0.24], [s * 0.04, -0.2, -0.3], m.chrome, [0, 0, 0], 0.02);
    for (let i = 0; i < 3; i++)
      cyl(
        sail,
        0.016,
        0.012,
        [s * 0.056, -0.16, -0.24 + i * 0.24],
        m.steel,
        "x",
        0.016,
        6,
      );
  }

  for (const s of [-1, 1]) {
    // Doors swing up and back to become the wing shoulders.
    const wing = rig(
      `door wing ${s}`,
      [s * 1.02, 4.16, -0.56],
      [s * 1.0, 0.84, -0.26],
      0.1,
      0.7,
      [0, 0, 0],
      [0.3, s * 0.3, -s * 0.46],
      [s * 0.34, 0.2, -0.22],
    );
    box(wing, [0.09, 0.66, 1.34], [0, 0, 0], m.stripe, [0, 0, 0], 0.03);
    shell(
      wing,
      [
        [-0.63, 0.27, 0, 0],
        [-0.18, 0.3, 0, 0.02],
        [0.32, 0.29, 0, 0.005],
        [0.62, 0.18, 0, -0.04],
      ],
      [s * 0.07, 0, 0],
      m.yellow,
      [0, -s * rad, rad],
      0.06,
      0.05,
    );
    plate(
      wing,
      0.98,
      0.5,
      0.03,
      [-s * 0.12, 0.44, 0],
      m.glass,
      [0, s * rad, 0],
      "window",
    );
    box(wing, [0.08, 0.08, 1.0], [s * 0.05, 0.24, 0], m.black);
    box(wing, [0.12, 0.05, 0.24], [s * 0.07, -0.02, 0.24], m.chrome);
    // Mirror stalk and sill trim.
    box(wing, [0.16, 0.13, 0.1], [s * 0.15, 0.32, 0.58], m.black, [0, 0, s * 0.2]);
    box(wing, [0.06, 0.32, 1.24], [0, -0.34, 0], m.black, [0, 0, 0], 0.02);
    for (let i = 0; i < 4; i++)
      cyl(
        wing,
        0.017,
        0.012,
        [s * 0.052, -0.18, -0.44 + i * 0.3],
        m.steel,
        "x",
        0.017,
        6,
      );

    const shoulder = rig(
      `shoulder actuator ${s}`,
      [s * 1.06, 4.0, -0.06],
      [s * 0.66, 0.84, 0.64],
      0.12,
      0.68,
      [rad, 0, 0],
      [0, 0, -s * 0.08],
      [s * 0.3, 0.3, 0.1],
    );
    gear(shoulder, 0.26, [0, 0.02, 0], [0, s * rad, 0]);
    cyl(shoulder, 0.2, 0.34, [0, 0, 0], m.gunmetal, "x");
    torus(shoulder, 0.21, 0.03, [s * 0.17, 0, 0], m.chrome, [0, rad, 0]);
    shell(
      shoulder,
      [
        [-0.32, 0.26, s * 0.1, -0.06],
        [-0.04, 0.34, 0, 0.02],
        [0.26, 0.26, -s * 0.1, -0.05],
      ],
      [s * 0.16, 0.04, 0.04],
      m.yellow,
      [0, 0, 0],
      0.16,
      0.06,
    );
    for (let i = 0; i < 4; i++)
      rod(
        shoulder,
        [-s * 0.16, 0.1 - i * 0.08, -0.1],
        [s * 0.12, -0.02 - i * 0.06, -0.1],
        0.02,
        m.steel,
      );
    piston(shoulder, [-s * 0.2, 0.1, 0.06], [s * 0.2, -0.2, 0.02], 0.036);

    const arm = rig(
      `upper arm ${s}`,
      [s * 1.14, 3.52, -0.02],
      [s * 0.6, 0.66, 0.16],
      0.16,
      0.72,
      [rad, 0, 0],
      [0, 0, -s * 0.06],
      [s * 0.22, 0.06, -0.24],
    );
    box(arm, [0.28, 0.6, 0.3], [0, 0, -0.02], m.gunmetal);
    shell(
      arm,
      [
        [-0.34, 0.2, 0, 0],
        [-0.02, 0.25, s * 0.02, 0.03],
        [0.3, 0.22, 0, 0],
      ],
      [0, 0, 0.1],
      m.yellow,
      [0, 0, 0],
      0.12,
      0.05,
    );
    piston(arm, [-s * 0.15, 0.26, 0.12], [-s * 0.16, -0.28, 0.14], 0.05);
    cable(
      arm,
      [
        [s * 0.16, 0.3, -0.04],
        [s * 0.24, 0.05, 0.08],
        [s * 0.16, -0.3, 0.05],
      ],
      0.036,
      m.gunmetal,
    );
    gear(arm, 0.16, [0, -0.3, 0.04], [0, 0, 0], 14);
    for (let i = 0; i < 3; i++)
      plate(
        arm,
        0.22,
        0.12,
        0.04,
        [0, 0.16 - i * 0.14, 0.2],
        m.steel,
        [0.18, 0, -s * 0.1],
        "shield",
      );

    // The right forearm carries the plasma cannon barrel; both keep a hand.
    const forearm = rig(
      `combat forearm ${s}`,
      [s * 1.2, 2.8, 0.02],
      [s * 0.62, 0.62, -0.5],
      0.2,
      0.78,
      [rad, 0, s * 0.12],
      [0, -s * 0.08, -s * 0.1],
      [s * 0.42, 0.08, 0.14],
    );
    box(forearm, [0.3, 0.58, 0.32], [0, 0.02, 0], m.gunmetal);
    shell(
      forearm,
      [
        [-0.36, 0.22, 0, 0],
        [-0.06, 0.27, s * 0.03, 0.03],
        [0.28, 0.24, s * 0.08, -0.02],
      ],
      [s * 0.08, 0, 0.14],
      m.yellow,
      [0, -s * 0.18, 0],
      0.12,
      0.05,
    );
    engine(forearm, [0, -0.02, -0.04], 0.55);
    armorCuts(forearm, [s * 0.08, -0.1, 0.3], 0.22, 0.36);
    piston(forearm, [-s * 0.16, 0.26, 0.18], [-s * 0.14, -0.28, 0.2], 0.038);
    if (s === 1) {
      cyl(forearm, 0.13, 0.62, [s * 0.04, -0.34, 0.12], m.gunmetal, "y", 0.16, 24);
      cyl(forearm, 0.1, 0.16, [s * 0.04, -0.66, 0.12], m.black, "y", 0.13, 24);
      for (let i = 0; i < 4; i++)
        torus(forearm, 0.15, 0.018, [s * 0.04, -0.2 - i * 0.12, 0.12], m.chrome, [
          rad,
          0,
          0,
        ]);
      for (let i = 0; i < 3; i++)
        cyl(forearm, 0.035, 0.24, [s * 0.16, -0.3 - i * 0.02, 0.24], m.brass);
    } else {
      for (let i = 0; i < 4; i++)
        plate(
          forearm,
          0.14,
          0.16,
          0.04,
          [s * 0.22, -0.22 + i * 0.16, 0.14],
          m.gunmetal,
          [0, s * 0.4, -s * 0.18],
          "blade",
        );
    }
    const hand = rig(
      `servo hand ${s}`,
      [s * 1.24, 2.16, 0.04],
      [s * 0.6, 0.6, -1.12],
      0.02,
      0.44,
      [rad, 0, 0],
      [0.1, 0, -s * 0.12],
    );
    // Palm and finger chains are installed after static batching.
    cyl(hand, 0.1, 0.16, [0, 0.2, 0], m.chrome, "x");

    const thigh = rig(
      `thigh strut ${s}`,
      [s * 0.5, 2.18, -0.02],
      [s * 0.5, 0.62, -1.1],
      0.3,
      0.8,
      [rad, 0, 0],
      [0, s * 0.05, -s * 0.05],
      [s * 0.14, 0.18, -0.12],
    );
    gear(thigh, 0.19, [0, 0.36, 0], [0, s * rad, 0]);
    rod(thigh, [0, -0.36, 0], [0, 0.34, 0], 0.13, m.gunmetal);
    shell(
      thigh,
      [
        [-0.4, 0.2, 0, 0],
        [-0.08, 0.26, 0, 0.03],
        [0.28, 0.27, s * 0.03, 0],
        [0.42, 0.18, s * 0.05, -0.04],
      ],
      [0, 0, 0.13],
      m.steel,
      [0, 0, s * 0.04],
      0.1,
      0.09,
    );
    piston(thigh, [-s * 0.14, 0.28, 0.22], [-s * 0.12, -0.32, 0.22], 0.036);
    cable(
      thigh,
      [
        [s * 0.15, 0.36, -0.14],
        [s * 0.3, 0.08, -0.04],
        [s * 0.26, -0.26, 0.04],
      ],
      0.03,
      m.gunmetal,
    );
    for (let i = 0; i < 3; i++)
      plate(
        thigh,
        0.24,
        0.12,
        0.04,
        [0, -0.12 + i * 0.12, 0.26],
        i % 2 ? m.gunmetal : m.steel,
        [0.2, 0, -s * 0.05],
        "shield",
      );

    // Rear quarter panels wrap the outer thigh.
    const haunch = rig(
      `quarter haunch ${s}`,
      [s * 0.84, 2.36, -0.14],
      [s * 0.97, 0.94, -1.4],
      0.26,
      0.8,
      [0, 0, 0],
      [0.12, -s * 0.42, s * 0.3],
      [s * 0.3, 0.12, -0.22],
    );
    shell(
      haunch,
      [
        [-0.66, 0.34, 0, 0],
        [-0.12, 0.42, 0, 0.04],
        [0.38, 0.38, 0, 0.01],
        [0.68, 0.22, 0, -0.06],
      ],
      [0, 0, 0],
      m.stripe,
      [0, -s * rad, rad],
      0.05,
      0.06,
    );
    box(haunch, [0.07, 0.46, 1.22], [0, -0.18, 0], m.yellow, [0, 0, 0], 0.03);
    box(haunch, [0.08, 0.2, 1.16], [0, -0.44, 0], m.black, [0, 0, 0], 0.02);
    louvres(haunch, [s * 0.06, 0.06, 0.42], 0.24, 0.2, 4);
    for (let i = 0; i < 3; i++)
      cyl(
        haunch,
        0.017,
        0.012,
        [s * 0.05, -0.3 + i * 0.22, 0.4],
        m.steel,
        "x",
        0.017,
        6,
      );

    const knee = rig(
      `knee cowl ${s}`,
      [s * 0.58, 1.6, 0.04],
      [s * 0.95, 0.94, 1.44],
      0.32,
      0.84,
      [0, 0, 0],
      [0, -s * 0.28, 0],
      [s * 0.28, 0.24, 0.3],
    );
    gear(knee, 0.2, [0, 0, 0.1], [0, 0, 0], 18);
    shell(
      knee,
      [
        [-0.5, 0.3, 0, 0],
        [-0.04, 0.36, 0, 0.05],
        [0.5, 0.28, 0, -0.02],
      ],
      [s * 0.04, 0, 0],
      m.yellow,
      [0, -s * rad, rad],
      0.12,
      0.06,
    );
    box(knee, [0.07, 0.4, 0.96], [0, -0.16, 0], m.black, [0, 0, 0], 0.02);
    torus(knee, 0.26, 0.035, [s * 0.06, -0.04, 0], m.steel, [0, rad, 0]);
    piston(knee, [-s * 0.1, 0.22, 0.12], [-s * 0.14, -0.18, 0.1], 0.03);

    const shin = rig(
      `shin frame ${s}`,
      [s * 0.58, 1.04, -0.02],
      [s * 0.55, 0.6, -1.82],
      0.34,
      0.86,
      [rad, 0, 0],
      [0.04, 0, -s * 0.04],
      [s * 0.2, 0.22, -0.14],
    );
    box(shin, [0.3, 1.1, 0.34], [0, 0, -0.03], m.gunmetal);
    piston(shin, [-s * 0.08, 0.48, 0.14], [-s * 0.08, -0.44, 0.2], 0.068);
    piston(shin, [s * 0.16, 0.44, 0.02], [s * 0.2, -0.48, 0.02], 0.048);
    shell(
      shin,
      [
        [-0.56, 0.2, 0, 0],
        [-0.16, 0.27, s * 0.03, 0.04],
        [0.34, 0.26, 0, 0],
        [0.6, 0.14, -s * 0.05, -0.06],
      ],
      [s * 0.04, 0.02, 0.18],
      m.yellow,
      [0, -s * 0.2, s * 0.05],
      0.1,
      0.06,
    );
    gear(shin, 0.15, [-s * 0.08, -0.26, 0.3], [0, 0, 0], 16);
    cable(
      shin,
      [
        [s * 0.16, 0.44, 0.12],
        [s * 0.26, 0.12, 0.16],
        [s * 0.24, -0.2, 0.17],
        [s * 0.14, -0.46, 0.14],
      ],
      0.022,
      m.brass,
    );
    for (let i = 0; i < 4; i++) {
      const y = -0.32 + i * 0.22;
      plate(shin, 0.16, 0.08, 0.04, [s * 0.04, y, 0.23], m.gunmetal, [
        0.3,
        0,
        s * 0.25,
      ], "shield");
      fastener(shin, -s * 0.22, y, 0.2, 0.014);
    }
    louvres(shin, [s * 0.24, 0.26, 0.2], 0.12, 0.22, 4);

    const foot = rig(
      `claw foot ${s}`,
      [s * 0.56, 0.18, 0.16],
      [s * 0.55, 0.62, -2.22],
      0.44,
      0.92,
      [-rad, 0, 0],
      [0, -s * 0.05, 0],
      [s * 0.1, 0.12, -0.14],
    );
    gear(foot, 0.16, [0, 0.2, -0.1], [0, rad, 0]);
    box(foot, [0.34, 0.2, 0.22], [0, 0.06, -0.24], m.gunmetal);
    for (const x of [-0.17, 0, 0.17]) {
      shell(
        foot,
        [
          [-0.42, 0.09, 0, 0.01],
          [-0.22, 0.12, 0, 0.02],
          [0.16, 0.1, 0, 0],
          [0.32, 0.05, 0, -0.08],
        ],
        [x, -0.04, 0.24],
        m.yellow,
        [-rad, 0, x * 0.8],
        0.05,
        0.08,
      );
      piston(foot, [x * 0.8, 0.14, -0.04], [x * 0.8, 0.03, 0.42], 0.03);
    }
    plate(foot, 0.42, 0.3, 0.05, [0, 0.12, 0.1], m.yellow, [0.4, 0, 0], "toe");

    const heel = rig(
      `heel spur ${s}`,
      [s * 0.56, 0.2, -0.32],
      [s * 0.55, 0.5, -1.98],
      0.4,
      0.9,
      [-rad, 0, 0],
    );
    box(heel, [0.36, 0.2, 0.26], [0, 0, 0], m.steel);
    vents(heel, [0, 0, -0.15], 0.26, 0.12, 4);
    torus(heel, 0.1, 0.022, [0, 0.1, 0.02], m.chrome, [rad, 0, 0]);

    const front = rig(
      `front tire ${s}`,
      [s * 0.8, 2.5, -0.34],
      [s * 0.94, 0.44, 1.5],
      0.36,
      0.88,
      [0, 0, 0],
      [0, 0, 0],
      [s * 0.3, 0.16, 0.24],
    );
    wheel(front, [0, 0, 0], 0.42);
    const rear = rig(
      `rear tire ${s}`,
      [s * 0.92, 1.04, -0.16],
      [s * 0.94, 0.44, -1.48],
      0.3,
      0.84,
      [0, 0, 0],
      [0, 0, 0],
      [s * 0.24, 0.14, -0.18],
    );
    wheel(rear, [0, 0, 0], 0.42);

    const sill = rig(
      `door sill ${s}`,
      [s * 0.76, 2.94, -0.06],
      [s * 1.0, 0.48, -0.08],
      0.3,
      0.84,
      [rad, 0, 0],
      [0, 0, -s * 0.3],
    );
    box(sill, [0.16, 1.3, 0.2], [0, 0, 0], m.black, [0, 0, 0], 0.04);
    for (let i = 0; i < 5; i++)
      box(sill, [0.2, 0.03, 0.15], [0, -0.44 + i * 0.22, 0.04], m.steel);

    const pipe = rig(
      `exhaust tip ${s}`,
      [s * 0.74, 0.66, -0.36],
      [s * 0.46, 0.42, -2.3],
      0.35,
      0.88,
      [rad, 0, 0],
      [0.2, 0, -s * 0.12],
    );
    cyl(pipe, 0.075, 0.46, [0, 0, 0], m.chrome);
    cyl(pipe, 0.055, 0.04, [0, 0.23, 0], m.black);
    for (let i = 0; i < 4; i++)
      cyl(pipe, 0.085, 0.02, [0, -0.2 + i * 0.09, 0], m.gunmetal);
  }

  const deck = rig(
    "trunk deck",
    [0, 3.12, -0.52],
    [0, 1.12, -1.86],
    0.28,
    0.82,
    [-rad * 0.98, 0, 0],
    [0.1, 0, 0],
    [0, 0.18, -0.24],
  );
  stripedPanel(deck, 1.5, 1.1, [0, 0, 0], [rad, 0, 0], 0.08);
  box(deck, [1.78, 0.12, 0.52], [0, -0.02, -0.56], m.black, [0, 0, 0], 0.04);
  box(deck, [1.6, 0.06, 0.2], [0, -0.06, -0.78], m.chrome, [0, 0, 0], 0.02);
  for (const s of [-1, 1]) {
    box(deck, [0.3, 0.09, 0.16], [s * 0.5, 0.02, -0.56], m.amber);
    fastener(deck, s * 0.6, 0.4, 0.06, 0.018);
  }

  const spoiler = rig(
    "rear spoiler",
    [0, 3.62, -0.74],
    [0, 1.32, -2.1],
    0.22,
    0.78,
    [0, 0, 0],
    [0.24, 0, 0],
    [0, 0.2, -0.3],
  );
  box(spoiler, [1.42, 0.08, 0.3], [0, 0.16, 0], m.black, [0.16, 0, 0], 0.02);
  for (const s of [-1, 1]) {
    box(spoiler, [0.1, 0.24, 0.16], [s * 0.54, 0, 0.02], m.black, [0, 0, 0], 0.02);
    plate(
      spoiler,
      0.18,
      0.26,
      0.04,
      [s * 0.62, 0.04, 0.04],
      m.yellow,
      [0, 0, 0],
      "blade",
    );
  }

  // Grille, bumper and lamps ride the abdomen in robot mode.
  const fascia = rig(
    "front fascia",
    [0, 3.28, 0.36],
    [0, 0.8, 2.26],
    0.34,
    0.9,
    [0, 0, 0],
    [-0.1, 0, 0],
    [0, 0.26, 0.42],
  );
  box(fascia, [1.9, 0.46, 0.22], [0, 0, 0], m.black, [0, 0, 0], 0.05);
  box(fascia, [1.16, 0.26, 0.06], [0, 0.03, 0.12], m.gunmetal);
  for (let i = 0; i < 13; i++)
    box(fascia, [0.02, 0.22, 0.05], [-0.54 + i * 0.09, 0.03, 0.16], m.chrome);
  for (const s of [-1, 1]) {
    box(fascia, [0.42, 0.2, 0.12], [s * 0.72, 0.06, 0.08], m.chrome, [0, 0, 0], 0.03);
    for (const x of [-0.1, 0.1]) {
      cyl(fascia, 0.075, 0.03, [s * 0.72 + x, 0.06, 0.15], m.lamp, "z");
      torus(fascia, 0.078, 0.014, [s * 0.72 + x, 0.06, 0.16], m.steel);
    }
    box(fascia, [0.22, 0.08, 0.05], [s * 0.4, -0.18, 0.13], m.amber);
    fastener(fascia, s * 0.9, -0.14, 0.1, 0.02);
  }
  plate(fascia, 1.04, 0.16, 0.05, [0, -0.22, 0.08], m.yellow, [0, 0, 0], "shield");

  const block = rig(
    "supercharged block",
    [0, 3.88, -0.12],
    [0, 0.92, 1.44],
    0.3,
    0.84,
    [rad, 0, 0],
  );
  engine(block, [0, 0, 0], 1.15);
  for (const s of [-1, 1]) {
    rib(block, [s * 0.26, -0.34, 0.06], [s * 0.26, 0.38, 0.06], 0.06);
    cable(
      block,
      [
        [s * 0.3, 0.36, 0.14],
        [s * 0.44, 0.04, 0.18],
        [s * 0.3, -0.34, 0.14],
      ],
      0.022,
      m.brass,
    );
  }
  box(block, [0.34, 0.2, 0.3], [0, 0.44, 0.1], m.chrome, [0, 0, 0], 0.04);
  louvres(block, [0, 0.44, 0.26], 0.3, 0.14, 4);

  // Scout helmet: rounded crown, hinged cheek guards, wide optics, antenna.
  const head = rig(
    "scout helmet",
    [0, 4.74, 0.06],
    [0, 0.96, 0.44],
    0.02,
    0.32,
    [-0.85, 0, 0],
    [0.08, 0, 0],
  );
  cyl(head, 0.09, 0.2, [0, -0.32, -0.06], m.chrome);
  gear(head, 0.11, [0, -0.34, -0.05], [0, rad, 0], 12);
  box(head, [0.34, 0.36, 0.3], [0, 0, 0.01], m.gunmetal, [0, 0, 0], 0.05);
  shell(
    head,
    [
      [-0.26, 0.19, 0, -0.05],
      [0.04, 0.25, 0, -0.01],
      [0.26, 0.2, 0, -0.07],
      [0.38, 0.08, 0, -0.14],
    ],
    [0, 0.05, -0.06],
    m.yellow,
    [0, Math.PI, 0],
    0.16,
    0.09,
  );
  for (const s of [-1, 1]) {
    // Cheek guards and the servo cluster behind them.
    shell(
      head,
      [
        [-0.2, 0.07, 0, 0],
        [0.04, 0.11, s * 0.01, 0.02],
        [0.24, 0.07, s * 0.03, -0.04],
      ],
      [s * 0.2, -0.02, 0.1],
      m.yellow,
      [0, s * 0.3, -s * 0.12],
      0.07,
      0.05,
    );
    gear(head, 0.06, [s * 0.23, -0.02, -0.04], [0, s * rad, 0], 10);
    // Wide optic with a chrome brow over it.
    const optic = new THREE.Shape();
    optic.moveTo(-0.085, 0.022);
    optic.lineTo(0.085, 0.014);
    optic.lineTo(0.066, -0.026);
    optic.lineTo(-0.07, -0.018);
    optic.closePath();
    mesh(head, new THREE.ShapeGeometry(optic), m.eye, [s * 0.1, 0.04, 0.17], [
      0,
      0,
      -s * 0.1,
    ]);
    plate(
      head,
      0.21,
      0.08,
      0.03,
      [s * 0.1, 0.13, 0.15],
      m.chrome,
      [0, 0, -s * 0.16],
      "blade",
    );
    box(head, [0.05, 0.05, 0.12], [s * 0.13, -0.16, 0.13], m.steel);
    // Swept antenna horn.
    rod(head, [s * 0.16, 0.2, -0.02], [s * 0.3, 0.42, -0.14], 0.022, m.chrome);
    cyl(head, 0.018, 0.06, [s * 0.31, 0.44, -0.15], m.amber);
  }
  box(head, [0.2, 0.09, 0.07], [0, -0.14, 0.18], m.steel, [0, 0, 0], 0.02);
  for (let i = 0; i < 3; i++)
    box(head, [0.03, 0.05, 0.05], [-0.06 + i * 0.06, -0.2, 0.19], m.black);
  vents(head, [0, 0.3, 0.13], 0.06, 0.1, 4);
}
