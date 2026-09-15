import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { connectBeeTransformation } from "../src/models/bee-transformation.js";

test("scout chain keeps its endpoints and scrubs deterministically", () => {
  const root = new THREE.Group(),
    material = new THREE.MeshStandardMaterial();
  const names = [
    "pelvis core",
    "spinal column",
    "scout helmet",
    "hood chest plate 1",
    "door wing 1",
    "shoulder actuator 1",
    "upper arm 1",
    "combat forearm 1",
    "servo hand 1",
    "thigh strut 1",
    "knee cowl 1",
    "shin frame 1",
    "claw foot 1",
    "front tire 1",
    "sail panel 1",
  ];
  const parts = names.map((name, i) => {
    const g = new THREE.Group();
    g.name = name;
    root.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), material));
    return {
      g,
      a: new THREE.Vector3(i * 0.2, 4.6 - i * 0.3, 0.1),
      b: new THREE.Vector3(i * 0.1, 1, 2 - i * 0.3),
      qa: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0.1, i * 0.15, 0.05),
      ),
      qb: new THREE.Quaternion().setFromEuler(new THREE.Euler(1.57, 0, 0)),
      arc: new THREE.Vector3(),
      start: 0.1,
      end: 0.9,
    };
  });
  const endpoints = parts.map((p) => ({ a: p.a.clone(), b: p.b.clone() }));
  const rig = connectBeeTransformation(root, parts, material);
  assert.equal(rig.jointCount, names.length - 1, "every part but the pelvis hangs off a parent");
  const byName = new Map(parts.map((p) => [p.g.name, p]));
  assert.equal(
    byName.get("door wing 1").parent.g.name,
    "shoulder actuator 1",
    "doors must ride the shoulder they hinge from",
  );
  assert.equal(
    byName.get("front tire 1").parent.g.name,
    "pelvis core",
    "the front axle travels with the hips",
  );
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
  rig.pose(0.37);
  const forward = snapshot();
  rig.pose(0.95);
  rig.pose(0.04);
  rig.pose(0.37);
  assert.deepEqual(
    snapshot(),
    forward,
    "reverse scrubbing must not accumulate joint drift",
  );
});
