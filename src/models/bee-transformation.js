import { createJointChain } from "./joint-chain.js";

// Scout joint hierarchy: the coupe's skin hangs off the frame it will become.
// Hood halves and windshield ride the spine, doors ride the shoulders, quarter
// panels ride the thighs, and each axle travels with the limb that carries it.
export function connectBeeTransformation(root, parts, material) {
  const chain = createJointChain(root, parts, material);
  const { bind, clearance } = chain;
  bind("pelvis core", null, [0, 0, 0], 0.3, 0.8);
  bind("spinal column", "pelvis core", [0, -0.52, 0], 0.26, 0.78, -0.16);
  bind("scout helmet", "spinal column", [0, -0.3, 0], 0.03, 0.3, -0.42);
  bind("windshield collar", "spinal column", [0, -0.32, 0.04], 0.2, 0.72, 0.16);
  bind("roof shell", "spinal column", [0, -0.66, 0], 0.12, 0.66, 0.24);
  bind("front fascia", "spinal column", [0, 0.24, 0], 0.34, 0.9, -0.2);
  bind("supercharged block", "spinal column", [0, 0, 0], 0.3, 0.84);
  bind("trunk deck", "pelvis core", [0, -0.5, 0], 0.28, 0.82, 0.22);
  bind("rear spoiler", "trunk deck", [0, -0.26, 0], 0.22, 0.78, 0.18);
  for (const s of [-1, 1]) {
    bind(
      `hood chest plate ${s}`,
      "spinal column",
      [-s * 0.4, -0.5, 0],
      0.18,
      0.74,
      0.2,
    );
    bind(`sail panel ${s}`, "spinal column", [0, -0.28, 0], 0.16, 0.7, 0.18);
    bind(
      `shoulder actuator ${s}`,
      "spinal column",
      [-s * 0.3, 0, 0],
      0.12,
      0.68,
      -0.34,
    );
    bind(
      `door wing ${s}`,
      `shoulder actuator ${s}`,
      [0, 0.28, 0.52],
      0.1,
      0.7,
      0.2,
    );
    bind(
      `upper arm ${s}`,
      `shoulder actuator ${s}`,
      [0, 0.32, 0],
      0.16,
      0.72,
      -0.4,
    );
    bind(
      `combat forearm ${s}`,
      `upper arm ${s}`,
      [0, 0.34, 0],
      0.2,
      0.76,
      -1.05,
    );
    bind(`servo hand ${s}`, `combat forearm ${s}`, [0, 0.28, 0], 0.03, 0.3, -0.4);
    bind(`thigh strut ${s}`, "pelvis core", [0, 0.4, 0], 0.3, 0.76, -0.28);
    bind(
      `quarter haunch ${s}`,
      `thigh strut ${s}`,
      [0, 0.5, 0],
      0.26,
      0.8,
      0.22,
    );
    bind(`knee cowl ${s}`, `thigh strut ${s}`, [0, 0.2, 0], 0.34, 0.8, 0.58);
    bind(`shin frame ${s}`, `knee cowl ${s}`, [0, 0.5, 0], 0.32, 0.82, 0.5);
    bind(`claw foot ${s}`, `shin frame ${s}`, [0, 0.2, -0.1], 0.44, 0.92, 1.0);
    bind(`heel spur ${s}`, `claw foot ${s}`, [0, 0, 0], 0.4, 0.9, 0.45);
    bind(`rear tire ${s}`, `shin frame ${s}`, [0, 0, 0], 0.3, 0.84);
    bind(`exhaust tip ${s}`, `shin frame ${s}`, [0, 0, 0], 0.35, 0.88);
    bind(`front tire ${s}`, "pelvis core", [0, 0, 0], 0.36, 0.88);
    bind(`door sill ${s}`, "pelvis core", [0, 0, 0], 0.3, 0.84);
  }
  // Panels swing clear of the frame before the chassis compresses under them.
  clearance(/door wing/, (s) => ({
    offset: [s * 0.52, 0.08, -0.22],
    range: [0, 0.15, 0.6, 0.86],
  }));
  clearance(/hood chest plate/, (s) => ({
    offset: [s * 0.22, 0.26, 0.42],
    range: [0.04, 0.2, 0.66, 0.92],
  }));
  clearance(/shoulder actuator/, (s) => ({
    offset: [s * 0.46, 0.08, -0.2],
    range: [0.02, 0.16, 0.56, 0.8],
  }));
  clearance(/sail panel/, (s) => ({
    offset: [s * 0.34, 0.16, -0.3],
    range: [0.02, 0.18, 0.64, 0.9],
  }));
  clearance(/roof shell/, () => ({
    offset: [0, 0.32, -0.52],
    range: [0.02, 0.18, 0.62, 0.9],
  }));
  clearance(/quarter haunch/, (s) => ({
    offset: [s * 0.44, 0.1, -0.24],
    range: [0.05, 0.2, 0.7, 0.93],
  }));
  clearance(/knee cowl/, (s) => ({
    offset: [s * 0.42, 0.06, 0.26],
    range: [0.2, 0.36, 0.72, 0.93],
  }));
  clearance(/thigh strut/, (s) => ({
    offset: [s * 0.2, 0.04, 0],
    range: [0.16, 0.31, 0.65, 0.86],
  }));
  clearance(/trunk deck/, () => ({
    offset: [0, 0.3, -0.46],
    range: [0.05, 0.2, 0.7, 0.93],
  }));
  clearance(/front fascia/, () => ({
    offset: [0, 0.22, 0.56],
    range: [0.1, 0.28, 0.74, 0.95],
  }));
  clearance(/scout helmet/, () => ({
    offset: [0, 0.12, -0.46],
    range: [0, 0.1, 0.3, 0.55],
  }));
  return chain.connect(
    /shoulder actuator|upper arm|combat forearm|shin frame|knee cowl|hood chest plate|front fascia/,
  );
}
