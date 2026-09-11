import { useState } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import { exportGif } from '../lib/gifExport';
import Panel from './Panel';

export default function ExportPanel() {
  const exportWidth = useSceneStore((s) => s.exportWidth);
  const setExportWidth = useSceneStore((s) => s.setExportWidth);
  const exportHeight = useSceneStore((s) => s.exportHeight);
  const setExportHeight = useSceneStore((s) => s.setExportHeight);
  const cropMode = useSceneStore((s) => s.cropMode);
  const setCropMode = useSceneStore((s) => s.setCropMode);
  const maxColors = useSceneStore((s) => s.maxColors);
  const setMaxColors = useSceneStore((s) => s.setMaxColors);

  const modelObject = useSceneStore((s) => s.modelObject);
  const modelBoundingRadius = useSceneStore((s) => s.modelBoundingRadius);
  const backgroundMode = useSceneStore((s) => s.backgroundMode);
  const backgroundColor = useSceneStore((s) => s.backgroundColor);
  const animationMode = useSceneStore((s) => s.animationMode);
  const spinAxis = useSceneStore((s) => s.spinAxis);
  const spinRevolutions = useSceneStore((s) => s.spinRevolutions);
  const spinDirection = useSceneStore((s) => s.spinDirection);
  const orbitElevation = useSceneStore((s) => s.orbitElevation);
  const orbitRevolutions = useSceneStore((s) => s.orbitRevolutions);
  const orbitDirection = useSceneStore((s) => s.orbitDirection);
  const durationSeconds = useSceneStore((s) => s.durationSeconds);
  const fps = useSceneStore((s) => s.fps);

  const isExporting = useSceneStore((s) => s.isExporting);
  const setExporting = useSceneStore((s) => s.setExporting);
  const exportProgress = useSceneStore((s) => s.exportProgress);
  const setExportProgress = useSceneStore((s) => s.setExportProgress);
  const exportResultUrl = useSceneStore((s) => s.exportResultUrl);
  const setExportResultUrl = useSceneStore((s) => s.setExportResultUrl);

  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (!modelObject) {
      setError('Load a model before exporting.');
      return;
    }
    setError(null);
    setExporting(true);
    setExportProgress(0);
    if (exportResultUrl) URL.revokeObjectURL(exportResultUrl);
    setExportResultUrl(null);

    try {
      const blob = await exportGif({
        width: exportWidth,
        height: exportHeight,
        fps,
        durationSeconds,
        cropMode,
        backgroundMode,
        backgroundColor,
        boundingRadius: modelBoundingRadius,
        animationMode,
        spinAxis,
        spinRevolutions,
        spinDirection,
        orbitElevationDeg: orbitElevation,
        orbitRevolutions,
        orbitDirection,
        maxColors,
        onProgress: setExportProgress,
      });
      const url = URL.createObjectURL(blob);
      setExportResultUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  const presets = [
    { label: '240×240', w: 240, h: 240 },
    { label: '480×480', w: 480, h: 480 },
    { label: '600×400', w: 600, h: 400 },
    { label: '800×600', w: 800, h: 600 },
  ];

  return (
    <Panel title="6. Export GIF">
      <div className="field-row">
        <label>Width</label>
        <input
          type="number"
          min={16}
          max={1200}
          value={exportWidth}
          onChange={(e) => setExportWidth(Number(e.target.value))}
        />
      </div>
      <div className="field-row">
        <label>Height</label>
        <input
          type="number"
          min={16}
          max={1200}
          value={exportHeight}
          onChange={(e) => setExportHeight(Number(e.target.value))}
        />
      </div>
      <div className="row">
        {presets.map((p) => (
          <button
            key={p.label}
            className="btn btn-ghost"
            onClick={() => {
              setExportWidth(p.w);
              setExportHeight(p.h);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="field-row">
        <label>Fit</label>
        <select value={cropMode} onChange={(e) => setCropMode(e.target.value as 'contain' | 'cover')}>
          <option value="contain">Contain (show whole object)</option>
          <option value="cover">Cover (fill frame, may crop)</option>
        </select>
      </div>

      <div className="field-row">
        <label>Colors</label>
        <input
          type="range"
          min={8}
          max={256}
          step={8}
          value={maxColors}
          onChange={(e) => setMaxColors(Number(e.target.value))}
        />
        <span className="field-value">{maxColors}</span>
      </div>

      <button className="btn btn-primary" onClick={handleExport} disabled={isExporting || !modelObject}>
        {isExporting ? `Rendering… ${Math.round(exportProgress * 100)}%` : 'Export GIF'}
      </button>

      {error && <div className="warning">{error}</div>}

      {exportResultUrl && (
        <div className="export-result">
          <img src={exportResultUrl} alt="Exported GIF preview" className="export-preview" />
          <a className="btn" href={exportResultUrl} download="model-animation.gif">
            Download GIF
          </a>
        </div>
      )}
    </Panel>
  );
}
