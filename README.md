# Form Foundry

An interactive 3D model collection. The first study is an original procedural interpretation of **Optimus Prime from the 2007–2011 films**, transforming into a Peterbilt 379-inspired long-nose truck.

**Live:** https://ballhan.github.io/form-foundry/

- 45 independently animated assemblies with staged folding and clearance arcs.
- Split windshield chest, flame-painted armor, exposed spine and hydraulics, finger geometry, rebuilt helmet, fuel tanks, exhaust stacks, and six wheels.
- Clear-coated cobalt and crimson paint, silver flame pinstripes, brushed-metal maps, chrome, rubber, glass, and illuminated optics.
- Environment reflections, rim lighting, contact shadows, ambient occlusion, and restrained bloom.
- Geometry batched per material within each assembly. Rendering stops while idle; ambient occlusion uses reduced resolution. The cinema-shading button toggles postprocessing for a lighter rendering mode.

The model factory is in `src/models/optimus.js`. The viewer, camera, lighting, and controls are in `src/main.js`. Future models can supply their own root group, normalized `pose(t)` function, and metadata.

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
```

The browser test checks robot and truck states, intermediate scrubbing, pause and reverse playback, camera and shading controls, keyboard access, runtime errors, and mobile overflow. Screenshots go into the ignored `artifacts/` directory. Set `STUDY_URL` to verify a deployed build.

## Publish

The included GitHub Actions workflow builds and deploys `dist` to GitHub Pages on pushes to `main`. Select **GitHub Actions** in the repository's Pages settings. Vite uses relative asset paths for project-site hosting.

## Model scope

This is a movie-inspired fan interpretation, not a screen-exact studio asset or a mechanically exact transformation simulation. Some internal assemblies intersect during transformation. No third-party character meshes or reference images are shipped. Fonts are served by Google Fonts with system fallbacks. WebGL is required.

## Design references

- [2007 film reference image, IMDb](https://www.imdb.com/media/rm222269184/tt0418279) — proportions, armor, and paint placement; consulted locally only.
- [Licensed Optimus Prime model brochure](https://myoptimusprime.com/wp-content/uploads/sites/31/2023/07/optimus-prime-boost.pdf) — original-film design reference.
- [Three.js physical material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) — clearcoat and surface shading.

Optimus Prime and Transformers belong to Hasbro and their respective rights holders. Independent, unofficial fan study.
