import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '../store/useSceneStore';
import { loadModelFile } from '../lib/loadModel';
import { createPrimitiveModel } from '../lib/primitives';
import { disposeObject3D } from '../lib/disposeObject3D';
import { applyMaterialToObject, compositeTextureWithBackdrop, loadTextureFromFile } from '../lib/applyMaterial';
import { composeBackgroundTexture } from '../lib/backgroundImage';
import { engineRefs } from '../lib/engineRefs';

function ModelController({ spinGroupRef }: { spinGroupRef: RefObject<THREE.Group | null> }) {
  const modelFile = useSceneStore((s) => s.modelFile);
  const modelFileKind = useSceneStore((s) => s.modelFileKind);
  const sampleShape = useSceneStore((s) => s.sampleShape);
  const modelObject = useSceneStore((s) => s.modelObject);
  const setModelObject = useSceneStore((s) => s.setModelObject);

  const textureFile = useSceneStore((s) => s.textureFile);
  const textureRepeatX = useSceneStore((s) => s.textureRepeatX);
  const textureRepeatY = useSceneStore((s) => s.textureRepeatY);
  const textureTransparencyMode = useSceneStore((s) => s.textureTransparencyMode);
  const textureBackdropColor = useSceneStore((s) => s.textureBackdropColor);
  const baseColor = useSceneStore((s) => s.baseColor);
  const metalness = useSceneStore((s) => s.metalness);
  const roughness = useSceneStore((s) => s.roughness);

  const [rawTexture, setRawTexture] = useState<THREE.Texture | null>(null);
  const [resolvedTexture, setResolvedTexture] = useState<THREE.Texture | null>(null);

  // Load model (from an imported file, or a built-in sample shape)
  useEffect(() => {
    let cancelled = false;
    const group = spinGroupRef.current;
    if (!group) return;

    const modelPromise = modelFile && modelFileKind
      ? loadModelFile(modelFile, modelFileKind)
      : sampleShape
        ? Promise.resolve(createPrimitiveModel(sampleShape))
        : null;
    if (!modelPromise) return;

    modelPromise.then(({ object, boundingRadius, hasUVs }) => {
      if (cancelled || !group) return;
      group.children.forEach((child) => disposeObject3D(child));
      group.clear();
      group.add(object);
      setModelObject(object, boundingRadius, hasUVs);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelFile, modelFileKind, sampleShape]);

  // Load texture
  useEffect(() => {
    let cancelled = false;
    if (!textureFile) {
      setRawTexture((prev) => {
        prev?.dispose();
        return null;
      });
      return;
    }
    loadTextureFromFile(textureFile).then((tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      setRawTexture((prev) => {
        prev?.dispose();
        return tex;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [textureFile]);

  // Resolve the texture actually applied to the material: as-loaded (so its
  // alpha channel makes the surface see-through), or composited over a matte
  // backdrop color so transparent areas become opaque instead.
  useEffect(() => {
    setResolvedTexture((prev) => {
      if (prev && prev !== rawTexture) prev.dispose();
      if (!rawTexture) return null;
      if (textureTransparencyMode === 'fillColor') {
        return compositeTextureWithBackdrop(rawTexture, textureBackdropColor);
      }
      return rawTexture;
    });
  }, [rawTexture, textureTransparencyMode, textureBackdropColor]);

  // Texture repeat
  useEffect(() => {
    if (!resolvedTexture) return;
    resolvedTexture.repeat.set(textureRepeatX, textureRepeatY);
    resolvedTexture.needsUpdate = true;
  }, [resolvedTexture, textureRepeatX, textureRepeatY]);

  // Apply material
  useEffect(() => {
    if (!modelObject) return;
    const transparent = !!resolvedTexture && textureTransparencyMode === 'seeThrough';
    applyMaterialToObject(modelObject, { texture: resolvedTexture, transparent, baseColor, metalness, roughness });
  }, [modelObject, resolvedTexture, textureTransparencyMode, baseColor, metalness, roughness]);

  return null;
}

function AnimationPreview({ spinGroupRef }: { spinGroupRef: RefObject<THREE.Group | null> }) {
  const animationMode = useSceneStore((s) => s.animationMode);
  const spinAxis = useSceneStore((s) => s.spinAxis);
  const spinRevolutions = useSceneStore((s) => s.spinRevolutions);
  const spinDirection = useSceneStore((s) => s.spinDirection);
  const durationSeconds = useSceneStore((s) => s.durationSeconds);
  const orbitElevation = useSceneStore((s) => s.orbitElevation);
  const orbitRevolutions = useSceneStore((s) => s.orbitRevolutions);
  const orbitDirection = useSceneStore((s) => s.orbitDirection);

  const { camera } = useThree();
  const azimuthRef = useRef(0);
  const wasOrbitingRef = useRef(false);

  useFrame((_, delta) => {
    const controls = engineRefs.controls;

    if (animationMode === 'spin' && spinGroupRef.current) {
      const revPerSecond = spinRevolutions / Math.max(0.1, durationSeconds);
      spinGroupRef.current.rotation[spinAxis] += spinDirection * revPerSecond * Math.PI * 2 * delta;
    }

    if (!controls) return;

    if (animationMode === 'orbit') {
      if (!wasOrbitingRef.current) {
        // Just entered orbit mode: pick up the azimuth the user last left the
        // camera at, so it doesn't jump when the animation takes over.
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        azimuthRef.current = new THREE.Spherical().setFromVector3(offset).theta;
      }
      wasOrbitingRef.current = true;
      controls.enableRotate = false;
      controls.autoRotate = false;

      // Same formula as the exporter uses, so preview and exported GIF match.
      const revPerSecond = orbitRevolutions / Math.max(0.1, durationSeconds);
      azimuthRef.current += orbitDirection * revPerSecond * Math.PI * 2 * delta;
      const polar = THREE.MathUtils.degToRad(90 - orbitElevation);
      const radius = camera.position.distanceTo(controls.target);
      camera.position.setFromSphericalCoords(radius, polar, azimuthRef.current).add(controls.target);
      controls.update();
    } else {
      wasOrbitingRef.current = false;
      controls.enableRotate = true;
      controls.autoRotate = false;
    }
  });

  return null;
}

function BackgroundController() {
  const backgroundMode = useSceneStore((s) => s.backgroundMode);
  const backgroundColor = useSceneStore((s) => s.backgroundColor);
  const backgroundImageFile = useSceneStore((s) => s.backgroundImageFile);
  const backgroundFitMode = useSceneStore((s) => s.backgroundFitMode);
  const backgroundRepeatCount = useSceneStore((s) => s.backgroundRepeatCount);
  const exportWidth = useSceneStore((s) => s.exportWidth);
  const exportHeight = useSceneStore((s) => s.exportHeight);
  const { scene } = useThree();
  const rawTextureRef = useRef<THREE.Texture | null>(null);
  const composedTextureRef = useRef<THREE.Texture | null>(null);

  // Load the raw background image whenever the file changes.
  useEffect(() => {
    let cancelled = false;
    if (!backgroundImageFile) {
      rawTextureRef.current?.dispose();
      rawTextureRef.current = null;
      return;
    }
    loadTextureFromFile(backgroundImageFile).then((tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      rawTextureRef.current?.dispose();
      rawTextureRef.current = tex;
      recompose();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImageFile]);

  // Composite the raw image at the export frame's resolution using the
  // chosen Fit/Fill/Repeat layout, so what's previewed matches what exports —
  // three.js's scene.background quad can't do aspect-correct fitting itself.
  function recompose() {
    composedTextureRef.current?.dispose();
    composedTextureRef.current = null;
    if (!rawTextureRef.current) return;
    const composed = composeBackgroundTexture(
      rawTextureRef.current.image as CanvasImageSource & { width: number; height: number },
      exportWidth,
      exportHeight,
      backgroundFitMode,
      backgroundRepeatCount,
    );
    composedTextureRef.current = composed;
    if (useSceneStore.getState().backgroundMode === 'image') {
      scene.background = composed;
    }
  }

  useEffect(() => {
    recompose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundFitMode, backgroundRepeatCount, exportWidth, exportHeight]);

  useEffect(() => {
    if (backgroundMode === 'transparent') {
      scene.background = null;
    } else if (backgroundMode === 'color') {
      scene.background = new THREE.Color(backgroundColor);
    } else if (backgroundMode === 'image' && composedTextureRef.current) {
      scene.background = composedTextureRef.current;
    }
  }, [backgroundMode, backgroundColor, scene]);

  return null;
}

function SceneRegistrar({
  orientationGroupRef,
  spinGroupRef,
}: {
  orientationGroupRef: RefObject<THREE.Group | null>;
  spinGroupRef: RefObject<THREE.Group | null>;
}) {
  const { scene, camera } = useThree();
  useEffect(() => {
    engineRefs.scene = scene;
    engineRefs.camera = camera as THREE.PerspectiveCamera;
    engineRefs.orientationGroup = orientationGroupRef.current;
    engineRefs.spinGroup = spinGroupRef.current;
  }, [scene, camera, orientationGroupRef, spinGroupRef]);
  return null;
}

function OrientationApplier({ orientationGroupRef }: { orientationGroupRef: RefObject<THREE.Group | null> }) {
  const rotationX = useSceneStore((s) => s.rotationX);
  const rotationY = useSceneStore((s) => s.rotationY);
  const rotationZ = useSceneStore((s) => s.rotationZ);

  useEffect(() => {
    if (!orientationGroupRef.current) return;
    orientationGroupRef.current.rotation.set(
      THREE.MathUtils.degToRad(rotationX),
      THREE.MathUtils.degToRad(rotationY),
      THREE.MathUtils.degToRad(rotationZ),
    );
  }, [orientationGroupRef, rotationX, rotationY, rotationZ]);

  return null;
}

export default function Viewport() {
  const backgroundMode = useSceneStore((s) => s.backgroundMode);
  const backgroundColor = useSceneStore((s) => s.backgroundColor);
  const exportWidth = useSceneStore((s) => s.exportWidth);
  const exportHeight = useSceneStore((s) => s.exportHeight);
  const orientationGroupRef = useRef<THREE.Group>(null);
  const spinGroupRef = useRef<THREE.Group>(null);

  // Size the viewport to match the export frame's aspect ratio (contain-fit
  // within the available space), so the preview reflects the actual GIF crop.
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setFrameSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const targetAspect = exportWidth / exportHeight || 1;
  let boxSize: { width: number; height: number } | null = null;
  if (frameSize.width > 0 && frameSize.height > 0) {
    const containerAspect = frameSize.width / frameSize.height;
    boxSize =
      containerAspect > targetAspect
        ? { width: frameSize.height * targetAspect, height: frameSize.height }
        : { width: frameSize.width, height: frameSize.width / targetAspect };
  }

  const checkerStyle: CSSProperties =
    backgroundMode === 'transparent' || backgroundMode === 'image'
      ? {
          backgroundImage:
            'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#666',
        }
      : { backgroundColor };

  return (
    <div className="viewport-frame" ref={frameRef}>
      <div className="viewport" style={{ ...checkerStyle, ...boxSize }}>
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [2.2, 1.6, 2.6], fov: 45, near: 0.01, far: 100 }}
        >
          <ambientLight intensity={0.7} />
          <hemisphereLight args={[0xffffff, 0x404040, 0.6]} />
          <directionalLight position={[3, 4, 2]} intensity={1.1} />
          <directionalLight position={[-3, -2, -3]} intensity={0.4} />

          <group ref={orientationGroupRef}>
            <group ref={spinGroupRef} />
          </group>

          <ModelController spinGroupRef={spinGroupRef} />
          <AnimationPreview spinGroupRef={spinGroupRef} />
          <BackgroundController />
          <OrientationApplier orientationGroupRef={orientationGroupRef} />
          <SceneRegistrar orientationGroupRef={orientationGroupRef} spinGroupRef={spinGroupRef} />

          <OrbitControls
            ref={(c) => {
              engineRefs.controls = c;
            }}
            makeDefault
            enableDamping
            dampingFactor={0.1}
          />
        </Canvas>
      </div>
    </div>
  );
}
