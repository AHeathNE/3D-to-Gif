import * as THREE from 'three';

export type BackgroundFitMode = 'fit' | 'fill' | 'repeat';

/**
 * Composites a background image onto a canvas sized to the export frame,
 * using ordinary 2D canvas drawing so Fit/Fill/Repeat and the source image's
 * own transparency all behave exactly as they will in the exported GIF —
 * three.js's built-in scene.background quad has no notion of aspect-correct
 * fitting or tiling, so we bake the layout in ourselves instead.
 */
export function composeBackgroundTexture(
  image: CanvasImageSource & { width: number; height: number },
  targetWidth: number,
  targetHeight: number,
  fitMode: BackgroundFitMode,
  repeatCount: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  const imgW = image.width || 1;
  const imgH = image.height || 1;

  if (fitMode === 'repeat') {
    const n = Math.max(1, Math.round(repeatCount));
    const tileW = targetWidth / n;
    const tileH = targetHeight / n;
    for (let iy = 0; iy < n; iy++) {
      for (let ix = 0; ix < n; ix++) {
        ctx.drawImage(image, ix * tileW, iy * tileH, tileW, tileH);
      }
    }
  } else {
    // 'fill' (cover, crops overflow) vs 'fit' (contain, letterboxes with
    // transparency) — both preserve the image's own aspect ratio.
    const scale =
      fitMode === 'fill'
        ? Math.max(targetWidth / imgW, targetHeight / imgH)
        : Math.min(targetWidth / imgW, targetHeight / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (targetWidth - drawW) / 2;
    const dy = (targetHeight - drawH) / 2;
    ctx.drawImage(image, dx, dy, drawW, drawH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
