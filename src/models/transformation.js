import { createJointChain } from "./joint-chain.js";

// Optimus Prime's joint hierarchy: cab panels hang off the spine, the hood
// skins ride the arms, and every tire travels with the frame member it serves.
export function connectTransformation(root, parts, material) {
  const chain = createJointChain(root, parts, material);
  const { bind, clearance } = chain;
  bind("pelvis transmission", null, [0, 0, 0], 0.24, 0.76);
  bind(
    "vertebral frame",
    "pelvis transmission",
    [0, -0.6, 0],
    0.22,
    0.73,
    -0.15,
  );
  for (const p of parts)
    if (/helmet/.test(p.g.name))
      bind(p.g.name, "vertebral frame", [0, -0.25, 0], 0.03, 0.3, -0.45);
  for (const s of [-1, 1]) {
    bind(
      `brachial actuator ${s}`,
      "vertebral frame",
      [0, 0.34, 0],
      0.19,
      0.61,
      -0.42,
    );
    bind(
      `layered forearm ${s}`,
      `brachial actuator ${s}`,
      [0, 0.44, 0],
      0.1,
      0.5,
      -1.15,
    );
    bind(
      `segmented fist ${s}`,
      `layered forearm ${s}`,
      [0, 0.2, 0],
      0.025,
      0.22,
      -0.45,
    );
    bind(
      `sculpted thigh ${s}`,
      "pelvis transmission",
      [0, 0.4, 0],
      0.3,
      0.73,
      -0.3,
    );
    bind(
      `knee rotary joint ${s}`,
      `sculpted thigh ${s}`,
      [0, 0.16, 0],
      0.34,
      0.75,
      0.6,
    );
    bind(
      `open shin mechanism ${s}`,
      `knee rotary joint ${s}`,
      [0, 0.67, 0],
      0.3,
      0.78,
      0.55,
    );
    bind(
      `three prong foot ${s}`,
      `open shin mechanism ${s}`,
      [0, 0.14, -0.12],
      0.12,
      0.39,
      1.05,
    );
    bind(
      `heel stabilizer ${s}`,
      `three prong foot ${s}`,
      [0, 0, 0],
      0.08,
      0.31,
      0.5,
    );
    bind(
      `windshield pectoral ${s}`,
      "vertebral frame",
      [-s * 0.35, 0.34, 0],
      0.39,
      0.82,
      0.18,
    );
    bind(
      `outward door panel ${s}`,
      `windshield pectoral ${s}`,
      [-s * 0.25, 0, 0],
      0.65,
      0.96,
      0.12,
    );
    bind(
      `diagonal sleeper armor ${s}`,
      "vertebral frame",
      [0, -0.6, 0],
      0.48,
      0.86,
      -0.3,
    );
    bind(
      `roof collar fin ${s}`,
      `diagonal sleeper armor ${s}`,
      [0, 0, -0.45],
      0.76,
      0.98,
      0.3,
    );
    bind(
      `swept shoulder hood ${s}`,
      `brachial actuator ${s}`,
      [-s * 0.3, 0, 0],
      0.58,
      0.91,
      0.3,
    );
    bind(
      `front hood cheek ${s}`,
      `swept shoulder hood ${s}`,
      [0, 0, -0.2],
      0.68,
      0.95,
      0.25,
    );
    for (const segment of [0, 1])
      bind(
        `hood top skin ${s} ${segment}`,
        `swept shoulder hood ${s}`,
        [-s * 0.36, 0, 0],
        0.73 + segment * 0.025,
        0.97 + segment * 0.02,
        0.22,
      );
    bind(`rear tire ${s} 0`, `sculpted thigh ${s}`, [0, 0, 0], 0.45, 0.82);
    bind(`rear tire ${s} 1`, `open shin mechanism ${s}`, [0, 0, 0], 0.49, 0.84);
    bind(`hip tire ${s}`, "pelvis transmission", [0, 0, 0], 0.43, 0.86);
    bind(`ankle fender ${s}`, `hip tire ${s}`, [0, 0, 0], 0.65, 0.93, 0.18);
  }
  // Remaining vehicle fittings travel with their supporting frame.
  for (const p of parts) {
    if (
      p.parent ||
      p.g.name === "pelvis transmission" ||
      p.g.name === "vertebral frame"
    )
      continue;
    const name = p.g.name;
    const match = name.match(/ (-?1)$/),
      s = match?.[1];
    let parent = "vertebral frame";
    if (/headlight/.test(name)) parent = `hip tire ${s}`;
    else if (/collar turbine|rear hood cheek/.test(name))
      parent = `swept shoulder hood ${s}`;
    else if (/exhaust|black collar/.test(name))
      parent = `diagonal sleeper armor ${s}`;
    else if (/chassis|fifth|reservoir|step/.test(name))
      parent = "pelvis transmission";
    bind(name, parent, [0, 0, 0], p.start, p.end);
  }
  clearance(/brachial actuator/, (s) => ({
    offset: [s * 0.62, 0.08, -0.25],
    range: [0.02, 0.16, 0.55, 0.78],
  }));
  clearance(/diagonal sleeper/, (s) => ({
    offset: [s * 0.65, 0.12, -0.45],
    range: [0, 0.17, 0.74, 0.94],
  }));
  clearance(/windshield pectoral/, (s) => ({
    offset: [s * 0.27, 0.12, 0.42],
    range: [0, 0.15, 0.59, 0.84],
  }));
  clearance(/helmet/, () => ({
    offset: [0, 0.18, -0.72],
    range: [0, 0.1, 0.3, 0.52],
  }));
  clearance(/swept shoulder/, (s) => ({
    offset: [s * 0.48, 0.28, 0.4],
    range: [0.35, 0.53, 0.83, 0.96],
  }));
  clearance(/hood top skin/, () => ({
    offset: [0, 0.6, 0],
    range: [0.47, 0.64, 0.91, 0.995],
  }));
  clearance(/sculpted thigh/, (s) => ({
    offset: [s * 0.24, 0.05, 0],
    range: [0.16, 0.31, 0.65, 0.86],
  }));
  clearance(/radiator|bumper/, (s, name) => ({
    offset: [name === "radiator" ? -1.55 : 1.45, 0.18, -0.55],
    range: [0.08, 0.25, 0.75, 0.95],
  }));
  return chain.connect(
    /actuator|forearm|shin|knee|pectoral|headlight|radiator|bumper/,
  );
}
