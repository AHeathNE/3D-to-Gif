import * as THREE from 'three';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { engineRefs } from './engineRefs';
import { fitDistanceForSphere, getSphericalFromCamera } from './frameCamera';
import type { AnimationMode, BackgroundMode, CropMode, SpinAxis } from '../store/useSceneStore';

export interface ExportOptions {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  cropMode: CropMode;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  boundingRadius: number;
  animationMode: AnimationMode;
  spinAxis: SpinAxis;
  spinRevolutions: number;
  spinDirection: 1 | -1;
  orbitElevationDeg: number;
  orbitRevolutions: number;
  orbitDirection: 1 | -1;
  maxColors: number;
  onProgress?: (fraction: number) => void;
}

function flipPixelsVertically(pixels: Uint8Array, width: number, height: number) {
  const rowBytes = width * 4;
  const row = new Uint8Array(rowBytes);
  for (let y = 0; y < height / 2; y++) {
    const top = y * rowBytes;
    const bottom = (height - 1 - y) * rowBytes;
    row.set(pixels.subarray(top, top + rowBytes));
    pixels.copyWithin(top, bottom, bottom + rowBytes);
    pixels.set(row, bottom);
  }
}

export async function exportGif(options: ExportOptions): Promise<Blob> {
  const { scene, camera: previewCamera, spinGroup } = engineRefs;
  if (!scene || !previewCamera || !spinGroup) {
    throw new Error('Scene is not ready. Load a model first.');
  }

  const {
    width,
    height,
    fps,
    durationSeconds,
    cropMode,
    backgroundMode,
    backgroundColor,
    boundingRadius,
    animationMode,
    spinAxis,
    spinRevolutions,
    spinDirection,
    orbitElevationDeg,
    orbitRevolutions,
    orbitDirection,
    maxColors,
    onProgress,
  } = options;

  const totalFrames = Math.max(1, Math.round(fps * durationSeconds));
  const aspect = width / height;

  const exportCamera = previewCamera.clone();
  exportCamera.aspect = aspect;

  const target = new THREE.Vector3(0, 0, 0);
  const baseSpherical = getSphericalFromCamera(previewCamera, target);
  const fitDist = fitDistanceForSphere(previewCamera.fov, aspect, boundingRadius, cropMode);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const previousBackground = scene.background;
  if (backgroundMode === 'transparent') {
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
  } else if (backgroundMode === 'color') {
    scene.background = new THREE.Color(backgroundColor);
    renderer.setClearColor(new THREE.Color(backgroundColor), 1);
  } else {
    // 'image': scene.background is already the composed background texture
    // (set by the live preview's background controller) — leave it as-is.
    // Clear to transparent so any part the image doesn't cover (letterboxing
    // in 'fit' mode, or the image's own alpha) stays transparent, not opaque.
    renderer.setClearColor(0x000000, 0);
  }

  const baseSpinRotation = spinGroup.rotation.clone();
  const gl = renderer.getContext();
  const frames: Uint8Array[] = [];

  try {
    for (let i = 0; i < totalFrames; i++) {
      const t = i / totalFrames;

      if (animationMode === 'spin') {
        spinGroup.rotation.copy(baseSpinRotation);
        const delta = spinDirection * spinRevolutions * Math.PI * 2 * t;
        spinGroup.rotation[spinAxis] += delta;
        exportCamera.position.setFromSphericalCoords(fitDist, baseSpherical.phi, baseSpherical.theta);
        exportCamera.position.add(target);
        exportCamera.lookAt(target);
      } else if (animationMode === 'orbit') {
        spinGroup.rotation.copy(baseSpinRotation);
        const azimuth = baseSpherical.theta + orbitDirection * orbitRevolutions * Math.PI * 2 * t;
        const polar = THREE.MathUtils.degToRad(90 - orbitElevationDeg);
        exportCamera.position.setFromSphericalCoords(fitDist, polar, azimuth);
        exportCamera.position.add(target);
        exportCamera.lookAt(target);
      } else {
        spinGroup.rotation.copy(baseSpinRotation);
        exportCamera.position.setFromSphericalCoords(fitDist, baseSpherical.phi, baseSpherical.theta);
        exportCamera.position.add(target);
        exportCamera.lookAt(target);
      }

      exportCamera.updateProjectionMatrix();
      renderer.render(scene, exportCamera);

      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      flipPixelsVertically(pixels, width, height);
      frames.push(pixels);

      onProgress?.((i + 1) / totalFrames / 2);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    spinGroup.rotation.copy(baseSpinRotation);
    scene.background = previousBackground;
    renderer.dispose();
  }

  // 'image' backgrounds can carry their own alpha (a transparent PNG, or
  // letterbox padding from 'fit' mode), and the model's own material can be
  // see-through too — so anything but a flat 'color' background needs an
  // alpha-aware palette, or transparent pixels would bake in as opaque.
  const needsAlpha = backgroundMode !== 'color';
  const format = needsAlpha ? 'rgba4444' : 'rgb444';
  const sampleCount = Math.min(frames.length, 8);
  const sampleIndices = Array.from({ length: sampleCount }, (_, i) =>
    Math.floor((i * (frames.length - 1)) / Math.max(1, sampleCount - 1)),
  );
  const paletteSource = new Uint8Array(sampleIndices.length * frames[0].length);
  sampleIndices.forEach((idx, i) => paletteSource.set(frames[idx], i * frames[0].length));
  const palette = quantize(paletteSource, maxColors, {
    format,
    oneBitAlpha: needsAlpha,
    clearAlpha: true,
    clearAlphaThreshold: 20,
  });

  let transparentIndex = -1;
  if (needsAlpha) {
    transparentIndex = palette.findIndex((c) => c.length > 3 && c[3] === 0);
  }

  const gif = GIFEncoder();
  const delay = 1000 / fps;

  frames.forEach((rgba, i) => {
    const index = applyPalette(rgba, palette, format);
    gif.writeFrame(index, width, height, {
      palette: i === 0 ? palette : undefined,
      delay,
      transparent: transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : undefined,
      repeat: i === 0 ? 0 : undefined,
    });
    onProgress?.(0.5 + (i + 1) / frames.length / 2);
  });

  gif.finish();
  const bytes = gif.bytes();
  const output = new Uint8Array(bytes.length);
  output.set(bytes);
  return new Blob([output], { type: 'image/gif' });
}
