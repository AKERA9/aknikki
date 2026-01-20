import React, { useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const CanvasElement = ({ url, x, y }) => {
  const [img] = useImage(url);
  return <KonvaImage image={img} x={x} y={y} draggable />;
};

function App() {
  const [elements, setElements] = useState([]);
  const [activeDrawer, setActiveDrawer] = useState(null);

  const addItem = (type) => {
    const newItem = {
      id: Date.now(),
      type: type,
      url: type === 'bg' ? 'https://via.placeholder.com/1920x1080/2c3e50' : 'https://via.placeholder.com/200/e74c3c',
      x: 100,
      y: 100
    };
    setElements([...elements, newItem]);
    setActiveDrawer(null);
  };

  return (
    <div className="aknikki-container">
      {/* Top Header: Aspect Ratio & Controls */}
      <header className="aknikki-header">
        <div className="logo">Aknikki</div>
        <div className="ratio-selector">
          <select>
            <option>4:5 (Insta)</option>
            <option>16:9 (YouTube)</option>
            <option>9:16 (Reels)</option>
          </select>
        </div>
        <button className="btn-save">Save Project</button>
      </header>

      <div className="aknikki-workspace">
        {/* Left Toolbar */}
        <aside className="aknikki-sidebar">
          <div className="tool" onClick={() => setActiveDrawer('bg')}>🖼️ BG</div>
          <div className="tool" onClick={() => setActiveDrawer('char')}>👤 Char</div>
          <div className="tool">🎵 Audio</div>
        </aside>

        {/* Dynamic Search/Asset Drawer */}
        {activeDrawer && (
          <div className="aknikki-drawer">
            <div className="drawer-header">
              <input type="text" placeholder={`Search ${activeDrawer}...`} autoFocus />
              <button onClick={() => setActiveDrawer(null)}>×</button>
            </div>
            <div className="asset-list">
              <div className="asset-card" onClick={() => addItem(activeDrawer)}>
                Sample {activeDrawer}
              </div>
            </div>
          </div>
        )}

        {/* Animation Canvas */}
        <main className="aknikki-canvas-area">
          <div className="canvas-wrapper">
            <Stage width={360} height={450} className="main-stage">
              <Layer>
                <Rect width={360} height={450} fill="#ffffff" />
                {elements.map((el) => (
                  <CanvasElement key={el.id} url={el.url} x={el.x} y={el.y} />
                ))}
              </Layer>
            </Stage>
          </div>
        </main>
      </div>

      {/* VN Style Timeline */}
      <footer className="aknikki-timeline">
        <div className="timeline-header">
          <div className="time-code">00:00:00.00 / 00:00:06.00</div>
          <div className="playback-btns">⏮ ⏸ ⏭</div>
        </div>
        <div className="timeline-tracks">
          <div className="track">Track 1: Characters <button className="kf-btn">+ Keyframe</button></div>
          <div className="track">Track 2: Backgrounds</div>
          <div className="track">Track 3: Audio</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

