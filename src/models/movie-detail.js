import * as THREE from "three";

/** Sculpted surfaces and mechanical subassemblies for the 2007 reference study. */
export function movieDetail(k) {
  const { mesh, box, cyl, rod, plate, m } = k;
  const v = (a) => new THREE.Vector3(...a);
  function cable(g, points, r = 0.024, material = m.gunmetal) {
    const curve = new THREE.CatmullRomCurve3(points.map(v));
    return mesh(g, new THREE.TubeGeometry(curve, 20, r, 6, false), material);
  }
  function torus(g, r, t, pos, material = m.chrome, rot = [0, 0, 0]) {
    return mesh(g, new THREE.TorusGeometry(r, t, 8, 32), material, pos, rot);
  }
  function gear(g, r, pos, rot = [0, 0, 0], teeth = 16) {
    const group = new THREE.Group();
    g.add(group);
    group.position.set(...pos);
    group.rotation.set(...rot);
    cyl(group, r, 0.12, [0, 0, 0], m.gunmetal, "z");
    cyl(group, r * 0.85, 0.135, [0, 0, 0], m.steel, "z");
    torus(group, r * 0.72, r * 0.09, [0, 0, 0.072], m.chrome);
    cyl(group, r * 0.54, 0.15, [0, 0, 0], m.black, "z");
    cyl(group, r * 0.21, 0.18, [0, 0, 0], m.brass, "z");
    cyl(group, r * 0.1, 0.19, [0, 0, 0], m.gunmetal, "z");
    for (let i = 0; i < teeth; i++) {
      const a = (i * Math.PI * 2) / teeth;
      box(
        group,
        [r * 0.13, r * 0.2, 0.07],
        [Math.sin(a) * r * 0.94, Math.cos(a) * r * 0.94, 0],
        m.steel,
        [0, 0, -a],
        0.004,
      );
    }
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      cyl(
        group,
        r * 0.045,
        0.015,
        [Math.sin(a) * r * 0.68, Math.cos(a) * r * 0.68, 0.107],
        m.black,
        "z",
        r * 0.045,
        6,
      );
      box(
        group,
        [r * 0.07, r * 0.28, 0.028],
        [Math.sin(a) * r * 0.39, Math.cos(a) * r * 0.39, 0.079],
        m.steel,
        [0, 0, -a],
        0.005,
      );
    }
    return group;
  }
  function piston(g, a, b, r = 0.055) {
    rod(g, a, b, r, m.chrome);
    const av = v(a),
      bv = v(b),
      mid = av.clone().lerp(bv, 0.42);
    rod(g, a, mid.toArray(), r * 1.6, m.gunmetal);
    for (let i = 0; i < 4; i++) {
      const p = av.clone().lerp(mid, 0.13 + i * 0.2);
      const o = cyl(g, r * 1.72, 0.022, p.toArray(), m.steel);
      o.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        bv.clone().sub(av).normalize(),
      );
    }
    for (const p of [a, b]) gear(g, r * 1.5, p, [0, 0, 0], 8);
  }
  // A variable-width, doubly curved sheet, with thickness and a closed back.
  // Sections: [height, half-width, horizontal offset, depth]. Dimensions are local.
  function shell(
    g,
    sections,
    pos,
    material = m.blue,
    rot = [0, 0, 0],
    bulge = 0.16,
    thickness = 0.055,
  ) {
    const nx = 12,
      ny = 24,
      points = [],
      uv = [],
      indices = [];
    const sample = (t, u) => {
      const s = t * (sections.length - 1),
        i = Math.min(sections.length - 2, Math.floor(s)),
        f = s - i;
      const a = sections[i],
        b = sections[i + 1],
        mix = (n) => THREE.MathUtils.lerp(a[n], b[n], f);
      return [
        (u * 2 - 1) * mix(1) + mix(2),
        mix(0),
        mix(3) + bulge * Math.sin(u * Math.PI),
      ];
    };
    for (let back = 0; back < 2; back++)
      for (let y = 0; y <= ny; y++)
        for (let x = 0; x <= nx; x++) {
          const p = sample(y / ny, x / nx);
          points.push(p[0], p[1], p[2] - back * thickness);
          uv.push(x / nx, y / ny);
        }
    const stride = nx + 1,
      side = (ny + 1) * stride;
    for (let y = 0; y < ny; y++)
      for (let x = 0; x < nx; x++) {
        const a = y * stride + x,
          b = a + 1,
          c = a + stride,
          d = c + 1;
        indices.push(
          a,
          b,
          c,
          b,
          d,
          c,
          side + a,
          side + c,
          side + b,
          side + b,
          side + c,
          side + d,
        );
      }
    const border = [];
    for (let x = 0; x <= nx; x++) border.push(x);
    for (let y = 1; y <= ny; y++) border.push(y * stride + nx);
    for (let x = nx - 1; x >= 0; x--) border.push(ny * stride + x);
    for (let y = ny - 1; y > 0; y--) border.push(y * stride);
    for (let i = 0; i < border.length; i++) {
      const a = border[i],
        b = border[(i + 1) % border.length];
      indices.push(a, a + side, b, b, a + side, b + side);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const group = new THREE.Group();
    group.position.set(...pos);
    group.rotation.set(...rot);
    g.add(group);
    mesh(group, geo, material);
    // Fine dark seams and exposed edge strips follow the sculpted silhouette.
    for (const u of [0.015, 0.985]) {
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const p = sample(i / 12, u);
        p[2] += 0.008;
        pts.push(p);
      }
      cable(group, pts, 0.009, m.steel);
    }
    return group;
  }
  function feather(g, pos, w, h, material = m.blue, rot = [0, 0, 0]) {
    return shell(
      g,
      [
        [-h * 0.5, w * 0.11, 0, 0],
        [-h * 0.22, w * 0.38, -w * 0.03, 0.03],
        [h * 0.24, w * 0.48, w * 0.01, 0.005],
        [h * 0.5, w * 0.06, w * 0.13, -0.04],
      ],
      pos,
      material,
      rot,
      0.1,
      0.045,
    );
  }
  function rib(g, a, b, width = 0.09) {
    rod(g, a, b, width, m.gunmetal);
    const av = v(a),
      bv = v(b),
      d = bv.clone().sub(av).normalize();
    for (let i = 0; i < 9; i++) {
      const o = cyl(
        g,
        width * 1.13,
        0.025,
        av
          .clone()
          .lerp(bv, i / 8)
          .toArray(),
        i % 3 === 0 ? m.chrome : m.steel,
      );
      o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    }
  }
  function engine(g, pos, scale = 1) {
    const e = new THREE.Group();
    e.position.set(...pos);
    e.scale.setScalar(scale);
    g.add(e);
    box(e, [0.38, 0.62, 0.34], [0, 0, 0], m.gunmetal);
    for (const s of [-1, 1]) {
      box(e, [0.15, 0.56, 0.29], [s * 0.23, 0.03, 0], m.steel, [
        0,
        0,
        -s * 0.3,
      ]);
      for (let i = 0; i < 6; i++)
        box(
          e,
          [0.19, 0.019, 0.32],
          [s * (0.19 + i * 0.003), -0.22 + i * 0.09, 0],
          m.gunmetal,
          [0, 0, -s * 0.3],
        );
      cable(
        e,
        [
          [s * 0.25, 0.24, 0.16],
          [s * 0.35, 0.12, 0.2],
          [s * 0.35, -0.18, 0.18],
          [s * 0.15, -0.3, 0.2],
        ],
        0.026,
        m.chrome,
      );
    }
    gear(e, 0.14, [0, 0.18, 0.23]);
    gear(e, 0.095, [0, -0.17, 0.24]);
    return e;
  }
  function armorCuts(g, pos, w, h) {
    for (let i = 0; i < 3; i++) {
      const y = pos[1] - h * 0.3 + i * h * 0.28;
      box(
        g,
        [w * 0.65, 0.022, 0.018],
        [pos[0], y, pos[2]],
        m.black,
        [0, 0, 0.12],
        0.004,
      );
      box(
        g,
        [w * 0.57, 0.009, 0.018],
        [pos[0], y - 0.016, pos[2] + 0.004],
        m.steel,
        [0, 0, 0.12],
        0.003,
      );
    }
  }
  function servoHand(g, s) {
    shell(
      g,
      [
        [-0.19, 0.18, 0, 0],
        [0.07, 0.23, 0, 0.045],
        [0.2, 0.17, 0, -0.01],
      ],
      [0, 0, 0],
      m.gunmetal,
      [0, 0, 0],
      0.06,
      0.16,
    );
    for (let finger = 0; finger < 4; finger++) {
      const x = -0.165 + finger * 0.112,
        len = [0.24, 0.3, 0.28, 0.23][finger];
      box(
        g,
        [0.085, len, 0.08],
        [x, -0.15, 0.125],
        m.chrome,
        [0.2, 0, 0],
        0.015,
      );
      box(
        g,
        [0.082, 0.16, 0.085],
        [x, -0.15 - len * 0.65, 0.21],
        m.gunmetal,
        [-0.85, 0, 0],
        0.015,
      );
      box(
        g,
        [0.075, 0.13, 0.08],
        [x, -0.18 - len * 0.73, 0.29],
        m.steel,
        [-1.7, 0, 0],
        0.014,
      );
      gear(g, 0.042, [x, -0.09, 0.184], [0, 0, 0], 8);
      cable(
        g,
        [
          [x, 0.12, 0.15],
          [x, -0.08, 0.17],
          [x, -0.2, 0.21],
        ],
        0.014,
        m.gunmetal,
      );
      plate(
        g,
        0.075,
        0.17,
        0.035,
        [x, 0.01, 0.19],
        m.steel,
        [0, 0, 0],
        "shield",
      );
    }
    box(g, [0.11, 0.22, 0.11], [-s * 0.26, -0.03, 0.1], m.steel, [
      0,
      0,
      -s * 0.7,
    ]);
    box(g, [0.1, 0.15, 0.1], [-s * 0.28, -0.19, 0.2], m.chrome, [
      0.6,
      0,
      s * 0.25,
    ]);
    gear(g, 0.095, [0, 0.24, 0.03], [0, 0, 0], 12);
  }
  return {
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
  };
}
