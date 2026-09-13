import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { connectTransformation } from "../src/models/transformation.js";

test("nested joint conversion preserves geometry endpoints and scrubs deterministically", () => {
  const root = new THREE.Group(),
    material = new THREE.MeshStandardMaterial();
  const names = [
    "pelvis transmission",
    "vertebral frame",
    "brachial actuator 1",
    "layered forearm 1",
    "segmented fist 1",
    "radiator",
  ];
  const parts = names.map((name, i) => {
    const g = new THREE.Group();
    g.name = name;
    root.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), material));
    return {
      g,
      a: new THREE.Vector3(i * 0.3, 4 - i * 0.6, 0),
      b: new THREE.Vector3(i * 0.2, 1, -i * 0.3),
      qa: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0.1, i * 0.2, 0.1),
      ),
      qb: new THREE.Quaternion().setFromEuler(new THREE.Euler(1.57, 0, 0)),
      arc: new THREE.Vector3(),
      start: 0.1,
      end: 0.9,
    };
  });
  const endpoints = parts.map((p) => ({
    a: p.a.clone(),
    b: p.b.clone(),
    qa: p.qa.clone(),
    qb: p.qb.clone(),
  }));
  const rig = connectTransformation(root, parts, material);
  assert.equal(rig.jointCount, 5);
  for (const t of [0, 1]) {
    rig.pose(t);
    root.updateMatrixWorld(true);
    parts.forEach((p, i) => {
      const mesh = p.g.children.find((o) => o.isMesh);
      mesh.geometry.computeBoundingBox();
      const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
      mesh.localToWorld(center);
      assert.ok(
        center.distanceTo(endpoints[i][t ? "b" : "a"]) < 1e-6,
        "assembled geometry moved",
      );
    });
  }
  const snapshot = () => parts.flatMap((p) => [...p.g.matrixWorld.elements]);
  for (let i = 0; i <= 100; i++) {
    rig.pose(i / 100);
    assert.ok(snapshot().every(Number.isFinite));
  }
  rig.pose(0.43);
  const forward = snapshot();
  rig.pose(0.91);
  rig.pose(0.05);
  rig.pose(0.43);
  assert.deepEqual(
    snapshot(),
    forward,
    "reverse scrubbing must not accumulate joint drift",
  );
});
