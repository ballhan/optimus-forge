# Form Foundry

An interactive 3D model collection. The first study is an original procedural interpretation of **Optimus Prime from the 2007–2011 films**, transforming into a Peterbilt 379-inspired long-nose truck.

**Live:** https://ballhan.github.io/form-foundry/

- Parented arm, leg, and cab chains with offset hinge pivots and telescoping actuator connections. Hands and feet fold first, the chassis compresses, then outer panels close. Auto-play takes twelve seconds and is reversible.
- Reference-based proportions: compact tilted windshield chest, swept shoulder shells, V-shaped mechanical abdomen, fuller forearms, segmented fists, layered leg armor, and tapered battle-mask geometry.
- Tires are distributed around the hips, backs of the knees, and ankles in robot mode. Separate body panels close around the long-nose truck's hood.
- Clear-coated cobalt and crimson paint, silver flame pinstripes, brushed-metal maps, chrome, rubber, glass, and illuminated optics.
- Shared vehicle-space flame mapping across moving panels, varied paint roughness, darker machinery, tapered chest stampings, and swept shoulder armor.
- Closer default framing, surface-seated fasteners, window hardware, ventilation grilles, cable looms, shin rails, exhaust shields, and truck fittings. These details are generated in `src/models/precision-detail.js` and batched with their assemblies.
- Authored clearance corridors spread the arms and back panels before folding, lift hood panels during closure, and route the grille and bumper around the torso. This reduces visible intersections; it is not a collision solver.
- Environment reflections, rim lighting, contact shadows, ambient occlusion, and restrained bloom.
- Geometry is batched per material within each assembly, with simpler geometry for tiny mechanical details. Rendering stops while idle. Ambient occlusion and bloom return after scrubbing or orbiting settles; the cinema-shading button can disable them entirely. Edge smoothing stays enabled during motion.

The model factory and materials are in `src/models/optimus.js`; the reference-based assembly layout is in `src/models/movie-rig.js`; curved armor, gears, pistons, cables, and hands are built in `src/models/movie-detail.js`. The viewer, camera, lighting, and controls are in `src/main.js`. Future models can supply their own root group, normalized `pose(t)` function, and metadata.

Use the crosshair button to inspect the upper body (or the truck at close range). Reset returns to the full figure. Starting a transformation also restores full-figure framing.

## Run

Requires Node 22.12+.

```sh
npm ci
npm run dev
npm run build
```

## Verify

With the development server running on port 5173:

```sh
npx playwright install chromium
npm test
node --test tests/joints.unit.mjs
```

The browser tests check robot and truck states, intermediate scrubbing, pause and reverse playback, camera and shading controls, inspection-view reset, keyboard access, runtime errors, and mobile overflow. Front, rear, upper-body, intermediate, vehicle, and mobile screenshots go into the ignored `artifacts/` directory. Set `STUDY_URL` to verify a deployed build. Run tests with `--workers=1` when testing on a shared GPU.

## Publish

The included GitHub Actions workflow builds and deploys `dist` to GitHub Pages on pushes to `main`. Select **GitHub Actions** in the repository's Pages settings. Vite uses relative asset paths for project-site hosting.

## Model scope

The joint hierarchy and deterministic pose evaluation live in `src/models/transformation.js`. The joint test checks unchanged geometry at both endpoints, finite transforms through the full sequence, and identical poses when scrubbing from either direction.

This is a movie-inspired fan interpretation, not a screen-exact studio asset or a mechanically exact transformation simulation. Some internal assemblies intersect during transformation. No third-party character meshes or reference images are shipped. Fonts are served by Google Fonts with system fallbacks. WebGL is required.

## Design references

- [Threezero DLX Revenge of the Fallen Optimus Prime](https://www.threezerohk.com/shop/transformers-revenge-of-the-fallen-dlx-optimus-prime-6622): armor proportions, shoulder discs, painted shells, and recessed metal contrast.
- [Hasbro MPM-4](https://instructions.hasbro.com/en-gb/instruction/transformers-masterpiece-movie-series-optimus-prime-mpm-4): reference for a staged, connected conversion. This rig is an original approximation, not a reproduction of the toy conversion.

- [2007 film reference image, IMDb](https://www.imdb.com/media/rm222269184/tt0418279) — proportions, armor, and paint placement; consulted locally only.
- [Front-view movie concept art](https://assets.hongkiat.com/uploads/transformers-the-movie-artworks/optimus-prime.jpg) — chest, waist, shoulders, leg layers, and split toes.
- [Back-view concept art by Ben Procter](https://www.benprocter.com/overview/robots-characters-props-vehicles-graphics/8129344) — diagonal back assemblies and wheel locations; [reference image](https://assets.hongkiat.com/uploads/transformers-the-movie-artworks/optimus-prime-back-view.jpg).
- [Film face close-up](https://miro.medium.com/v2/resize:fit:1400/1*FPCyyaz2USv7mhykZijFvA.jpeg) — brow, eye recesses, cheek structures, and surface finish.
- [Licensed Optimus Prime model brochure](https://myoptimusprime.com/wp-content/uploads/sites/31/2023/07/optimus-prime-boost.pdf) — original-film design reference.
- [Three.js physical material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) — clearcoat and surface shading.

Optimus Prime and Transformers belong to Hasbro and their respective rights holders. Independent, unofficial fan study.
