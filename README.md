# 3D → GIF Workstation

A browser-based tool for turning an STL or OBJ model into a looping animated GIF: import a model (or start from a built-in cube/sphere/pyramid), texture it, set a background, orient it, animate it (spin the object or orbit the camera), and export a GIF at a chosen size.

Everything runs client-side — there's no backend or server component, so it can be hosted as a static site.

## Stack

- Vite + React + TypeScript
- [Three.js](https://threejs.org/) via [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) / [`@react-three/drei`](https://github.com/pmndrs/drei) for the 3D viewer
- [`zustand`](https://github.com/pmndrs/zustand) for app state
- [`gifenc`](https://github.com/mattdesl/gifenc) for GIF encoding (frames are rendered off-screen and read back with `gl.readPixels`, then quantized/encoded — see [src/lib/gifExport.ts](src/lib/gifExport.ts))

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs a static site to `dist/`.

## Deployment (GitHub Pages)

This repo includes a GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) that builds and deploys `dist/` to GitHub Pages automatically on every push to `main`.

One-time setup after the first push: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**. The site will then be available at `https://<username>.github.io/3D-to-Gif/`.

The Vite `base` path in [vite.config.ts](vite.config.ts) is set to `/3D-to-Gif/` to match this repo's name — if you rename the repo, update `base` to match.

## Known limitations

- GIF only supports 1-bit alpha, so transparent backgrounds/textures have hard-cut edges rather than smooth antialiasing.
- STL files carry no UV coordinates; a simple planar projection is generated as a fallback so textures can still be applied, but it won't look correct on every face.
- OBJ import applies one texture/material uniformly and does not read an accompanying `.mtl` file.
- An animated GIF used as a texture (model or background) only contributes its first frame.
