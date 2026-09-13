# Optimus Forge

A fan-made Optimus Prime transformation study, built with Three.js. An original procedural G1-inspired model uses 29 articulated assemblies with staged, reversible interpolation into a cab-over semi truck. Features metallic armor, glass, mechanical detailing, six wheels, environment lighting, shadows, orbit controls, wireframe inspection, and a bottom transformation slider.

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

The browser test checks robot and vehicle states, intermediate scrubbing, reverse playback, camera controls, runtime errors, and mobile overflow. Screenshots are written to `artifacts/`.

## Publish

The included GitHub Actions workflow builds and deploys `dist` to GitHub Pages on pushes to `main`. Select **GitHub Actions** in the repository's Pages settings. Vite uses relative asset paths for project-site hosting.

## Model scope

This is an original code-built model with stylized proportions and physically based materials, not a film production asset or an exact toy engineering simulation. The transformation moves the same assemblies between designed poses; some internal parts overlap while folding. No external character meshes are downloaded. Fonts are served by Google Fonts with system fallbacks. WebGL is required.

Optimus Prime and Transformers belong to Hasbro and their respective rights holders. Independent, unofficial fan study.
