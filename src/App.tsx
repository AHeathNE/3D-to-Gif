import Viewport from './components/Viewport';
import ImportPanel from './components/ImportPanel';
import TexturePanel from './components/TexturePanel';
import BackgroundPanel from './components/BackgroundPanel';
import OrientationPanel from './components/OrientationPanel';
import AnimationPanel from './components/AnimationPanel';
import ExportPanel from './components/ExportPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>3D → GIF Workstation</h1>
        <p>Import an STL/OBJ model, texture it, animate it, and export a looping GIF.</p>
      </header>
      <main className="app-body">
        <div className="viewport-column">
          <Viewport />
        </div>
        <div className="sidebar">
          <ImportPanel />
          <TexturePanel />
          <BackgroundPanel />
          <OrientationPanel />
          <AnimationPanel />
          <ExportPanel />
        </div>
      </main>
    </div>
  );
}

export default App;
