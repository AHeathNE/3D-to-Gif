import * as THREE from 'three';
import type { OrbitControls } from 'three-stdlib';

interface EngineRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  controls: OrbitControls | null;
  orientationGroup: THREE.Group | null;
  spinGroup: THREE.Group | null;
}

export const engineRefs: EngineRefs = {
  scene: null,
  camera: null,
  controls: null,
  orientationGroup: null,
  spinGroup: null,
};
