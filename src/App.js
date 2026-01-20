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
  const [ratio, setRatio] = useState({ w: 360, h: 450 }); // Default 4:5
  const [customSize, setCustomSize] = useState({ w: '', h: '' });

  const assets = {
    bg: [
      { id: 1, url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80' },
      { id: 2, url: 'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=400&q=80' }
    ],
    char: [
      { id: 101, url: 'https://img.icons8.com/color/200/lion.png' },
      { id: 102, url: 'https://img.icons8.com/fluency/200/business-man.png' },
      { id: 103, url: 'https://img.icons8.com/color/200/super-mario.png' }
    ]
  };

  const handleRatioChange = (e) => {
    const val = e.target.value;
    if (val === '16:9') setRatio({ w: 480, h: 270 });
    else if (val === '9:16') setRatio({ w: 270, h: 480 });
    else if (val === '4:5') setRatio({ w: 360, h: 450 });
    else if (val === 'custom') setActiveDrawer('custom');
  };

  const addItem = (url) => {
    setElements([...elements, { id: Date.now(), url, x: 50, y: 50 }]);
    setActiveDrawer(null);
  };

  return (
    <div className="aknikki-root">
      {/* Top Header */}
      <header className="ak-header">
        <div className="ak-logo">Aknikki</div>
        <div className="ak-controls">
          <select onChange={handleRatioChange} className="ak-select">
            <option value="4:5">4:5 (Insta)</option>
            <option value="16:9">16:9 (YouTube)</option>
            <option value="9:16">9:16 (Reels)</option>
            <option value="custom">Custom Size</option>
          </select>
          <button className="ak-btn-blue">Export Video</button>
        </div>
      </header>

      <div className="ak-main">
        {/* Left Sidebar */}
        <aside className="ak-sidebar">
          <div className={`ak-tool ${activeDrawer === 'bg' ? 'active' : ''}`} onClick={() => setActiveDrawer('bg')}>🖼️<span>BG</span></div>
          <div className={`ak-tool ${activeDrawer === 'char' ? 'active' : ''}`} onClick={() => setActiveDrawer('char')}>👤<span>Char</span></div>
          <div className="ak-tool">🎵<span>Audio</span></div>
          <div className="ak-tool">T<span>Text</span></div>
        </aside>

        {/* Assets Drawer */}
        {activeDrawer && activeDrawer !== 'custom' && (
          <div className="ak-drawer">
            <div className="drawer-header">
              <h3>Select {activeDrawer}</h3>
              <button onClick={() => setActiveDrawer(null)}>×</button>
            </div>
            <div className="ak-asset-grid">
              {assets[activeDrawer]?.map(item => (
                <img key={item.id} src={item.url} onClick={() => addItem(item.url)} alt="asset" />
              ))}
            </div>
          </div>
        )}

        {/* Custom Size Popup */}
        {activeDrawer === 'custom' && (
          <div className="ak-drawer custom-size-box">
             <input type="number" placeholder="Width" onChange={(e)=>setCustomSize({...customSize, w: e.target.value})} />
             <input type="number" placeholder="Height" onChange={(e)=>setCustomSize({...customSize, h: e.target.value})} />
             <button onClick={()=>{setRatio({w:Number(customSize.w), h:Number(customSize.h)}); setActiveDrawer(null)}}>Apply</button>
          </div>
        )}

        {/* Stage/Canvas */}
        <section className="ak-canvas-container">
          <div className="ak-canvas-wrapper" style={{ width: ratio.w, height: ratio.h }}>
            <Stage width={ratio.w} height={ratio.h}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#f8f9fa" stroke="#dee2e6" strokeWidth={2} />
                {elements.map((el) => <CanvasElement key={el.id} url={el.url} x={el.x} y={el.y} />)}
              </Layer>
            </Stage>
          </div>
        </section>
      </div>

      {/* Timeline */}
      <footer className="ak-timeline">
        <div className="ak-timeline-header">
          <span>00:00:00 / 00:00:06</span>
          <div className="ak-playback">⏮ ⏸ ⏭</div>
          <button className="ak-keyframe-btn">+ Keyframe</button>
        </div>
        <div className="ak-tracks">
          <div className="ak-track">Track 1: Characters</div>
          <div className="ak-track">Track 2: Backgrounds</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
