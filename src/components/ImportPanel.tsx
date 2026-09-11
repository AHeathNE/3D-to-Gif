import { useRef } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import { PRIMITIVE_LABELS } from '../lib/primitives';
import type { PrimitiveShape } from '../lib/primitives';
import Panel from './Panel';

const SAMPLE_SHAPES: PrimitiveShape[] = ['cube', 'sphere', 'pyramid'];

export default function ImportPanel() {
  const modelFile = useSceneStore((s) => s.modelFile);
  const sampleShape = useSceneStore((s) => s.sampleShape);
  const modelHasUVs = useSceneStore((s) => s.modelHasUVs);
  const modelObject = useSceneStore((s) => s.modelObject);
  const setModelFile = useSceneStore((s) => s.setModelFile);
  const setSampleShape = useSceneStore((s) => s.setSampleShape);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'stl') {
      setModelFile(file, 'stl');
    } else if (ext === 'obj') {
      setModelFile(file, 'obj');
    } else {
      alert('Please choose an .stl or .obj file.');
    }
  }

  const loadedLabel = modelFile ? modelFile.name : sampleShape ? PRIMITIVE_LABELS[sampleShape] : null;

  return (
    <Panel title="1. Import Model">
      <input
        ref={inputRef}
        type="file"
        accept=".stl,.obj"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button className="btn" onClick={() => inputRef.current?.click()}>
        Choose STL / OBJ file
      </button>

      <div className="field-hint">Or start with a sample shape:</div>
      <div className="row">
        {SAMPLE_SHAPES.map((shape) => (
          <button
            key={shape}
            className={sampleShape === shape ? 'btn' : 'btn btn-ghost'}
            onClick={() => setSampleShape(shape)}
          >
            {PRIMITIVE_LABELS[shape]}
          </button>
        ))}
      </div>

      {loadedLabel && (
        <div className="field-hint">
          Loaded: {loadedLabel}
          {modelObject && !modelHasUVs && (
            <div className="warning">
              This model has no texture coordinates — a simple planar UV projection was
              generated automatically, so textures may look approximate.
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
