import * as THREE from "three";

// Local joint chains retain the assembled endpoints while allowing the limbs
// to fold in their parent's coordinate system. Translation represents slides.
// Each study supplies its own hierarchy through bind() and its own clearance
// corridors, then calls connect() to install the telescoping actuators.
export function createJointChain(root, parts, material) {
  const byName = new Map(parts.map((p) => [p.g.name, p]));
  const links = [];
  const v = (a) => new THREE.Vector3(...a);
  for (const p of parts) {
    p.worldA = p.a.clone();
    p.worldB = p.b.clone();
    p.worldQA = p.qa.clone();
    p.worldQB = p.qb.clone();
  }
  function bind(name, parentName, pivot, start, end, bend = 0) {
    const p = byName.get(name),
      parent = byName.get(parentName);
    if (!p) return;
    const offset = v(pivot);
    p.pivot = offset.clone();
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
  // Clearance corridors open before the heavy assemblies move. The offsets are
  // in joint-local space, so descendants and their actuators stay attached.
  function clearance(pattern, build) {
    for (const p of parts) {
      if (!pattern.test(p.g.name)) continue;
      const s = p.g.name.includes(" -1") ? -1 : 1;
      const { offset, range } = build(s, p.g.name);
      p.clearance = { offset: v(offset), range };
    }
  }
  const temp = new THREE.Vector3(),
    a = new THREE.Vector3(),
    b = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const bendAxis = new THREE.Vector3(1, 0, 0);
  const axis = new THREE.Vector3(0, 1, 0);
  const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const ramp = (t, a, b) => ease(THREE.MathUtils.clamp((t - a) / (b - a), 0, 1));
  const corridor = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));
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
        rotation.setFromAxisAngle(bendAxis, p.bend * Math.sin(Math.PI * f) ** 2);
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
  // Telescoping rods physically bridge the sliding joints throughout the motion.
  function connect(actuated) {
    const rodGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
    for (const p of parts.filter((p) => p.parent && actuated.test(p.g.name))) {
      const sleeve = new THREE.Mesh(rodGeo, material),
        shaft = new THREE.Mesh(rodGeo, material);
      sleeve.castShadow = shaft.castShadow = true;
      root.add(sleeve, shaft);
      links.push({ p, sleeve, shaft });
    }
    return {
      pose,
      linkCount: links.length,
      jointCount: parts.filter((p) => p.parent).length,
    };
  }
  return { bind, clearance, connect, byName };
}
