import { useSceneStore } from '../store/useSceneStore';
import Panel from './Panel';

export default function AnimationPanel() {
  const animationMode = useSceneStore((s) => s.animationMode);
  const setAnimationMode = useSceneStore((s) => s.setAnimationMode);

  const spinAxis = useSceneStore((s) => s.spinAxis);
  const setSpinAxis = useSceneStore((s) => s.setSpinAxis);
  const spinRevolutions = useSceneStore((s) => s.spinRevolutions);
  const setSpinRevolutions = useSceneStore((s) => s.setSpinRevolutions);
  const spinDirection = useSceneStore((s) => s.spinDirection);
  const setSpinDirection = useSceneStore((s) => s.setSpinDirection);

  const orbitElevation = useSceneStore((s) => s.orbitElevation);
  const setOrbitElevation = useSceneStore((s) => s.setOrbitElevation);
  const orbitRevolutions = useSceneStore((s) => s.orbitRevolutions);
  const setOrbitRevolutions = useSceneStore((s) => s.setOrbitRevolutions);
  const orbitDirection = useSceneStore((s) => s.orbitDirection);
  const setOrbitDirection = useSceneStore((s) => s.setOrbitDirection);

  const durationSeconds = useSceneStore((s) => s.durationSeconds);
  const setDurationSeconds = useSceneStore((s) => s.setDurationSeconds);
  const fps = useSceneStore((s) => s.fps);
  const setFps = useSceneStore((s) => s.setFps);

  return (
    <Panel title="5. Animation">
      <div className="row">
        <label className="radio">
          <input
            type="radio"
            checked={animationMode === 'none'}
            onChange={() => setAnimationMode('none')}
          />
          Static
        </label>
        <label className="radio">
          <input
            type="radio"
            checked={animationMode === 'spin'}
            onChange={() => setAnimationMode('spin')}
          />
          Spin object
        </label>
        <label className="radio">
          <input
            type="radio"
            checked={animationMode === 'orbit'}
            onChange={() => setAnimationMode('orbit')}
          />
          Orbit camera
        </label>
      </div>

      {animationMode === 'spin' && (
        <>
          <div className="field-row">
            <label>Axis</label>
            <select value={spinAxis} onChange={(e) => setSpinAxis(e.target.value as 'x' | 'y' | 'z')}>
              <option value="x">X</option>
              <option value="y">Y</option>
              <option value="z">Z</option>
            </select>
          </div>
          <div className="field-row">
            <label>Direction</label>
            <select
              value={spinDirection}
              onChange={(e) => setSpinDirection(Number(e.target.value) as 1 | -1)}
            >
              <option value={1}>Clockwise</option>
              <option value={-1}>Counter-clockwise</option>
            </select>
          </div>
          <div className="field-row">
            <label>Revolutions / loop</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={spinRevolutions}
              onChange={(e) => setSpinRevolutions(Number(e.target.value))}
            />
          </div>
        </>
      )}

      {animationMode === 'orbit' && (
        <>
          <div className="field-row">
            <label>Elevation</label>
            <input
              type="range"
              min={-89}
              max={89}
              step={1}
              value={orbitElevation}
              onChange={(e) => setOrbitElevation(Number(e.target.value))}
            />
            <span className="field-value">{orbitElevation}°</span>
          </div>
          <div className="field-row">
            <label>Direction</label>
            <select
              value={orbitDirection}
              onChange={(e) => setOrbitDirection(Number(e.target.value) as 1 | -1)}
            >
              <option value={1}>Clockwise</option>
              <option value={-1}>Counter-clockwise</option>
            </select>
          </div>
          <div className="field-row">
            <label>Revolutions / loop</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={orbitRevolutions}
              onChange={(e) => setOrbitRevolutions(Number(e.target.value))}
            />
          </div>
        </>
      )}

      <div className="field-row">
        <label>Loop duration</label>
        <input
          type="number"
          min={0.5}
          step={0.5}
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(Number(e.target.value))}
        />
        <span className="field-value">sec</span>
      </div>
      <div className="field-row">
        <label>Frame rate</label>
        <input
          type="number"
          min={5}
          max={50}
          step={1}
          value={fps}
          onChange={(e) => setFps(Number(e.target.value))}
        />
        <span className="field-value">fps</span>
      </div>
    </Panel>
  );
}
