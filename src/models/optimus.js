import * as THREE from "three";
import { buildMovieRig } from "./movie-rig.js";
import { connectTransformation } from "./transformation.js";
import { precisionDetail } from "./precision-detail.js";
import { innerArmor } from "./inner-armor.js";
import { buildMechanisms } from "./mechanisms.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createGeometryKit } from "./geometry-kit.js";

// Original procedural interpretation of the 2007–2011 movie design.
// Static detail is merged per material, inside each independently animated assembly.
export function createOptimus() {
  const root = new THREE.Group();
  const parts = [],
    materials = new Set();
  const kit = createGeometryKit({ root, parts, materials, seed: 72007 });
  const { random, paint, mesh, box, cyl, rod, plate, joint, vents, wheel, rig } =
    kit;
  function flameTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const c = canvas.getContext("2d");
    c.fillStyle = "#153c8a";
    c.fillRect(0, 0, 512, 512);
    // Hand-drawn flame tongues with a fine silver pinstripe over cobalt lacquer.
    const path = new Path2D();
    path.moveTo(0, 512);
    path.lineTo(0, 350);
    path.bezierCurveTo(125, 367, 44, 205, 129, 115);
    path.bezierCurveTo(74, 273, 210, 249, 135, 359);
    path.bezierCurveTo(255, 313, 170, 116, 281, 8);
    path.bezierCurveTo(216, 191, 365, 164, 267, 332);
    path.bezierCurveTo(356, 294, 373, 233, 365, 160);
    path.bezierCurveTo(462, 263, 357, 356, 445, 399);
    path.bezierCurveTo(487, 416, 483, 322, 512, 290);
    path.lineTo(512, 512);
    path.closePath();
    c.fillStyle = "#b52c21";
    c.fill(path);
    c.strokeStyle = "#96919c";
    c.lineWidth = 2.2;
    c.stroke(path);
    c.globalAlpha = 0.22;
    for (let i = 0; i < 4000; i++) {
      c.fillStyle = random() > 0.5 ? "#f4e1d0" : "#060f2a";
      const n = random() * 1.2;
      c.fillRect(random() * 512, random() * 512, n, n);
    }
    c.globalAlpha = 0.35;
    for (let i = 0; i < 120; i++) {
      const x = random() * 512,
        y = random() * 512;
      c.strokeStyle = "#a8afbd";
      c.lineWidth = 0.4;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + random() * 15, y - random() * 4);
      c.stroke();
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const flameMap = flameTexture();
  const m = {
    ...kit.m,
    blue: paint("#153373"),
    red: paint("#94231b"),
    flame: paint("#ffffff", flameMap),
  };

  buildMovieRig({ mesh, box, cyl, rod, plate, joint, vents, wheel, rig, m });
  innerArmor({ mesh, box, cyl, rod, plate, m }, parts);
  // Compact helmet proportions and reduce the long exposed neck.
  const helmet = parts.find((p) => p.g.name === "segmented movie helmet");
  for (const child of helmet.g.children) {
    child.position.multiply(new THREE.Vector3(1.04, 0.84, 1));
    child.scale.multiply(new THREE.Vector3(1.04, 0.84, 1));
  }
  helmet.a.y -= 0.1;
  precisionDetail({ mesh, box, cyl, rod, plate, m }, parts);

  // Bake local static geometry per assembly/material, preserving all rig pivots.
  for (const { g, b, qb } of parts) {
    g.updateMatrixWorld(true);
    const batches = new Map();
    g.traverse((o) => {
      if (!o.isMesh) return;
      const geo = o.geometry.clone().applyMatrix4(o.matrixWorld);
      // One vehicle-space flame field crosses separately articulated body panels.
      if (o.material === m.flame) {
        const point = new THREE.Vector3();
        const positions = geo.attributes.position;
        const uv = geo.attributes.uv;
        for (let i = 0; i < positions.count; i++) {
          point.fromBufferAttribute(positions, i).applyQuaternion(qb).add(b);
          // Keep a consistent projection across the curved surface, avoiding
          // abrupt UV seams where adjacent triangle normals change direction.
          const vertical = g.name.includes("hood top")
            ? point.x + 0.9
            : point.y;
          uv.setXY(i, point.z / 2.7 + 0.5, vertical / 2.7);
        }
      }
      const key = o.material.uuid;
      if (!batches.has(key))
        batches.set(key, { material: o.material, geometries: [] });
      batches.get(key).geometries.push(geo.index ? geo.toNonIndexed() : geo);
    });
    g.clear();
    for (const { material, geometries } of batches.values()) {
      const geo = mergeGeometries(geometries, false);
      mesh(g, geo, material);
      for (const old of geometries) old.dispose();
    }
  }
  const connected = connectTransformation(root, parts, m.steel);
  const mechanisms = buildMechanisms({ mesh, box, cyl, rod, plate, m }, parts);
  const pose = connected.pose;
  pose(0);
  return {
    root,
    parts,
    materials,
    pose,
    mechanisms,
    metadata: {
      name: "Optimus Prime",
      edition: "2007–2011 / Movie study",
      vehicle: "Peterbilt 379",
      id: "optimus-prime",
      connectedJoints: connected.jointCount,
      actuators: connected.linkCount,
    },
  };
}
