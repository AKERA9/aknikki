import React, { useState, useEffect } from 'react';
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
  const [ratio, setRatio] = useState({ w: 360, h: 450 }); // Default 4:5
  const [customSize, setCustomSize] = useState({ w: '', h: '' });

  const assets = {
    bg: [
      { id: 1, name: 'Nature', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80' },
      { id: 2, name: 'Space', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=300&q=80' }
    ],
    char: [
      { id: 101, name: 'Lion', url: 'https://img.icons8.com/color/150/lion.png' },
      { id: 102, name: 'Robot', url: 'https://img.icons8.com/color/150/robot-vacuum.png' }
    ]
  };

  const handleRatioChange = (e) => {
    const val = e.target.value;
    if (val === '16:9') setRatio({ w: 480, h: 270 });
    else if (val === '9:16') setRatio({ w: 270, h: 480 });
    else if (val === '4:5') setRatio({ w: 360, h: 450 });
    else if (val === 'custom') setActiveDrawer('custom-size');
  };

  const addItem = (url) => {
    setElements([...elements, { id: Date.now(), url, x: 50, y: 50 }]);
    setActiveDrawer(null);
  };

  return (
    <div className="aknikki-container">
      {/* Top Bar - Fixed */}
      <header className="aknikki-header">
        <div className="logo">Aknikki</div>
        <select onChange={handleRatioChange}>
          <option value="4:5">4:5 (Insta)</option>
          <option value="16:9">16:9 (YouTube)</option>
          <option value="9:16">9:16 (Reels)</option>
          <option value="custom">Custom Size</option>
        </select>
        <button className="btn-save">Save</button>
      </header>

      {/* Main Workspace */}
      <main className="aknikki-canvas-area">
        <div className="canvas-wrapper" style={{ width: ratio.w, height: ratio.h }}>
          <Stage width={ratio.w} height={ratio.h}>
            <Layer>
              <Rect width={ratio.w} height={ratio.h} fill="#fff" />
              {elements.map((el) => <CanvasElement key={el.id} url={el.url} x={el.x} y={el.y} />)}
            </Layer>
          </Stage>
        </div>

        {/* Floating Drawers */}
        {activeDrawer && activeDrawer !== 'custom-size' && (
          <div className="aknikki-drawer">
            <input type="text" placeholder={`Search ${activeDrawer}...`} className="search-bar" />
            <div className="asset-grid">
              {assets[activeDrawer]?.map(item => (
                <img key={item.id} src={item.url} alt={item.name} onClick={() => addItem(item.url)} />
              ))}
            </div>
          </div>
        )}

        {activeDrawer === 'custom-size' && (
          <div className="aknikki-drawer custom-input">
            <input type="number" placeholder="Width" onChange={(e) => setCustomSize({...customSize, w: e.target.value})} />
            <input type="number" placeholder="Height" onChange={(e) => setCustomSize({...customSize, h: e.target.value})} />
            <button onClick={() => { setRatio({w: Number(customSize.w), h: Number(customSize.h)}); setActiveDrawer(null); }}>Set Size</button>
          </div>
        )}
      </main>

      {/* Timeline Section */}
      <div className="aknikki-timeline">
        <div className="track">Track 1: Characters <button className="kf-btn">+ Keyframe</button></div>
        <div className="track">Track 2: Backgrounds</div>
      </div>

      {/* Bottom Menu - Fixed & Slideable */}
      <nav className="aknikki-bottom-menu">
        <div className="menu-item" onClick={() => setActiveDrawer('bg')}>🖼️ BG</div>
        <div className="menu-item" onClick={() => setActiveDrawer('char')}>👤 Char</div>
        <div className="menu-item">🎵 Audio</div>
        <div className="menu-item">✏️ Text</div>
        <div className="menu-item">✨ FX</div>
      </nav>
    </div>
  );
}

export default App;
