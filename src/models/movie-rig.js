import * as THREE from "three";
import { movieDetail } from "./movie-detail.js";

export function buildMovieRig(k) {
  const { mesh, box, cyl, rod, plate, joint, vents, wheel, rig, m } = k;
  const {
    cable,
    torus,
    gear,
    piston,
    shell,
    feather,
    rib,
    engine,
    armorCuts,
    servoHand,
  } = movieDetail(k);
  const rad = Math.PI / 2;

  // Reference landmarks: crown 6.1, shoulders 5.05, chest 4.7, pelvis 3.05,
  // knees 2.0, ankles .5. Wheels are distributed at hip, knee back and ankle.
  const spine = rig(
    "vertebral frame",
    [0, 3.84, -0.15],
    [0, 1.21, -0.12],
    0.28,
    0.8,
  );
  box(spine, [0.27, 1.57, 0.31], [0, 0, 0], m.gunmetal);
  for (let i = 0; i < 10; i++) {
    const y = -0.67 + i * 0.145;
    plate(
      spine,
      0.25,
      0.1,
      0.12,
      [0, y, 0.18],
      m.gunmetal,
      [0.16, 0, 0],
      "shield",
    );
    cyl(spine, 0.046, 0.1, [0, y, 0.29], m.black, "z");
  }
  engine(spine, [0, -0.05, 0.04], 0.7);
  for (const s of [-1, 1]) {
    piston(spine, [s * 0.13, -0.52, 0.18], [s * 0.72, 0.56, 0.05], 0.048);
    cable(
      spine,
      [
        [s * 0.12, -0.65, 0.18],
        [s * 0.45, -0.24, 0.2],
        [s * 0.73, 0.29, 0.05],
        [s * 0.91, 0.48, -0.03],
      ],
      0.038,
      m.gunmetal,
    );
    cable(
      spine,
      [
        [s * 0.17, -0.55, 0.22],
        [s * 0.48, -0.13, 0.28],
        [s * 0.65, 0.24, 0.13],
      ],
      0.022,
      m.brass,
    );
    for (let i = 0; i < 4; i++) {
      const y = -0.37 + i * 0.18;
      rod(
        spine,
        [s * 0.13, y, 0.21],
        [s * (0.32 + i * 0.095), y + 0.18, 0.08],
        0.038,
        m.chrome,
      );
    }
  }
  const sternum = rig(
    "sternum lock",
    [0, 4.42, 0.25],
    [0, 1.36, 1.1],
    0.27,
    0.79,
    [rad, 0, 0],
  );
  shell(
    sternum,
    [
      [-0.29, 0.045, 0, 0.02],
      [0.02, 0.11, 0, 0],
      [0.27, 0.07, 0, -0.02],
    ],
    [0, 0, 0],
    m.gunmetal,
    [0, 0, 0],
    0.06,
  );
  for (const side of [-1, 1])
    rod(
      sternum,
      [side * 0.06, -0.22, 0.06],
      [side * 0.075, 0.17, 0.075],
      0.017,
      m.steel,
    );
  const abdomen = rig(
    "V shaped abdominal armor",
    [0, 3.63, 0.21],
    [0, 1.08, 1.58],
    0.34,
    0.86,
    [rad, 0, 0],
  );
  for (const s of [-1, 1]) {
    shell(
      abdomen,
      [
        [-0.41, 0.07, -s * 0.11, 0],
        [-0.1, 0.13, 0, 0.02],
        [0.24, 0.19, s * 0.16, -0.045],
      ],
      [s * 0.24, 0, 0.04],
      m.steel,
      [0.05, s * 0.2, -s * 0.22],
      0.085,
    );
    piston(abdomen, [s * 0.12, -0.32, 0.15], [s * 0.44, 0.24, 0.1], 0.041);
    gear(abdomen, 0.12, [s * 0.42, 0.24, 0.03], [0.1, s * 0.18, -s * 0.15], 12);
    feather(abdomen, [s * 0.48, 0.05, 0.1], 0.42, 0.48, m.blue, [
      0,
      s * 0.1,
      -s * 0.7,
    ]);
    torus(abdomen, 0.087, 0.018, [s * 0.27, -0.27, 0.17], m.chrome);
  }
  for (let i = 0; i < 6; i++)
    box(
      abdomen,
      [0.019, 0.31, 0.06],
      [-0.07 + i * 0.028, -0.12, 0.24],
      m.chrome,
      [0.1, 0, 0],
      0.005,
    );
  const pelvis = rig(
    "pelvis transmission",
    [0, 3.04, -0.06],
    [0, 0.76, -0.43],
    0.32,
    0.82,
  );
  engine(pelvis, [0, 0.05, -0.07], 0.9);
  shell(
    pelvis,
    [
      [-0.36, 0.105, 0, 0.03],
      [-0.13, 0.2, 0, 0.06],
      [0.25, 0.17, 0, 0],
    ],
    [0, -0.08, 0.29],
    m.gunmetal,
    [0, 0, 0],
    0.09,
    0.09,
  );
  for (const s of [-1, 1]) {
    gear(pelvis, 0.19, [s * 0.44, 0.13, 0.06], [0, s * 0.25, 0]);
    feather(pelvis, [s * 0.42, -0.12, 0.18], 0.4, 0.67, m.blue, [
      0,
      s * 0.27,
      -s * 0.2,
    ]);
    piston(pelvis, [s * 0.18, 0.05, 0.12], [s * 0.36, -0.36, 0.02], 0.043);
    torus(pelvis, 0.07, 0.024, [s * 0.27, 0.33, 0.21], m.chrome);
  }

  for (const s of [-1, 1]) {
    // Short tilted windows and separate stamped red panels expose the torso frame.
    const chest = rig(
      `windshield pectoral ${s}`,
      [s * 0.47, 4.69, 0.08],
      [s * 0.43, 1.88, 0.22],
      0.24,
      0.75,
      [0, 0, 0],
      [0.11, s * 0.15, -s * 0.16],
      [s * 0.15, 0.1, 0.25],
    );
    box(chest, [0.82, 0.55, 0.14], [0, 0.15, 0.15], m.red, [0, 0, 0], 0.035);
    plate(
      chest,
      0.8,
      0.46,
      0.038,
      [0, 0.18, 0.248],
      m.chrome,
      [0, 0, 0],
      "window",
    );
    plate(
      chest,
      0.733,
      0.407,
      0.015,
      [0, 0.18, 0.279],
      m.glass,
      [0, 0, 0],
      "window",
    );
    rod(chest, [-0.3, -0.003, 0.309], [0.24, 0.13, 0.309], 0.012, m.gunmetal);
    shell(
      chest,
      [
        [-0.64, 0.17, -s * 0.06, 0.09],
        [-0.29, 0.25, 0, 0.09],
        [-0.05, 0.32, s * 0.04, 0.03],
      ],
      [0, 0, 0.1],
      m.red,
      [0, 0, 0],
      0.16,
      0.05,
    );
    const stamped = plate(
      chest,
      0.28,
      0.39,
      0.02,
      [-s * 0.025, -0.32, 0.35],
      m.red,
      [0, 0, -s * 0.12],
      "shield",
    );
    armorCuts(chest, [-s * 0.02, -0.3, 0.397], 0.21, 0.31);
    for (const y of [-0.46, -0.15]) {
      cyl(chest, 0.047, 0.02, [s * 0.16, y, 0.338], m.black, "z");
      torus(chest, 0.047, 0.008, [s * 0.16, y, 0.351], m.steel);
    }
    rod(
      chest,
      [-s * 0.3, -0.03, 0.12],
      [-s * 0.19, -0.52, 0.23],
      0.018,
      m.steel,
    );
    const door = rig(
      `outward door panel ${s}`,
      [s * 0.88, 4.55, 0.12],
      [s * 0.88, 1.77, 0.17],
      0.16,
      0.73,
      [0, s * rad, 0],
      [0.04, s * 0.82, -s * 0.24],
      [s * 0.38, 0.1, -0.17],
    );
    shell(
      door,
      [
        [-0.46, 0.22, -s * 0.03, 0.01],
        [0.04, 0.29, 0, 0.03],
        [0.43, 0.28, s * 0.015, -0.01],
      ],
      [0, 0, 0],
      m.flame,
      [0, 0, 0],
      0.035,
    );
    plate(
      door,
      0.46,
      0.29,
      0.018,
      [0, 0.23, 0.071],
      m.glass,
      [0, 0, 0],
      "window",
    );
    box(door, [0.14, 0.035, 0.023], [s * 0.14, -0.05, 0.09], m.chrome);
    rod(door, [s * 0.23, 0.12, 0.04], [s * 0.39, 0.48, 0.11], 0.022, m.chrome);
    box(door, [0.1, 0.24, 0.065], [s * 0.39, 0.45, 0.11], m.chrome);

    const back = rig(
      `diagonal sleeper armor ${s}`,
      [s * 0.55, 4.39, -0.54],
      [s * 0.41, 1.68, -0.73],
      0.24,
      0.8,
      [0, 0, 0],
      [-0.12, s * 0.18, s * 0.48],
      [s * 0.2, 0.05, -0.28],
    );
    box(back, [0.79, 1.48, 0.39], [0, 0, 0], m.blue);
    shell(
      back,
      [
        [-0.65, 0.3, 0, 0],
        [0.45, 0.39, 0, 0.03],
        [0.72, 0.25, 0, -0.03],
      ],
      [0, 0, -0.225],
      m.flame,
      [0, Math.PI, 0],
      0.045,
    );
    vents(back, [0, -0.24, -0.29], 0.55, 0.49, 12);
    engine(back, [0, 0.29, -0.36], 0.75);
    const roof = rig(
      `roof collar fin ${s}`,
      [s * 0.48, 4.41, -0.69],
      [s * 0.45, 2.44, -0.03],
      0.07,
      0.66,
      [0, 0, 0],
      [rad * 0.88, 0, s * 0.1],
      [s * 0.12, 0.2, -0.12],
    );
    box(roof, [0.9, 0.07, 1.1], [0, 0, 0], m.blue);
    for (let i = 0; i < 2; i++)
      box(
        roof,
        [0.09, 0.054, 0.08],
        [-s * 0.22 + i * s * 0.31, 0.061, 0.45],
        m.amber,
      );
    const fin = rig(
      `black collar blade ${s}`,
      [s * 0.9, 5.19, -0.33],
      [s * 0.65, 2.39, -0.17],
      0,
      0.48,
      [rad, 0, 0],
      [0, 0, -s * 0.12],
    );
    shell(
      fin,
      [
        [-0.34, 0.12, 0, 0],
        [0.08, 0.1, s * 0.025, 0],
        [0.45, 0.055, s * 0.07, -0.05],
      ],
      [0, 0, 0],
      m.gunmetal,
      [0, 0, 0],
      0.025,
    );
    rod(
      fin,
      [-s * 0.08, -0.24, 0.06],
      [s * 0.015, 0.37, 0.015],
      0.018,
      m.chrome,
    );

    const shoulder = rig(
      `swept shoulder hood ${s}`,
      [s * 1.4, 4.76, -0.035],
      [s * 0.785, 1.32, 1.78],
      0.12,
      0.83,
      [0, s * rad, 0],
      [0.03, s * 0.2, -s * 0.42],
      [s * 0.38, 0.44, 0.15],
    );
    gear(shoulder, 0.29, [0, 0.02, -0.035], [0, s * rad, 0]);
    const cap = shell(
      shoulder,
      [
        [-0.34, 0.42, s * 0.18, -0.12],
        [-0.1, 0.5, s * 0.07, 0],
        [0.21, 0.3, -s * 0.1, -0.05],
        [0.38, 0.1, -s * 0.17, -0.13],
      ],
      [0, 0.035, 0.15],
      m.flame,
      [0, 0, 0],
      0.22,
      0.07,
    );
    feather(shoulder, [s * 0.07, -0.27, 0.03], 0.65, 0.29, m.blue, [
      0,
      0,
      s * 0.1,
    ]);
    piston(
      shoulder,
      [-s * 0.24, 0.12, -0.03],
      [s * 0.25, -0.26, -0.015],
      0.039,
    );
    for (let i = 0; i < 5; i++)
      rod(
        shoulder,
        [-s * 0.2, 0.13 - i * 0.095, -0.11],
        [s * 0.13, -0.07 - i * 0.056, -0.11],
        0.021,
        m.steel,
      );

    const collar = rig(
      `collar turbine ${s}`,
      [s * 1.13, 5.03, 0.03],
      [s * 1.035, 1.66, 0.63],
      0.17,
      0.77,
      [0, 0, 0],
      [0.18, 0, s * 0.19],
    );
    cyl(collar, 0.14, 0.4, [0, 0, 0], m.steel, "z");
    torus(collar, 0.13, 0.027, [0, 0, 0.214], m.chrome);
    cyl(collar, 0.1, 0.02, [0, 0, 0.22], m.black, "z");
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      box(
        collar,
        [0.026, 0.09, 0.017],
        [Math.sin(a) * 0.061, Math.cos(a) * 0.061, 0.24],
        m.steel,
        [0, 0, -a + 0.4],
      );
    }
    const exhaust = rig(
      `exhaust ${s}`,
      [s * 1.1, 4.82, -0.52],
      [s * 1.025, 2.13, -0.59],
      0.23,
      0.82,
      [0, 0, 0],
      [0, 0, -s * 0.045],
    );
    cyl(exhaust, 0.073, 1.5, [0, 0, 0], m.chrome);
    cyl(exhaust, 0.099, 0.53, [0, -0.45, 0], m.steel);
    cyl(exhaust, 0.055, 0.013, [0, 0.755, 0], m.black);
    for (let i = 0; i < 7; i++)
      cyl(exhaust, 0.106, 0.022, [0, -0.67 + i * 0.068, 0], m.gunmetal);

    const ribs = rig(
      `lateral rib assembly ${s}`,
      [s * 0.64, 4.1, -0.04],
      [s * 0.55, 1.11, 0.39],
      0.24,
      0.77,
      [rad, 0, 0],
      [0, s * 0.2, 0],
    );
    for (let i = 0; i < 3; i++) {
      const y = -0.22 + i * 0.19;
      piston(ribs, [-s * 0.15, y, 0.1], [s * 0.18, y + 0.17, 0.015], 0.027);
    }
    cable(
      ribs,
      [
        [-s * 0.15, -0.33, 0.14],
        [s * 0.15, -0.13, 0.12],
        [s * 0.28, 0.22, -0.02],
      ],
      0.024,
      m.gunmetal,
    );
    const arm = rig(
      `brachial actuator ${s}`,
      [s * 1.48, 4.03, 0.01],
      [s * 0.55, 1.61, -0.59],
      0.11,
      0.68,
      [rad, 0, 0],
      [0, 0, -s * 0.07],
      [s * 0.25, 0.04, -0.3],
    );
    gear(arm, 0.2, [0, 0.23, 0.04], [0, s * 0.25, 0]);
    gear(arm, 0.18, [0, -0.33, 0.07], [0, 0, 0]);
    box(arm, [0.23, 0.59, 0.28], [0, -0.04, -0.07], m.gunmetal);
    piston(arm, [-s * 0.17, 0.27, 0.13], [-s * 0.18, -0.29, 0.13], 0.061);
    piston(arm, [s * 0.14, 0.29, 0.02], [s * 0.2, -0.25, 0.03], 0.047);
    cable(
      arm,
      [
        [s * 0.2, 0.32, -0.04],
        [s * 0.28, 0.1, 0.09],
        [s * 0.29, -0.15, 0.1],
        [s * 0.16, -0.36, 0.03],
      ],
      0.043,
      m.gunmetal,
    );
    for (let i = 0; i < 3; i++)
      plate(arm, 0.27, 0.14, 0.05, [0, 0.04 - i * 0.14, 0.19], m.steel, [
        0.15,
        0,
        -s * 0.12,
      ]);
    feather(arm, [s * 0.23, 0.05, -0.01], 0.26, 0.51, m.blue, [
      0,
      s * 0.65,
      -s * 0.2,
    ]);

    const forearm = rig(
      `layered forearm ${s}`,
      [s * 1.67, 3.37, 0.12],
      [s * 0.75, 1.27, 0.08],
      0.17,
      0.74,
      [rad, 0, s * 0.1],
      [0, -s * 0.1, -s * 0.12],
      [s * 0.55, 0.08, 0.17],
    );
    engine(forearm, [0, -0.04, 0], 0.75);
    gear(forearm, 0.18, [0, 0.28, 0.09], [0, s * 0.35, 0]);
    shell(
      forearm,
      [
        [-0.52, 0.17, 0, 0],
        [-0.27, 0.26, s * 0.03, 0.035],
        [0.24, 0.25, s * 0.13, -0.02],
        [0.57, 0.065, s * 0.24, -0.1],
      ],
      [s * 0.12, 0.02, 0.2],
      m.red,
      [0, -s * 0.22, 0],
      0.11,
    );
    shell(
      forearm,
      [
        [-0.42, 0.12, 0, 0],
        [0.07, 0.21, 0, 0.01],
        [0.43, 0.085, s * 0.15, -0.09],
      ],
      [s * 0.3, -0.015, 0],
      m.flame,
      [0, s * 0.7, -s * 0.14],
      0.12,
    );
    feather(forearm, [-s * 0.17, -0.21, 0.2], 0.28, 0.34, m.blue, [
      0,
      -s * 0.3,
      s * 0.25,
    ]);
    piston(forearm, [-s * 0.17, 0.31, 0.21], [-s * 0.15, -0.36, 0.23], 0.042);
    armorCuts(forearm, [s * 0.11, -0.15, 0.39], 0.24, 0.42);
    for (let i = 0; i < 3; i++)
      plate(
        forearm,
        0.14,
        0.19,
        0.04,
        [s * 0.28, -0.19 + i * 0.19, 0.17],
        m.gunmetal,
        [0, s * 0.4, -s * 0.2],
      );
    const hand = rig(
      `segmented fist ${s}`,
      [s * 1.73, 2.73, 0.2],
      [s * 0.53, 1.27, -0.32],
      0.02,
      0.43,
      [rad, 0, 0],
      [0.08, 0, -s * 0.1],
    );
    servoHand(hand, s);

    const thigh = rig(
      `sculpted thigh ${s}`,
      [s * 0.49, 2.53, -0.025],
      [s * 0.43, 0.78, -0.58],
      0.3,
      0.8,
      [rad, 0, 0],
      [0, s * 0.045, -s * 0.045],
      [s * 0.15, 0.2, -0.1],
    );
    gear(thigh, 0.2, [0, 0.33, 0], [0, s * rad, 0]);
    rod(thigh, [0, -0.39, 0], [0, 0.36, 0], 0.14, m.gunmetal);
    shell(
      thigh,
      [
        [-0.43, 0.19, 0, 0],
        [-0.1, 0.27, -s * 0.01, 0.02],
        [0.3, 0.31, s * 0.04, -0.01],
        [0.48, 0.21, s * 0.06, -0.04],
      ],
      [0, 0, 0.12],
      m.steel,
      [0, 0, s * 0.04],
      0.1,
      0.1,
    );
    feather(thigh, [s * 0.2, 0.18, 0.2], 0.44, 0.66, m.blue, [
      0,
      s * 0.38,
      -s * 0.13,
    ]);
    piston(thigh, [-s * 0.15, 0.29, 0.25], [-s * 0.13, -0.37, 0.24], 0.038);
    for (let i = 0; i < 4; i++)
      plate(
        thigh,
        0.27,
        0.13,
        0.04,
        [0, -0.13 + i * 0.105, 0.275],
        i % 2 ? m.gunmetal : m.steel,
        [0.2, 0, -s * 0.04],
        "shield",
      );
    cable(
      thigh,
      [
        [s * 0.16, 0.39, -0.15],
        [s * 0.32, 0.11, -0.05],
        [s * 0.28, -0.25, 0.04],
      ],
      0.034,
      m.gunmetal,
    );
    const knee = rig(
      `knee rotary joint ${s}`,
      [s * 0.55, 1.96, 0.035],
      [s * 0.48, 0.72, -1.05],
      0.32,
      0.83,
      [rad, 0, 0],
      [0, 0, 0],
      [s * 0.16, 0.24, -0.05],
    );
    gear(knee, 0.23, [0, 0, 0.19], [0, 0, 0], 20);
    piston(knee, [-s * 0.16, 0.15, 0.02], [-s * 0.21, -0.17, 0.07], 0.032);
    feather(knee, [s * 0.26, 0.23, 0.08], 0.28, 0.72, m.blue, [
      0,
      s * 0.2,
      -s * 0.3,
    ]);

    const shin = rig(
      `open shin mechanism ${s}`,
      [s * 0.61, 1.05, 0.015],
      [s * 0.53, 0.63, -1.85],
      0.35,
      0.88,
      [rad, 0, 0],
      [0.035, 0, -s * 0.035],
      [s * 0.22, 0.25, -0.1],
    );
    box(shin, [0.28, 1.28, 0.31], [0, 0, -0.04], m.gunmetal);
    piston(shin, [-s * 0.08, 0.57, 0.12], [-s * 0.08, -0.49, 0.19], 0.077);
    piston(shin, [s * 0.17, 0.5, 0.015], [s * 0.21, -0.55, 0.02], 0.055);
    for (let i = 0; i < 4; i++) {
      const y = -0.35 + i * 0.24;
      plate(
        shin,
        0.17,
        0.085,
        0.04,
        [s * 0.045, y, 0.247],
        m.gunmetal,
        [0.3, 0, s * 0.27],
        "shield",
      );
    }
    rod(
      shin,
      [-s * 0.05, -0.43, 0.23],
      [-s * 0.05, 0.52, 0.23],
      0.055,
      m.steel,
    );
    cable(
      shin,
      [
        [-s * 0.06, -0.36, 0.29],
        [-s * 0.1, 0.02, 0.32],
        [-s * 0.08, 0.44, 0.24],
      ],
      0.017,
      m.chrome,
    );
    shell(
      shin,
      [
        [-0.62, 0.115, -s * 0.015, 0.03],
        [-0.31, 0.18, s * 0.05, 0.035],
        [0.3, 0.21, 0, 0],
        [0.72, 0.08, -s * 0.08, -0.07],
      ],
      [-s * 0.23, 0.03, 0.21],
      m.flame,
      [0, -s * 0.3, s * 0.065],
      0.085,
    );
    shell(
      shin,
      [
        [-0.64, 0.12, 0, 0],
        [-0.25, 0.22, 0, 0.035],
        [0.32, 0.22, -s * 0.02, 0],
        [0.72, 0.1, s * 0.06, -0.06],
      ],
      [s * 0.28, 0.02, 0.09],
      m.blue,
      [0, s * 0.47, -s * 0.1],
      0.11,
    );
    gear(shin, 0.16, [-s * 0.1, -0.28, 0.36], [0, 0, 0], 16);
    cable(
      shin,
      [
        [s * 0.18, 0.5, 0.12],
        [s * 0.28, 0.19, 0.16],
        [s * 0.27, -0.2, 0.18],
        [s * 0.15, -0.51, 0.16],
      ],
      0.025,
      m.brass,
    );
    // Tires travel independently; the robot has no stacks along the calf.
    for (const [index, y, z] of [
      [0, 2.33, -0.44],
      [1, 0.48, -0.1],
    ]) {
      const tires = rig(
        `rear tire ${s} ${index}`,
        [s * (index ? 0.77 : 0.64), y, z],
        [s * 1.025, 0.455, index ? -2.22 : -1.38],
        0.28 + index * 0.08,
        0.84 + index * 0.04,
        [0, 0, 0],
        [0, 0, 0],
        [s * 0.22, 0.16, -0.12],
      );
      wheel(tires, [0, 0, 0], 0.43);
    }
    const front = rig(
      `hip tire ${s}`,
      [s * 0.65, 3.01, -0.43],
      [s * 1.025, 0.455, 1.85],
      0.37,
      0.89,
      [0, 0, 0],
      [0, 0, 0],
      [s * 0.36, 0.19, 0.19],
    );
    wheel(front, [0, 0, 0], 0.43);

    const ankle = rig(
      `ankle fender ${s}`,
      [s * 0.78, 0.52, -0.04],
      [s * 0.99, 0.62, 1.84],
      0.4,
      0.88,
      [0, 0, 0],
      [0, 0, 0],
      [s * 0.23, 0.11, 0.12],
    );
    const arch = new THREE.CylinderGeometry(
      0.52,
      0.52,
      0.43,
      40,
      1,
      true,
      0,
      Math.PI,
    );
    mesh(ankle, arch, m.flame, [0, 0, 0], [0, 0, rad]);
    torus(ankle, 0.2, 0.035, [-s * 0.21, -0.015, 0.21], m.steel, [0, rad, 0]);
    const foot = rig(
      `three prong foot ${s}`,
      [s * 0.65, 0.18, 0.32],
      [s * 0.55, 0.53, -2.58],
      0.44,
      0.92,
      [rad, 0, 0],
      [0, -s * 0.055, 0],
      [s * 0.1, 0.11, -0.12],
    );
    gear(foot, 0.18, [0, 0.21, -0.12], [0, rad, 0]);
    for (const x of [-0.2, 0.2]) {
      shell(
        foot,
        [
          [-0.5, 0.11, 0, 0.01],
          [-0.31, 0.15, 0, 0.015],
          [0.18, 0.13, 0, 0],
          [0.36, 0.065, 0, -0.1],
        ],
        [x, -0.05, 0.28],
        m.steel,
        [-rad, 0, x * 0.2],
        0.06,
        0.09,
      );
      piston(foot, [x, 0.16, -0.04], [x, 0.04, 0.52], 0.036);
    }
    feather(foot, [0, 0.23, -0.015], 0.48, 0.35, m.blue, [-0.6, 0, 0]);
    box(foot, [0.25, 0.25, 0.18], [0, 0.03, -0.34], m.gunmetal);
    const heel = rig(
      `heel stabilizer ${s}`,
      [s * 0.65, 0.14, -0.31],
      [s * 0.55, 0.49, -2.3],
      0.38,
      0.88,
      [rad, 0, 0],
    );
    box(heel, [0.44, 0.22, 0.27], [0, 0, 0], m.steel);
    vents(heel, [0, 0, -0.15], 0.32, 0.14, 4);

    const cheek = rig(
      `front hood cheek ${s}`,
      [s * 0.85, 1.12, 0.03],
      [s * 0.767, 1.3, 2.34],
      0.31,
      0.86,
      [0, s * rad, 0],
      [0, s * 0.4, -s * 0.08],
      [s * 0.34, 0.18, 0.15],
    );
    shell(
      cheek,
      [
        [-0.275, 0.29, 0, 0],
        [0.15, 0.31, 0, 0.01],
        [0.275, 0.275, 0, -0.01],
      ],
      [0, 0, 0],
      m.blue,
      [0, 0, 0],
      0.02,
      0.045,
    );
    const rearCheek = rig(
      `rear hood cheek ${s}`,
      [s * 0.71, 3.95, -0.36],
      [s * 0.767, 1.31, 1.1],
      0.28,
      0.83,
      [0, s * rad, 0],
      [0, s * 0.44, s * 0.22],
      [s * 0.22, 0.13, 0.09],
    );
    shell(
      rearCheek,
      [
        [-0.275, 0.17, 0, 0],
        [0.16, 0.18, 0, 0.01],
        [0.275, 0.16, 0, -0.015],
      ],
      [0, 0, 0],
      m.flame,
      [0, 0, 0],
      0.018,
      0.04,
    );
    const fuel = rig(
      `fuel reservoir ${s}`,
      [s * 0.79, 3.62, -0.38],
      [s * 1.0, 0.68, -0.27],
      0.27,
      0.82,
      [rad, 0, 0],
      [0.18, 0, -s * 0.18],
    );
    cyl(fuel, 0.18, 0.84, [0, 0, 0], m.chrome);
    for (const y of [-0.28, 0.28])
      cyl(fuel, 0.19, 0.045, [0, y, 0], m.gunmetal);
    const step = rig(
      `rib shield and step ${s}`,
      [s * 0.65, 3.84, 0.1],
      [s * 1.02, 0.68, 0.38],
      0.3,
      0.85,
      [0, 0, 0],
      [0.18, s * 0.24, -s * 0.52],
    );
    shell(
      step,
      [
        [-0.19, 0.21, 0, 0],
        [0, 0.27, 0, 0],
        [0.17, 0.24, 0, -0.03],
      ],
      [0, 0, 0],
      m.flame,
      [0, 0, 0],
      0.09,
    );
    for (let i = 0; i < 6; i++)
      box(step, [0.4, 0.02, 0.08], [0, -0.13 + i * 0.053, -0.02], m.steel);
    const headlamp = rig(
      `abdominal headlight pod ${s}`,
      [s * 0.57, 3.81, 0.28],
      [s * 0.98, 1.06, 2.55],
      0.37,
      0.88,
      [0, 0, 0],
      [0, s * 0.2, -s * 0.4],
    );
    box(headlamp, [0.38, 0.2, 0.19], [0, 0, 0], m.chrome);
    for (const x of [-0.09, 0.09]) {
      cyl(headlamp, 0.062, 0.025, [x, 0, 0.11], m.lamp, "z");
      torus(headlamp, 0.065, 0.013, [x, 0, 0.126], m.steel);
    }
    // Hood skins become the outer forearm/calf covers; there is no solid hood slab on the torso.
    for (const segment of [0, 1]) {
      const hood = rig(
        `hood top skin ${s} ${segment}`,
        [
          s * (segment ? 0.76 : 1.74),
          segment ? 1.17 : 3.38,
          segment ? -0.14 : 0.07,
        ],
        [s * 0.367, 1.61, segment ? 1.36 : 2.18],
        0.3 + segment * 0.09,
        0.85 + segment * 0.03,
        [0, 0, 0],
        [rad, segment ? s * 0.32 : s * 0.45, segment ? -s * 0.09 : -s * 0.12],
        [s * 0.37, 0.19, 0.22],
      );
      box(hood, [0.728, 0.035, 0.82], [0, 0, 0], m.blue);
      plate(
        hood,
        0.68,
        0.77,
        0.016,
        [0, 0.028, 0],
        m.flame,
        [-rad, 0, 0],
        "window",
      );
      rod(
        hood,
        [-s * 0.36, 0.028, -0.39],
        [-s * 0.36, 0.028, 0.39],
        0.009,
        m.chrome,
      );
    }
  }

  // Helmet modeled from the mask-on promotional render: swept cheeks, segmented
  // crown, angular brow, recessed optics and a tapered two-piece battle mask.
  const head = rig(
    "segmented movie helmet",
    [0, 5.55, 0.055],
    [0, 1.9, -0.33],
    0.02,
    0.32,
    [0.1, 0, 0],
  );
  cyl(head, 0.1, 0.22, [0, -0.39, -0.08], m.chrome);
  gear(head, 0.12, [0, -0.42, -0.07], [0, rad, 0]);
  shell(
    head,
    [
      [-0.3, 0.18, 0, -0.07],
      [0.03, 0.285, 0, -0.01],
      [0.3, 0.21, 0, -0.09],
      [0.43, 0.08, 0, -0.15],
    ],
    [0, 0.03, -0.09],
    m.blue,
    [0, Math.PI, 0],
    0.15,
    0.1,
  );
  box(head, [0.36, 0.4, 0.28], [0, -0.025, 0.02], m.gunmetal, [0, 0, 0], 0.045);
  for (const s of [-1, 1]) {
    shell(
      head,
      [
        [-0.35, 0.04, 0, -0.03],
        [-0.12, 0.09, -s * 0.015, 0.03],
        [0.18, 0.1, s * 0.008, 0],
        [0.39, 0.045, s * 0.04, -0.1],
      ],
      [s * 0.245, 0.04, 0.02],
      m.blue,
      [0, s * 0.35, -s * 0.11],
      0.08,
    );
    shell(
      head,
      [
        [-0.12, 0.07, 0, 0],
        [0.22, 0.035, s * 0.015, -0.02],
        [0.33, 0.013, s * 0.028, -0.07],
      ],
      [s * 0.29, 0.19, -0.08],
      m.steel,
      [0, 0, -s * 0.06],
      0.028,
      0.025,
    );
    plate(
      head,
      0.245,
      0.12,
      0.046,
      [s * 0.12, 0.182, 0.22],
      m.blue,
      [0, -s * 0.06, -s * 0.16],
      "blade",
    );
    plate(
      head,
      0.19,
      0.052,
      0.02,
      [s * 0.123, 0.089, 0.245],
      m.black,
      [0, 0, -s * 0.14],
      "window",
    );
    const opticShape = new THREE.Shape();
    opticShape.moveTo(-0.074, 0.017);
    opticShape.lineTo(0.074, 0.011);
    opticShape.lineTo(0.055, -0.015);
    opticShape.lineTo(-0.06, -0.01);
    opticShape.closePath();
    mesh(
      head,
      new THREE.ShapeGeometry(opticShape),
      m.eye,
      [s * 0.12, 0.103, 0.319],
      [0, 0, -s * 0.14],
    );
    cyl(head, 0.009, 0.007, [s * 0.12, 0.102, 0.331], m.eye, "z");
    plate(
      head,
      0.2,
      0.1,
      0.024,
      [s * 0.135, 0.018, 0.253],
      m.steel,
      [0, s * 0.2, s * 0.18],
      "blade",
    );
    shell(
      head,
      [
        [-0.32, 0.055, -s * 0.045, 0],
        [-0.11, 0.11, 0, 0.028],
        [0.015, 0.09, s * 0.012, 0],
      ],
      [s * 0.098, 0, 0.26],
      m.steel,
      [0, s * 0.2, s * 0.07],
      0.044,
      0.027,
    );
    plate(
      head,
      0.082,
      0.3,
      0.04,
      [s * 0.22, -0.12, 0.19],
      m.blue,
      [0, s * 0.35, -s * 0.18],
      "blade",
    );
    rod(
      head,
      [s * 0.23, -0.29, 0.14],
      [s * 0.12, -0.37, 0.16],
      0.018,
      m.chrome,
    );
    gear(head, 0.075, [s * 0.28, -0.05, -0.045], [0, s * rad, 0], 12);
    for (let i = 0; i < 3; i++)
      rod(
        head,
        [s * 0.18, -0.06 - i * 0.07, 0.12],
        [s * 0.26, -0.025 - i * 0.06, 0.1],
        0.012,
        m.brass,
      );
  }
  shell(
    head,
    [
      [-0.04, 0.031, 0, 0.02],
      [0.2, 0.055, 0, 0],
      [0.4, 0.06, 0, -0.04],
    ],
    [0, 0.12, 0.2],
    m.blue,
    [0, 0, 0],
    0.035,
    0.06,
  );
  vents(head, [0, 0.37, 0.225], 0.065, 0.145, 5);
  box(head, [0.018, 0.28, 0.016], [0, -0.145, 0.324], m.gunmetal);
  plate(head, 0.09, 0.12, 0.025, [0, -0.35, 0.22], m.blue, [0, 0, 0], "shield");

  const engineBlock = rig(
    "under hood engine",
    [0, 4.37, -0.46],
    [0, 1.24, 1.7],
    0.31,
    0.85,
    [rad, 0, 0],
  );
  engine(engineBlock, [0, 0, 0], 1.5);
  for (const s of [-1, 1]) {
    rib(engineBlock, [s * 0.3, -0.42, 0.09], [s * 0.3, 0.48, 0.09], 0.075);
  }
  const radiator = rig(
    "radiator",
    [0, 4.08, -0.66],
    [0, 1.07, 2.63],
    0.42,
    0.91,
    [0, 0, 0],
    [0, Math.PI, 0],
    [0, 0.25, 0.2],
  );
  box(radiator, [1.47, 1.06, 0.13], [0, 0, 0], m.chrome);
  box(radiator, [1.32, 0.9, 0.025], [0, 0, 0.081], m.black);
  for (let i = 0; i < 26; i++)
    box(
      radiator,
      [0.014, 0.88, 0.035],
      [-0.632 + i * 0.0505, 0, 0.099],
      m.chrome,
    );
  box(radiator, [1.35, 0.025, 0.018], [0, 0.02, 0.12], m.chrome);
  const badge = mesh(
    radiator,
    new THREE.SphereGeometry(0.045, 12, 8),
    m.red,
    [0, 0.33, 0.128],
  );
  badge.scale.set(1.8, 0.65, 0.25);
  const bumper = rig(
    "bumper",
    [0, 4.43, -0.79],
    [0, 0.49, 2.72],
    0.4,
    0.93,
    [0, 0, 0],
    [rad, 0, 0],
    [0, 0.3, 0.4],
  );
  box(bumper, [2.35, 0.24, 0.18], [0, 0, 0], m.chrome);
  box(bumper, [0.34, 0.1, 0.018], [0, 0, 0.1], m.gunmetal);
  const chassis = rig(
    "chassis ladder",
    [0, 4.02, -0.64],
    [0, 0.6, -0.64],
    0.29,
    0.84,
    [rad, 0, 0],
  );
  for (const s of [-1, 1])
    box(chassis, [0.09, 3.39, 0.13], [s * 0.34, 0, 0], m.gunmetal);
  for (let i = 0; i < 9; i++)
    box(chassis, [0.76, 0.055, 0.11], [0, -1.49 + i * 0.37, 0], m.steel);
  const fifth = rig(
    "fifth wheel",
    [0, 3.74, -0.73],
    [0, 0.99, -1.65],
    0.32,
    0.87,
    [rad, 0, 0],
  );
  cyl(fifth, 0.35, 0.1, [0, 0, 0], m.gunmetal, "z");
  box(fifth, [0.07, 0.35, 0.11], [0, -0.22, 0], m.black);
}
