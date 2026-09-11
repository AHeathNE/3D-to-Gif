import { useSceneStore } from '../store/useSceneStore';
import Panel from './Panel';

export default function OrientationPanel() {
  const rotationX = useSceneStore((s) => s.rotationX);
  const rotationY = useSceneStore((s) => s.rotationY);
  const rotationZ = useSceneStore((s) => s.rotationZ);
  const setRotation = useSceneStore((s) => s.setRotation);
  const resetRotation = useSceneStore((s) => s.resetRotation);

  const axes: Array<{ key: 'x' | 'y' | 'z'; value: number }> = [
    { key: 'x', value: rotationX },
    { key: 'y', value: rotationY },
    { key: 'z', value: rotationZ },
  ];

  return (
    <Panel title="4. Orient Object">
      {axes.map(({ key, value }) => (
        <div className="field-row" key={key}>
          <label>Rotate {key.toUpperCase()}</label>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={value}
            onChange={(e) => setRotation(key, Number(e.target.value))}
          />
          <span className="field-value">{value}°</span>
        </div>
      ))}
      <button className="btn btn-ghost" onClick={resetRotation}>
        Reset orientation
      </button>
      <div className="field-hint">Drag in the viewport to change the preview camera angle.</div>
    </Panel>
  );
}
