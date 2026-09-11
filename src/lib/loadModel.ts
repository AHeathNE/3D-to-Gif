import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export interface LoadedModel {
  object: THREE.Group;
  boundingRadius: number;
  hasUVs: boolean;
}

function generatePlanarUVs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  const sx = size.x || 1;
  const sy = size.y || 1;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) - bbox.min.x;
    const y = pos.getY(i) - bbox.min.y;
    uvs[i * 2] = x / sx;
    uvs[i * 2 + 1] = y / sy;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

export function normalizeAndCenter(object: THREE.Group): number {
  // Scale first (scale is applied before translation in the local transform),
  // then measure and cancel out the resulting world-space offset — centering
  // before scaling would leave the object off-center once scaled.
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  object.scale.setScalar(2 / maxDim);
  object.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  object.position.sub(center);
  object.updateMatrixWorld(true);

  const finalBox = new THREE.Box3().setFromObject(object);
  const sphere = new THREE.Sphere();
  finalBox.getBoundingSphere(sphere);
  return sphere.radius;
}

export async function loadModelFile(file: File, kind: 'stl' | 'obj'): Promise<LoadedModel> {
  const buffer = await file.arrayBuffer();
  let object: THREE.Group;
  let hasUVs = true;

  if (kind === 'stl') {
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    if (!geometry.attributes.uv) {
      hasUVs = false;
      generatePlanarUVs(geometry);
    }
    const mesh = new THREE.Mesh(geometry);
    mesh.name = 'model-mesh';
    object = new THREE.Group();
    object.add(mesh);
  } else {
    const loader = new OBJLoader();
    const text = new TextDecoder().decode(buffer);
    const parsed = loader.parse(text);

    let anyMissingUVs = false;
    parsed.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geom = child.geometry as THREE.BufferGeometry;
        if (!geom.attributes.normal) geom.computeVertexNormals();
        if (!geom.attributes.uv) {
          anyMissingUVs = true;
          generatePlanarUVs(geom);
        }
      }
    });
    hasUVs = !anyMissingUVs;
    object = parsed;
  }

  const boundingRadius = normalizeAndCenter(object);
  return { object, boundingRadius, hasUVs };
}
