import { create } from 'zustand';
import type * as THREE from 'three';
import type { PrimitiveShape } from '../lib/primitives';
import type { BackgroundFitMode } from '../lib/backgroundImage';

export type BackgroundMode = 'transparent' | 'color' | 'image';
export type AnimationMode = 'none' | 'spin' | 'orbit';
export type SpinAxis = 'x' | 'y' | 'z';
export type CropMode = 'contain' | 'cover';
export type TextureTransparencyMode = 'seeThrough' | 'fillColor';

interface SceneState {
  // --- model ---
  modelFile: File | null;
  modelFileKind: 'stl' | 'obj' | null;
  sampleShape: PrimitiveShape | null;
  modelObject: THREE.Object3D | null;
  modelBoundingRadius: number;
  modelHasUVs: boolean;
  setModelFile: (file: File | null, kind: 'stl' | 'obj' | null) => void;
  setSampleShape: (shape: PrimitiveShape) => void;
  setModelObject: (obj: THREE.Object3D | null, boundingRadius: number, hasUVs: boolean) => void;

  // --- texture ---
  textureFile: File | null;
  textureRepeatX: number;
  textureRepeatY: number;
  textureTransparencyMode: TextureTransparencyMode;
  textureBackdropColor: string;
  setTextureFile: (file: File | null) => void;
  setTextureRepeat: (x: number, y: number) => void;
  setTextureTransparencyMode: (m: TextureTransparencyMode) => void;
  setTextureBackdropColor: (c: string) => void;

  // --- material fallback ---
  baseColor: string;
  metalness: number;
  roughness: number;
  setBaseColor: (c: string) => void;
  setMetalness: (v: number) => void;
  setRoughness: (v: number) => void;

  // --- background ---
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  backgroundImageFile: File | null;
  backgroundFitMode: BackgroundFitMode;
  backgroundRepeatCount: number;
  setBackgroundMode: (m: BackgroundMode) => void;
  setBackgroundColor: (c: string) => void;
  setBackgroundImageFile: (file: File | null) => void;
  setBackgroundFitMode: (m: BackgroundFitMode) => void;
  setBackgroundRepeatCount: (n: number) => void;

  // --- orientation (static base pose, degrees) ---
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  setRotation: (axis: 'x' | 'y' | 'z', degrees: number) => void;
  resetRotation: () => void;

  // --- animation ---
  animationMode: AnimationMode;
  spinAxis: SpinAxis;
  spinRevolutions: number;
  spinDirection: 1 | -1;
  orbitElevation: number;
  orbitRevolutions: number;
  orbitDirection: 1 | -1;
  durationSeconds: number;
  fps: number;
  setAnimationMode: (m: AnimationMode) => void;
  setSpinAxis: (a: SpinAxis) => void;
  setSpinRevolutions: (n: number) => void;
  setSpinDirection: (d: 1 | -1) => void;
  setOrbitElevation: (deg: number) => void;
  setOrbitRevolutions: (n: number) => void;
  setOrbitDirection: (d: 1 | -1) => void;
  setDurationSeconds: (s: number) => void;
  setFps: (f: number) => void;

  // --- export ---
  exportWidth: number;
  exportHeight: number;
  cropMode: CropMode;
  maxColors: number;
  setExportWidth: (n: number) => void;
  setExportHeight: (n: number) => void;
  setCropMode: (m: CropMode) => void;
  setMaxColors: (n: number) => void;

  // --- export progress ---
  isExporting: boolean;
  exportProgress: number;
  exportResultUrl: string | null;
  setExporting: (b: boolean) => void;
  setExportProgress: (p: number) => void;
  setExportResultUrl: (url: string | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  modelFile: null,
  modelFileKind: null,
  sampleShape: null,
  modelObject: null,
  modelBoundingRadius: 1,
  modelHasUVs: false,
  setModelFile: (file, kind) => set({ modelFile: file, modelFileKind: kind, sampleShape: null }),
  setSampleShape: (shape) => set({ sampleShape: shape, modelFile: null, modelFileKind: null }),
  setModelObject: (obj, boundingRadius, hasUVs) =>
    set({ modelObject: obj, modelBoundingRadius: boundingRadius, modelHasUVs: hasUVs }),

  textureFile: null,
  textureRepeatX: 1,
  textureRepeatY: 1,
  textureTransparencyMode: 'seeThrough',
  textureBackdropColor: '#ffffff',
  setTextureFile: (file) => set({ textureFile: file }),
  setTextureRepeat: (x, y) => set({ textureRepeatX: x, textureRepeatY: y }),
  setTextureTransparencyMode: (m) => set({ textureTransparencyMode: m }),
  setTextureBackdropColor: (c) => set({ textureBackdropColor: c }),

  baseColor: '#b8bcc2',
  metalness: 0.1,
  roughness: 0.6,
  setBaseColor: (c) => set({ baseColor: c }),
  setMetalness: (v) => set({ metalness: v }),
  setRoughness: (v) => set({ roughness: v }),

  backgroundMode: 'transparent',
  backgroundColor: '#20232a',
  backgroundImageFile: null,
  backgroundFitMode: 'fill',
  backgroundRepeatCount: 2,
  setBackgroundMode: (m) => set({ backgroundMode: m }),
  setBackgroundColor: (c) => set({ backgroundColor: c }),
  setBackgroundImageFile: (file) => set({ backgroundImageFile: file }),
  setBackgroundFitMode: (m) => set({ backgroundFitMode: m }),
  setBackgroundRepeatCount: (n) => set({ backgroundRepeatCount: n }),

  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  setRotation: (axis, degrees) =>
    set(() => ({ [`rotation${axis.toUpperCase()}`]: degrees }) as Partial<SceneState>),
  resetRotation: () => set({ rotationX: 0, rotationY: 0, rotationZ: 0 }),

  animationMode: 'spin',
  spinAxis: 'y',
  spinRevolutions: 1,
  spinDirection: 1,
  orbitElevation: 20,
  orbitRevolutions: 1,
  orbitDirection: 1,
  durationSeconds: 3,
  fps: 20,
  setAnimationMode: (m) => set({ animationMode: m }),
  setSpinAxis: (a) => set({ spinAxis: a }),
  setSpinRevolutions: (n) => set({ spinRevolutions: n }),
  setSpinDirection: (d) => set({ spinDirection: d }),
  setOrbitElevation: (deg) => set({ orbitElevation: deg }),
  setOrbitRevolutions: (n) => set({ orbitRevolutions: n }),
  setOrbitDirection: (d) => set({ orbitDirection: d }),
  setDurationSeconds: (s) => set({ durationSeconds: s }),
  setFps: (f) => set({ fps: f }),

  exportWidth: 480,
  exportHeight: 480,
  cropMode: 'contain',
  maxColors: 256,
  setExportWidth: (n) => set({ exportWidth: n }),
  setExportHeight: (n) => set({ exportHeight: n }),
  setCropMode: (m) => set({ cropMode: m }),
  setMaxColors: (n) => set({ maxColors: n }),

  isExporting: false,
  exportProgress: 0,
  exportResultUrl: null,
  setExporting: (b) => set({ isExporting: b }),
  setExportProgress: (p) => set({ exportProgress: p }),
  setExportResultUrl: (url) => set({ exportResultUrl: url }),
}));
