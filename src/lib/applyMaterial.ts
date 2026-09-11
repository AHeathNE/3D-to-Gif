import * as THREE from 'three';

export function applyMaterialToObject(
  object: THREE.Object3D,
  opts: {
    texture: THREE.Texture | null;
    transparent: boolean;
    baseColor: string;
    metalness: number;
    roughness: number;
  },
) {
  const material = new THREE.MeshStandardMaterial({
    color: opts.texture ? 0xffffff : new THREE.Color(opts.baseColor),
    map: opts.texture ?? null,
    transparent: opts.transparent,
    metalness: opts.metalness,
    roughness: opts.roughness,
  });

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = material;
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });

  return material;
}

export async function loadTextureFromFile(file: File): Promise<THREE.Texture> {
  const url = URL.createObjectURL(file);
  try {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Composites a (possibly transparent) source texture over a solid backdrop
 * color, producing a fully opaque texture. Used when the user wants a PNG/GIF's
 * transparent areas filled with a matte color instead of showing through.
 */
export function compositeTextureWithBackdrop(source: THREE.Texture, backdropColor: string): THREE.Texture {
  const image = source.image as CanvasImageSource & { width: number; height: number };
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = backdropColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const composited = new THREE.CanvasTexture(canvas);
  composited.colorSpace = source.colorSpace;
  composited.wrapS = source.wrapS;
  composited.wrapT = source.wrapT;
  composited.repeat.copy(source.repeat);
  composited.needsUpdate = true;
  return composited;
}
