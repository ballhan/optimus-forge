# Form Foundry

An interactive 3D model collection of original procedural interpretations of the **2007–2011 film designs**. Every study is generated in code — no third-party meshes — and scrubs between robot and vehicle form.

| | Study | Alternate form | Page |
| --- | --- | --- | --- |
| 001 | Optimus Prime | Peterbilt 379-inspired long-nose truck | `index.html` |
| 002 | Bumblebee | Camaro-inspired muscle coupe | `bumblebee.html` |

**Live:** https://ballhan.github.io/form-foundry/

Studies share the procedural hardware rather than duplicating it: `src/models/geometry-kit.js` holds the seeded surface textures, base metal palette, primitive builders and rig registry; `src/models/movie-detail.js` holds the sculpted subassemblies (curved shells, gears, pistons, cables, engines); `src/models/joint-chain.js` holds the joint engine that converts assembled world endpoints into nested local chains; and `src/viewer.js` holds the stage, lighting, post-processing and controls. Each study supplies its own layout, joint hierarchy, mechanisms, palette, framing and captions.

## 001 — Optimus Prime

### Mechanical inspection

Use **Armor** to open fourteen hinged covers across the shoulders, forearms, thighs, and calves. **Grip** controls thirty finger joints. **Run systems** animates the turbine rotors, finger flex, and illuminated core; pause holds the rotors in place. Pistons extend with the armor hinges. The covers close automatically as the transformation begins. These original inspection mechanisms are an artistic addition rather than an exact reproduction of the movie rig.

`src/models/mechanisms.js` builds the moving subassemblies after static batching. Geometry is merged within each finger segment, rotor, and armor flap so the extra detail retains independent motion. The mechanism controls have a responsive mobile layout.

- Parented arm, leg, and cab chains with offset hinge pivots and telescoping actuator connections. Hands and feet fold first, the chassis compresses, then outer panels close. Auto-play takes twelve seconds and is reversible.
- Reference-based proportions: compact tilted windshield chest, swept shoulder shells, V-shaped mechanical abdomen, fuller forearms, segmented fists, layered leg armor, and tapered battle-mask geometry.
- Tires are distributed around the hips, backs of the knees, and ankles in robot mode. Separate body panels close around the long-nose truck's hood.
- Clear-coated cobalt and crimson paint, silver flame pinstripes, brushed-metal maps, chrome, rubber, glass, and illuminated optics.
- Shared vehicle-space flame mapping across moving panels, varied paint roughness, darker machinery, tapered chest stampings, and swept shoulder armor.
- Closer default framing, surface-seated fasteners, window hardware, ventilation grilles, cable looms, shin rails, exhaust shields, and truck fittings. These details are generated in `src/models/precision-detail.js` and batched with their assemblies.
- Authored clearance corridors spread the arms and back panels before folding, lift hood panels during closure, and route the grille and bumper around the torso. This reduces visible intersections; it is not a collision solver.
- Reference polish adds overlapping inner torso armor, chest returns, limb backing shells, fuller blue thighs, and a seated neck assembly in `src/models/inner-armor.js`. A shorter helmet and closer arm stance tighten the robot proportions. Softer shadows, a quieter fill light, and rougher steel reduce the uniformly shiny appearance.
- Environment reflections, rim lighting, contact shadows, ambient occlusion, and restrained bloom.
- Geometry is batched per material within each assembly, with simpler geometry for tiny mechanical details. Rendering stops while idle. Ambient occlusion and bloom return after scrubbing or orbiting settles; the cinema-shading button can disable them entirely. Edge smoothing stays enabled during motion.

The model factory and materials are in `src/models/optimus.js`; the reference-based assembly layout is in `src/models/movie-rig.js`; curved armor, gears, pistons, cables, and hands are built in `src/models/movie-detail.js`. The joint hierarchy is in `src/models/transformation.js` and the page entry is `src/main.js`.

Use the crosshair button to inspect the upper body (or the truck at close range). Reset returns to the full figure. Starting a transformation also restores full-figure framing.

## 002 — Bumblebee

A scout half a head shorter than Prime, built around a different problem: a coupe has far less material to hide a robot in, so the same panels have to do more work. The hood splits down the centre into the pectorals, the windshield becomes the collar, the doors swing up and back into wing shoulders, the roof and fastback sails fold onto the spine, the rear quarters wrap the thighs, and the front fenders cowl the knees. Front tires end up on the hips, rear tires on the calves.

### Mechanical inspection

