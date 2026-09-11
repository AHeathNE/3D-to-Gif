import { useRef } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import Panel from './Panel';

export default function TexturePanel() {
  const textureFile = useSceneStore((s) => s.textureFile);
  const setTextureFile = useSceneStore((s) => s.setTextureFile);
  const textureRepeatX = useSceneStore((s) => s.textureRepeatX);
  const textureRepeatY = useSceneStore((s) => s.textureRepeatY);
  const setTextureRepeat = useSceneStore((s) => s.setTextureRepeat);
  const textureTransparencyMode = useSceneStore((s) => s.textureTransparencyMode);
  const setTextureTransparencyMode = useSceneStore((s) => s.setTextureTransparencyMode);
  const textureBackdropColor = useSceneStore((s) => s.textureBackdropColor);
  const setTextureBackdropColor = useSceneStore((s) => s.setTextureBackdropColor);
  const baseColor = useSceneStore((s) => s.baseColor);
  const setBaseColor = useSceneStore((s) => s.setBaseColor);
  const metalness = useSceneStore((s) => s.metalness);
  const setMetalness = useSceneStore((s) => s.setMetalness);
  const roughness = useSceneStore((s) => s.roughness);
  const setRoughness = useSceneStore((s) => s.setRoughness);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Panel title="2. Texture & Material">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => setTextureFile(e.target.files?.[0] ?? null)}
      />
      <div className="row">
        <button className="btn" onClick={() => inputRef.current?.click()}>
          {textureFile ? 'Replace texture image' : 'Choose texture image'}
        </button>
        {textureFile && (
          <button className="btn btn-ghost" onClick={() => setTextureFile(null)}>
            Remove
          </button>
        )}
      </div>
      {textureFile && <div className="field-hint">Loaded: {textureFile.name}</div>}

      {textureFile && (
        <div className="field-row">
          <label>Repeat U</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={textureRepeatX}
            onChange={(e) => setTextureRepeat(Number(e.target.value), textureRepeatY)}
          />
          <label>Repeat V</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={textureRepeatY}
            onChange={(e) => setTextureRepeat(textureRepeatX, Number(e.target.value))}
          />
        </div>
      )}

      {textureFile && (
        <>
          <div className="field-hint">If this image has transparent areas:</div>
          <div className="row">
            <label className="radio">
              <input
                type="radio"
                checked={textureTransparencyMode === 'seeThrough'}
                onChange={() => setTextureTransparencyMode('seeThrough')}
              />
              See through object
            </label>
            <label className="radio">
              <input
                type="radio"
                checked={textureTransparencyMode === 'fillColor'}
                onChange={() => setTextureTransparencyMode('fillColor')}
              />
              Fill with color
            </label>
          </div>
          {textureTransparencyMode === 'fillColor' && (
            <div className="field-row">
              <label>Fill color</label>
              <input
                type="color"
                value={textureBackdropColor}
                onChange={(e) => setTextureBackdropColor(e.target.value)}
              />
            </div>
          )}
          {textureTransparencyMode === 'seeThrough' && (
            <div className="field-hint">
              Opaque images are unaffected. An animated GIF is used as a static
              texture (only its first frame).
            </div>
          )}
        </>
      )}

      {!textureFile && (
        <div className="field-row">
          <label>Base color</label>
          <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} />
        </div>
      )}

      <div className="field-row">
        <label>Metalness</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={metalness}
          onChange={(e) => setMetalness(Number(e.target.value))}
        />
        <span className="field-value">{metalness.toFixed(2)}</span>
      </div>
      <div className="field-row">
        <label>Roughness</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={roughness}
          onChange={(e) => setRoughness(Number(e.target.value))}
        />
        <span className="field-value">{roughness.toFixed(2)}</span>
      </div>
    </Panel>
  );
}
