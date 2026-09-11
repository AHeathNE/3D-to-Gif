import * as THREE from 'three';
import type { CropMode } from '../store/useSceneStore';

/**
 * Distance a perspective camera needs from a sphere's center so the sphere
 * fits the frame. 'contain' picks the stricter axis (whole object visible,
 * may letterbox); 'cover' picks the looser axis (fills frame, may crop).
 */
export function fitDistanceForSphere(
  verticalFovDegrees: number,
  aspect: number,
  radius: number,
  mode: CropMode,
  padding = 1.15,
): number {
  const vHalf = THREE.MathUtils.degToRad(verticalFovDegrees) / 2;
  const hHalf = Math.atan(Math.tan(vHalf) * aspect);
  const distV = radius / Math.sin(vHalf);
  const distH = radius / Math.sin(hHalf);
  const dist = mode === 'contain' ? Math.max(distV, distH) : Math.min(distV, distH);
  return dist * (mode === 'contain' ? padding : 1);
}

export function getSphericalFromCamera(camera: THREE.Camera, target = new THREE.Vector3(0, 0, 0)) {
  const offset = new THREE.Vector3().subVectors(camera.position, target);
  const spherical = new THREE.Spherical().setFromVector3(offset);
  return spherical;
}