**Armor** opens twelve hinged covers across the shoulders, forearms, thighs, and calves, revealing the cooling rotors behind them. **Grip** drives thirty finger joints across two hands. **Run systems** spins the rotors, flexes the fingers, pulses the spark core, and lights the **chest radio array** — two five-channel lamp banks that stand in for the voice this scout does not use. The array stows itself once the hood panels become bodywork.

- Split-hood pectorals with a cowl scoop, blackout panel, and hood pins; a chrome-framed windshield collar; a striped roof shell that becomes the back plate; fastback sail panels that close the rear quarter and read as back blades on the robot.
- Yellow lacquer with twin rally stripes, projected once in vehicle space so the bands stay continuous across the hood halves, roof, sails and rear deck no matter how those panels are hinged.
- A plasma cannon barrel on the right forearm, segmented battle mask and wide optics on the helmet, antenna horns, quad headlights, honeycomb grille, chin spoiler, ducktail spoiler, and twin exhaust tips.
- Clearance corridors swing the doors, sails, quarter panels and knee cowls clear before the chassis compresses beneath them.

The model factory and palette are in `src/models/bumblebee.js`; the assembly layout is in `src/models/bee-rig.js`; the joint hierarchy and fold choreography are in `src/models/bee-transformation.js`; the inspection mechanisms are in `src/models/bee-mechanisms.js`; the page entry is `src/bee-main.js`.

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
npm run test:unit
```

The browser tests cover both studies: robot and vehicle states, intermediate scrubbing, pause and reverse playback, camera and shading controls, inspection-view reset, keyboard access, the mechanical systems, collection navigation, runtime errors, and mobile overflow. The coupe test also measures assembly bounds to check that the robot stands on the platform and that no panel rises above the roofline or hangs through the road. Screenshots go into the ignored `artifacts/` directory. Set `STUDY_URL` to verify a deployed build. Run tests with `--workers=1` when testing on a shared GPU.

## Publish

The included GitHub Actions workflow builds and deploys `dist` to GitHub Pages on pushes to `main`. Both pages are Vite build inputs, so each study ships its own HTML entry. Select **GitHub Actions** in the repository's Pages settings. Vite uses relative asset paths for project-site hosting.

## Model scope

Deterministic pose evaluation lives in `src/models/joint-chain.js`, with one hierarchy per study. Each joint test checks unchanged geometry at both endpoints, finite transforms through the full sequence, and identical poses when scrubbing from either direction.

These are movie-inspired fan interpretations, not a screen-exact studio asset or a mechanically exact transformation simulation. Some internal assemblies intersect during transformation. No third-party character meshes or reference images are shipped. Fonts are served by Google Fonts with system fallbacks. WebGL is required.

## Design references

- [Threezero DLX Revenge of the Fallen Optimus Prime](https://www.threezerohk.com/shop/transformers-revenge-of-the-fallen-dlx-optimus-prime-6622): armor proportions, shoulder discs, painted shells, and recessed metal contrast.
- [Hasbro MPM-4](https://instructions.hasbro.com/en-gb/instruction/transformers-masterpiece-movie-series-optimus-prime-mpm-4): reference for a staged, connected conversion. This rig is an original approximation, not a reproduction of the toy conversion.

- [2007 film reference image, IMDb](https://www.imdb.com/media/rm222269184/tt0418279) — proportions, armor, and paint placement; consulted locally only.
- [Front-view movie concept art](https://assets.hongkiat.com/uploads/transformers-the-movie-artworks/optimus-prime.jpg) — chest, waist, shoulders, leg layers, and split toes.
- [Back-view concept art by Ben Procter](https://www.benprocter.com/overview/robots-characters-props-vehicles-graphics/8129344) — diagonal back assemblies and wheel locations; [reference image](https://assets.hongkiat.com/uploads/transformers-the-movie-artworks/optimus-prime-back-view.jpg).
- [Film face close-up](https://miro.medium.com/v2/resize:fit:1400/1*FPCyyaz2USv7mhykZijFvA.jpeg) — brow, eye recesses, cheek structures, and surface finish.
- [Licensed Optimus Prime model brochure](https://myoptimusprime.com/wp-content/uploads/sites/31/2023/07/optimus-prime-boost.pdf) — original-film design reference.
- [Three.js physical material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) — clearcoat and surface shading.

Optimus Prime, Bumblebee and Transformers belong to Hasbro and their respective rights holders. Independent, unofficial fan study.
