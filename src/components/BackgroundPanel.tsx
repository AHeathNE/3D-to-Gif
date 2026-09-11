import { useRef } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import Panel from './Panel';

export default function BackgroundPanel() {
  const backgroundMode = useSceneStore((s) => s.backgroundMode);
  const setBackgroundMode = useSceneStore((s) => s.setBackgroundMode);
  const backgroundColor = useSceneStore((s) => s.backgroundColor);
  const setBackgroundColor = useSceneStore((s) => s.setBackgroundColor);
  const backgroundImageFile = useSceneStore((s) => s.backgroundImageFile);
  const setBackgroundImageFile = useSceneStore((s) => s.setBackgroundImageFile);
  const backgroundFitMode = useSceneStore((s) => s.backgroundFitMode);
  const setBackgroundFitMode = useSceneStore((s) => s.setBackgroundFitMode);
  const backgroundRepeatCount = useSceneStore((s) => s.backgroundRepeatCount);
  const setBackgroundRepeatCount = useSceneStore((s) => s.setBackgroundRepeatCount);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Panel title="3. Background">
      <div className="row">
        <label className="radio">
          <input
            type="radio"
            checked={backgroundMode === 'transparent'}
            onChange={() => setBackgroundMode('transparent')}
          />
          Transparent
        </label>
        <label className="radio">
          <input
            type="radio"
            checked={backgroundMode === 'color'}
            onChange={() => setBackgroundMode('color')}
          />
          Solid color
        </label>
        <label className="radio">
          <input
            type="radio"
            checked={backgroundMode === 'image'}
            onChange={() => setBackgroundMode('image')}
          />
          Image
        </label>
      </div>

      {backgroundMode === 'color' && (
        <div className="field-row">
          <label>Color</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
      )}

      {backgroundMode === 'image' && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => setBackgroundImageFile(e.target.files?.[0] ?? null)}
          />
          <div className="row">
            <button className="btn" onClick={() => inputRef.current?.click()}>
              {backgroundImageFile ? 'Replace background image' : 'Choose background image'}
            </button>
            {backgroundImageFile && (
              <button className="btn btn-ghost" onClick={() => setBackgroundImageFile(null)}>
                Remove
              </button>
            )}
          </div>
          {backgroundImageFile && <div className="field-hint">Loaded: {backgroundImageFile.name}</div>}

          <div className="field-row">
            <label>Sizing</label>
            <select
              value={backgroundFitMode}
              onChange={(e) => setBackgroundFitMode(e.target.value as 'fit' | 'fill' | 'repeat')}
            >
              <option value="fit">Fit (show whole image, may letterbox)</option>
              <option value="fill">Fill (cover frame, may crop)</option>
              <option value="repeat">Repeat (tile across frame)</option>
            </select>
          </div>
          {backgroundFitMode === 'repeat' && (
            <div className="field-row">
              <label>Repeat count</label>
              <input
                type="number"
                min={1}
                max={20}
                step={1}
                value={backgroundRepeatCount}
                onChange={(e) => setBackgroundRepeatCount(Number(e.target.value))}
              />
            </div>
          )}
          <div className="field-hint">
            Transparent areas of the image (and, in Fit mode, any letterbox
            padding) stay transparent in the exported GIF.
          </div>
        </>
      )}

      {backgroundMode === 'transparent' && (
        <div className="field-hint">
          Exported GIF will use 1-bit transparency (GIF doesn't support partial
          transparency).
        </div>
      )}
    </Panel>
  );
}
