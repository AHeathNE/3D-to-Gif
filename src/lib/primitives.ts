import * as THREE from 'three';
import { normalizeAndCenter } from './loadModel';
import type { LoadedModel } from './loadModel';

export type PrimitiveShape = 'cube' | 'sphere' | 'pyramid';

export const PRIMITIVE_LABELS: Record<PrimitiveShape, string> = {
  cube: 'Cube',
  sphere: 'Sphere',
  pyramid: 'Triangular Pyramid',
};

function createGeometry(shape: PrimitiveShape): THREE.BufferGeometry {
  switch (shape) {
    case 'cube':
      return new THREE.BoxGeometry(1, 1, 1);
    case 'sphere':
      return new THREE.SphereGeometry(0.5, 32, 16);
    case 'pyramid':
      return new THREE.TetrahedronGeometry(0.7);
  }
}

export function createPrimitiveModel(shape: PrimitiveShape): LoadedModel {
  const geometry = createGeometry(shape);
  const mesh = new THREE.Mesh(geometry);
  mesh.name = `sample-${shape}`;
  const object = new THREE.Group();
  object.add(mesh);

  const boundingRadius = normalizeAndCenter(object);
  return { object, boundingRadius, hasUVs: true };
}
