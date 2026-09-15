import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createGeometryKit } from "./geometry-kit.js";
import { buildBeeRig } from "./bee-rig.js";
import { connectBeeTransformation } from "./bee-transformation.js";
import { buildBeeMechanisms } from "./bee-mechanisms.js";

// Original procedural interpretation of the 2007–2011 movie scout.
// Static detail is merged per material, inside each independently animated assembly.
export function createBumblebee() {
  const root = new THREE.Group();
  const parts = [],
    materials = new Set();
  const kit = createGeometryKit({ root, parts, materials, seed: 41967 });
  const { random, paint, mesh, box, cyl, rod, plate, vents, wheel, rig } = kit;
  function stripeTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const c = canvas.getContext("2d");
    c.fillStyle = "#e2a30d";
    c.fillRect(0, 0, 512, 512);
    // Twin rally stripes with a hand-laid edge, painted over the body colour.
    for (const x of [207, 274]) {
      c.fillStyle = "#15171d";
      c.fillRect(x, 0, 31, 512);
      c.fillStyle = "#3d3a33";
      c.fillRect(x - 2, 0, 2, 512);
      c.fillRect(x + 31, 0, 2, 512);
    }
    // Sun-faded lacquer, stone chips along the leading edge, and fine swirls.
    c.globalAlpha = 0.2;
    for (let i = 0; i < 140; i++) {
      const x = random() * 512,
        y = random() * 512,
        r = 12 + random() * 90;
      const gradient = c.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(
        0,
        i % 3 ? "rgba(255,236,178,.5)" : "rgba(24,18,6,.5)",
      );
      gradient.addColorStop(1, "rgba(180,150,60,0)");
      c.fillStyle = gradient;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    c.globalAlpha = 0.3;
    for (let i = 0; i < 900; i++) {
      const x = random() * 512,
        y = random() * 512;
      c.strokeStyle = i % 5 ? "rgba(196,178,132,.35)" : "rgba(18,16,12,.55)";
      c.lineWidth = 0.35 + random() * 0.6;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + random() * 26, y + random() * 6);
      c.stroke();
    }
    c.globalAlpha = 0.5;
    for (let i = 0; i < 220; i++) {
      const n = random() * 2.4;
      c.fillStyle = random() > 0.45 ? "#8c8579" : "#221c10";
      c.fillRect(random() * 512, random() * 512, n, n);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const stripeMap = stripeTexture();
  const m = {
    ...kit.m,
    yellow: paint("#dfa30f"),
    stripe: paint("#ffffff", stripeMap),
  };
  m.eye.color.set("#8fd8ff");

  buildBeeRig({ mesh, box, cyl, rod, plate, vents, wheel, rig, m });
  // A scout's head is small, but not so small the backpack swallows it.
  const helmet = parts.find((p) => p.g.name === "scout helmet");
  for (const child of helmet.g.children) {
    child.position.multiplyScalar(1.14);
    child.scale.multiplyScalar(1.14);
  }

  // Bake local static geometry per assembly/material, preserving all rig pivots.
  for (const { g, b, qb } of parts) {
    g.updateMatrixWorld(true);
    const batches = new Map();
    g.traverse((o) => {
      if (!o.isMesh) return;
      const geo = o.geometry.clone().applyMatrix4(o.matrixWorld);
      // One vehicle-space stripe projection crosses separately hinged panels,
      // so the bands stay aligned across the hood, roof and rear deck.
      if (o.material === m.stripe) {
        const point = new THREE.Vector3();
        const positions = geo.attributes.position;
        const uv = geo.attributes.uv;
        for (let i = 0; i < positions.count; i++) {
          point.fromBufferAttribute(positions, i).applyQuaternion(qb).add(b);
          uv.setXY(i, point.x / 2.6 + 0.5, point.z / 5.2 + 0.5);
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
  const connected = connectBeeTransformation(root, parts, m.steel);
  const mechanisms = buildBeeMechanisms(
    { mesh, box, cyl, rod, plate, m },
    parts,
  );
  const pose = connected.pose;
  pose(0);
  return {
    root,
    parts,
    materials,
    pose,
    mechanisms,
    metadata: {
      name: "Bumblebee",
      edition: "2007–2011 / Movie study",
      vehicle: "Chevrolet Camaro",
      id: "bumblebee",
      connectedJoints: connected.jointCount,
      actuators: connected.linkCount,
    },
  };
}
