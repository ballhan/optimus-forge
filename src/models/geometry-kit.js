import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";

// Shared procedural hardware for every study in the collection: seeded surface
// textures, the base metal palette, primitive builders, and the rig registry.
// Character-specific paint and layout live in each model's own files.
export function createGeometryKit({ root, parts, materials, seed = 72007 }) {
  const cache = new Map();
  let state = seed;
  const random = () =>
    (state = (state * 1664525 + 1013904223) >>> 0) / 4294967296;
  function wearTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const c = canvas.getContext("2d");
    const image = c.getImageData(0, 0, 512, 512);
    for (let i = 0; i < image.data.length; i += 4) {
      const n = 130 + random() * 65;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = n;
      image.data[i + 3] = 255;
    }
    c.putImageData(image, 0, 0);
    c.globalAlpha = 0.22;
    for (let i = 0; i < 1400; i++) {
      const y = random() * 512;
      c.strokeStyle = random() > 0.5 ? "#fff" : "#151515";
      c.lineWidth = 0.3 + random() * 0.6;
      c.beginPath();
      const x = random() * 512;
      c.moveTo(x, y);
      c.lineTo(x + random() * 110, y + 0.7);
      c.stroke();
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  }
  const wear = wearTexture();
  function metal(color, roughness = 0.3) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 1,
      roughness,
      roughnessMap: wear,
      bumpMap: wear,
      bumpScale: 0.006,
      envMapIntensity: 1.15,
    });
  }
  function paintedTexture(color) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    const c = canvas.getContext("2d");
    c.fillStyle = color;
    c.fillRect(0, 0, 1024, 1024);
    // Large-scale accumulated dirt and small exposed-metal chips coexist.
    for (let i = 0; i < 95; i++) {
      const x = random() * 1024,
        y = random() * 1024,
        r = 15 + random() * 100;
      const gradient = c.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, "rgba(12,9,8,.12)");
      gradient.addColorStop(1, "rgba(12,9,8,0)");
      c.fillStyle = gradient;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 850; i++) {
      const x = random() * 1024,
        y = random() * 1024;
      c.strokeStyle = i % 4 ? "rgba(174,174,170,.20)" : "rgba(7,8,9,.40)";
      c.lineWidth = 0.4 + random() * 0.7;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + random() * 31, y + random() * 7);
      c.stroke();
    }
    for (let i = 0; i < 260; i++) {
      const x = i % 2 ? random() * 24 : 1000 + random() * 24,
        y = random() * 1024;
      c.fillStyle = "rgba(153,151,148,.42)";
      c.fillRect(x, y, random() * 5, random() * 11);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  function paint(color, map = null) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const c = canvas.getContext("2d");
    c.fillStyle = "#b7b7b7";
    c.fillRect(0, 0, 512, 512);
    // Broad oily patches and rough dirt have different reflection widths.
    for (let i = 0; i < 65; i++) {
      const x = random() * 512,
        y = random() * 512,
        r = 10 + random() * 65;
      const gradient = c.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(
        0,
        i % 3 ? "rgba(255,255,255,.55)" : "rgba(45,45,45,.4)",
      );
      gradient.addColorStop(1, "rgba(180,180,180,0)");
      c.fillStyle = gradient;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const roughness = new THREE.CanvasTexture(canvas);
    roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;
    roughness.anisotropy = 4;
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: map || paintedTexture(color),
      metalness: 0.48,
      roughness: 0.69,
      roughnessMap: roughness,
      bumpMap: wear,
      bumpScale: 0.0015,
      clearcoat: 0.3,
      clearcoatRoughness: 0.38,
      envMapIntensity: 0.85,
    });
  }
  const m = {
    steel: metal("#555c65", 0.72),
    chrome: metal("#969da7", 0.57),
    gunmetal: metal("#202730", 0.78),
    black: metal("#0e1219", 0.6),
    brass: metal("#857356", 0.4),
    rubber: new THREE.MeshStandardMaterial({
      color: "#090b10",
      roughness: 0.88,
      metalness: 0.05,
      bumpMap: wear,
      bumpScale: 0.014,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#172f43",
      metalness: 0.38,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
    eye: new THREE.MeshBasicMaterial({ color: "#49bbff", toneMapped: false }),
    lamp: new THREE.MeshStandardMaterial({
      color: "#ebefff",
      emissive: "#adceff",
      emissiveIntensity: 0.2,
    }),
    amber: new THREE.MeshStandardMaterial({
      color: "#ef9a32",
      emissive: "#ff6300",
      emissiveIntensity: 0.6,
    }),
  };
  function mesh(g, geo, material, pos = [0, 0, 0], rot = [0, 0, 0]) {
    const o = new THREE.Mesh(geo, material);
    o.position.set(...pos);
    o.rotation.set(...rot);
    o.castShadow = o.receiveShadow = true;
    g.add(o);
    materials.add(material);
    return o;
  }
  function box(
    g,
    size,
    pos,
    material = m.steel,
    rot = [0, 0, 0],
    radius = 0.025,
  ) {
    const key = `b${size}/${radius}`;
    if (!cache.has(key))
      cache.set(
        key,
        Math.min(...size) < 0.055
          ? new THREE.BoxGeometry(...size)
          : new RoundedBoxGeometry(...size, 1, radius),
      );
    return mesh(g, cache.get(key), material, pos, rot);
  }
  function cyl(g, r, h, pos, material = m.steel, axis = "y", r2 = r, n = 20) {
    const key = `c${r}/${h}/${r2}/${n}`;
    if (!cache.has(key))
      cache.set(key, new THREE.CylinderGeometry(r, r2, h, n));
    return mesh(
      g,
      cache.get(key),
      material,
      pos,
      axis === "x"
        ? [0, 0, Math.PI / 2]
        : axis === "z"
          ? [Math.PI / 2, 0, 0]
          : [0, 0, 0],
    );
  }
  function rod(g, a, b, r = 0.04, material = m.chrome) {
    const av = new THREE.Vector3(...a),
      bv = new THREE.Vector3(...b),
      delta = bv.clone().sub(av);
    const o = cyl(
      g,
      r,
      delta.length(),
      av.add(bv).multiplyScalar(0.5).toArray(),
      material,
    );
    o.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
    return o;
  }
  function plate(
    g,
    w,
    h,
    depth,
    pos,
    material = m.steel,
    rot = [0, 0, 0],
    profile = "armor",
  ) {
    const profiles = {
      armor: [
        [-0.5, 0.35],
        [-0.26, 0.5],
        [0.4, 0.43],
        [0.5, -0.18],
        [0.17, -0.5],
        [-0.4, -0.34],
      ],
      blade: [
        [-0.45, 0.5],
        [0.17, 0.43],
        [0.5, 0.02],
        [0.27, -0.5],
        [-0.17, -0.4],
        [-0.5, -0.03],
      ],
      window: [
        [-0.5, 0.48],
        [0.44, 0.5],
        [0.5, -0.4],
        [-0.46, -0.5],
      ],
      toe: [
        [-0.5, -0.5],
        [-0.39, 0.27],
        [0.13, 0.5],
        [0.5, 0.18],
        [0.42, -0.5],
      ],
      shield: [
        [-0.5, 0.43],
        [0.5, 0.43],
        [0.42, -0.26],
        [0, -0.5],
        [-0.42, -0.26],
      ],
    };
    const key = `p${w}/${h}/${depth}/${profile}`;
    if (!cache.has(key)) {
      const shape = new THREE.Shape();
      profiles[profile].forEach(([x, y], i) =>
        i ? shape.lineTo(x * w, y * h) : shape.moveTo(x * w, y * h),
      );
      shape.closePath();
      let geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.024,
        bevelThickness: 0.022,
      });
      geo.translate(0, 0, -depth / 2);
      geo = new TessellateModifier(0.18, 3).modify(geo);
      const uv = geo.attributes.uv,
        p = geo.attributes.position;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
      const normals = geo.attributes.normal;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i) / w;
        p.setZ(i, p.getZ(i) + 0.05 * (1 - 4 * x * x));
        const n = new THREE.Vector3(
          normals.getX(i) + ((0.4 * x) / w) * normals.getZ(i),
          normals.getY(i),
          normals.getZ(i),
        ).normalize();
        normals.setXYZ(i, n.x, n.y, n.z);
      }
      cache.set(key, geo);
    }
    return mesh(g, cache.get(key), material, pos, rot);
  }
  function joint(g, r, pos, axis = "z") {
    cyl(g, r, 0.17, pos, m.gunmetal, axis);
    cyl(g, r * 0.72, 0.19, pos, m.chrome, axis);
    cyl(g, r * 0.42, 0.205, pos, m.black, axis);
    cyl(g, r * 0.17, 0.23, pos, m.brass, axis);
  }
  function vents(g, pos, w, h, count = 7) {
    box(g, [w, h, 0.04], pos, m.black);
    for (let i = 0; i < count; i++)
      box(
        g,
        [w * 0.89, 0.018, 0.025],
        [
          pos[0],
          pos[1] - h * 0.42 + (i * h * 0.84) / (count - 1),
          pos[2] + 0.027,
        ],
        m.steel,
      );
  }
  function wheel(g, pos, r = 0.46) {
    const w = new THREE.Group();
    g.add(w);
    w.position.set(...pos);
    cyl(w, r, 0.29, [0, 0, 0], m.rubber, "x", r, 40);
    for (const s of [-1, 1]) {
      cyl(w, r * 0.8, 0.012, [s * 0.151, 0, 0], m.black, "x");
      cyl(w, r * 0.62, 0.025, [s * 0.163, 0, 0], m.chrome, "x", r * 0.62, 32);
      cyl(w, r * 0.35, 0.07, [s * 0.18, 0, 0], m.steel, "x");
      cyl(w, r * 0.17, 0.092, [s * 0.2, 0, 0], m.chrome, "x");
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5;
        const y = Math.sin(a) * r * 0.46,
          z = Math.cos(a) * r * 0.46;
        cyl(w, 0.03, 0.014, [s * 0.18, y, z], m.black, "x", 0.03, 8);
      }
    }
    for (let i = 0; i < 40; i++) {
      const a = (i * Math.PI) / 20;
      box(
        w,
        [0.285, 0.018, 0.044],
        [0, Math.sin(a) * r, Math.cos(a) * r],
        m.black,
        [-a, 0, 0.08],
        0.003,
      );
    }
    return w;
  }
  function rig(
    name,
    a,
    b,
    start = 0.15,
    end = 0.85,
    rotation = [0, 0, 0],
    initial = [0, 0, 0],
    arc = [0, 0, 0],
  ) {
    const g = new THREE.Group();
    g.name = name;
    root.add(g);
    parts.push({
      g,
      a: new THREE.Vector3(...a),
      b: new THREE.Vector3(...b),
      qa: new THREE.Quaternion().setFromEuler(new THREE.Euler(...initial)),
      qb: new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      arc: new THREE.Vector3(...arc),
      start,
      end,
    });
    return g;
  }
  return {
    random,
    wear,
    metal,
    paint,
    paintedTexture,
    m,
    mesh,
    box,
    cyl,
    rod,
    plate,
    joint,
    vents,
    wheel,
    rig,
  };
}
