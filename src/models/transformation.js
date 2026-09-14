import * as THREE from "three";

// Local joint chains retain the assembled endpoints while allowing the limbs
// to fold in their parent's coordinate system. Translation represents slides.
export function connectTransformation(root, parts, material) {
  const byName = new Map(parts.map((p) => [p.g.name, p]));
  const links = [];
  const v = (a) => new THREE.Vector3(...a);
  function bind(name, parentName, pivot, start, end, bend = 0) {
    const p = byName.get(name),
      parent = byName.get(parentName);
    if (!p) return;
    const offset = v(pivot);
    for (const mesh of p.g.children)
      if (mesh.isMesh) mesh.geometry.translate(-offset.x, -offset.y, -offset.z);
    p.a.add(offset.clone().applyQuaternion(p.qa));
    p.b.add(offset.clone().applyQuaternion(p.qb));
    p.start = start;
    p.end = end;
    p.bend = bend;
    p.worldA = p.a.clone();
    p.worldB = p.b.clone();
    p.worldQA = p.qa.clone();
    p.worldQB = p.qb.clone();
    if (parent) {
      const ia = parent.worldQA.clone().invert(),
        ib = parent.worldQB.clone().invert();
      p.a.sub(parent.worldA).applyQuaternion(ia);
      p.b.sub(parent.worldB).applyQuaternion(ib);
      p.qa.premultiply(ia);
      p.qb.premultiply(ib);
      parent.g.add(p.g);
      p.parent = parent;
      p.arc.set(0, 0, 0);
    }
  }
  for (const p of parts) {
    p.worldA = p.a.clone();
    p.worldB = p.b.clone();
    p.worldQA = p.qa.clone();
    p.worldQB = p.qb.clone();
  }
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
  // Telescoping rods physically bridge the sliding joints throughout the motion.
  const rodGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
  const axis = new THREE.Vector3(0, 1, 0);
  for (const p of parts.filter(
    (p) =>
      p.parent &&
      /actuator|forearm|shin|knee|pectoral|headlight|radiator|bumper/.test(
        p.g.name,
      ),
  )) {
    const sleeve = new THREE.Mesh(rodGeo, material),
      shaft = new THREE.Mesh(rodGeo, material);
    sleeve.castShadow = shaft.castShadow = true;
    root.add(sleeve, shaft);
    links.push({ p, sleeve, shaft });
  }
  const temp = new THREE.Vector3(),
    a = new THREE.Vector3(),
    b = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const bendAxis = new THREE.Vector3(1, 0, 0);
  const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const ramp = (t, a, b) =>
    ease(THREE.MathUtils.clamp((t - a) / (b - a), 0, 1));
  const corridor = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));
  // Open clearance corridors before the heavy assemblies move. These offsets
  // are in joint-local space, so descendants and their actuators stay attached.
  for (const p of parts) {
    const s = p.g.name.includes(" -1") ? -1 : 1;
    const name = p.g.name;
    if (/brachial actuator/.test(name))
      p.clearance = {
        offset: v([s * 0.62, 0.08, -0.25]),
        range: [0.02, 0.16, 0.55, 0.78],
      };
    if (/diagonal sleeper/.test(name))
      p.clearance = {
        offset: v([s * 0.65, 0.12, -0.45]),
        range: [0, 0.17, 0.74, 0.94],
      };
    if (/windshield pectoral/.test(name))
      p.clearance = {
        offset: v([s * 0.27, 0.12, 0.42]),
        range: [0, 0.15, 0.59, 0.84],
      };
    if (/helmet/.test(name))
      p.clearance = { offset: v([0, 0.18, -0.72]), range: [0, 0.1, 0.3, 0.52] };
    if (/swept shoulder/.test(name))
      p.clearance = {
        offset: v([s * 0.48, 0.28, 0.4]),
        range: [0.35, 0.53, 0.83, 0.96],
      };
    if (/hood top skin/.test(name))
      p.clearance = {
        offset: v([0, 0.6, 0]),
        range: [0.47, 0.64, 0.91, 0.995],
      };
    if (/sculpted thigh/.test(name))
      p.clearance = {
        offset: v([s * 0.24, 0.05, 0]),
        range: [0.16, 0.31, 0.65, 0.86],
      };
    if (/radiator|bumper/.test(name))
      p.clearance = {
        offset: v([name === "radiator" ? -1.55 : 1.45, 0.18, -0.55]),
        range: [0.08, 0.25, 0.75, 0.95],
      };
  }
  function pose(t) {
    for (const p of parts) {
      const u = THREE.MathUtils.clamp((t - p.start) / (p.end - p.start), 0, 1),
        f = ease(u);
      p.g.position.lerpVectors(p.a, p.b, f);
      if (p.clearance)
        p.g.position.addScaledVector(
          p.clearance.offset,
          corridor(t, ...p.clearance.range),
        );
      if (!p.parent) p.g.position.addScaledVector(p.arc, Math.sin(Math.PI * f));
      p.g.quaternion.slerpQuaternions(p.qa, p.qb, f);
      if (p.bend) {
        rotation.setFromAxisAngle(
          bendAxis,
          p.bend * Math.sin(Math.PI * f) ** 2,
        );
        p.g.quaternion.multiply(rotation);
      }
    }
    root.updateMatrixWorld(true);
    for (const { p, sleeve, shaft } of links) {
      p.parent.g.getWorldPosition(a);
      p.g.getWorldPosition(b);
      root.worldToLocal(a);
      root.worldToLocal(b);
      const length = a.distanceTo(b);
      temp.subVectors(b, a).normalize();
      sleeve.position.copy(a).lerp(b, 0.22);
      shaft.position.copy(a).lerp(b, 0.72);
      sleeve.quaternion.setFromUnitVectors(axis, temp);
      shaft.quaternion.copy(sleeve.quaternion);
      sleeve.scale.set(0.045, length * 0.44, 0.045);
      shaft.scale.set(0.024, length * 0.56, 0.024);
    }
  }
  return {
    pose,
    linkCount: links.length,
    jointCount: parts.filter((p) => p.parent).length,
  };
}
