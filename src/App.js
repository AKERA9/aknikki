import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const URLImage = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const [img] = useImage(shapeProps.url);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5 ? oldBox : newBox)}
        />
      )}
    </React.Fragment>
  );
};

function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [scale, setScale] = useState(1);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  const assets = {
    bg: ['https://images.unsplash.com/photo-1557683316-973673baf926?w=400', 'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=400'],
    char: ['https://img.icons8.com/color/200/lion.png', 'https://img.icons8.com/fluency/200/business-man.png', 'https://img.icons8.com/color/200/super-mario.png']
  };

  const addItem = (url, type) => {
    const id = `el-${Date.now()}`;
    setElements([...elements, { id, url, type, x: 50, y: 50, start: 0, duration: 5, rotation: 0, scaleX: 1, scaleY: 1 }]);
    setActiveDrawer(null);
  };

  const deleteElement = () => {
    setElements(elements.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="ak-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki</div>
        <div className="header-actions">
          <select className="ak-select" onChange={(e) => setRatio(e.target.value === '16:9' ? {w:480,h:270} : {w:360,h:450})}>
            <option value="4:5">4:5 Insta</option>
            <option value="16:9">16:9 YT</option>
          </select>
          <button className="ak-btn-blue">Export</button>
        </div>
      </header>

      <div className="ak-body">
        {/* Professional Sidebar */}
        <aside className="ak-sidebar-pro">
          <div className={`tool-btn ${activeDrawer === 'bg' ? 'active' : ''}`} onClick={() => setActiveDrawer(activeDrawer === 'bg' ? null : 'bg')}>
            🖼️ <span>BG</span>
          </div>
          <div className={`tool-btn ${activeDrawer === 'char' ? 'active' : ''}`} onClick={() => setActiveDrawer(activeDrawer === 'char' ? null : 'char')}>
            👤 <span>Char</span>
          </div>
          <div className="tool-btn" onClick={deleteElement} style={{opacity: selectedId ? 1 : 0.3}}>
            🗑️ <span>Del</span>
          </div>
        </aside>

        {/* Smooth Slide Panel */}
        <div className={`ak-slide-panel ${activeDrawer ? 'open' : ''}`}>
          <div className="drawer-head">
            <h3>Select {activeDrawer}</h3>
            <button onClick={() => setActiveDrawer(null)}>×</button>
          </div>
          <div className="asset-grid-scroll">
            {assets[activeDrawer]?.map(url => (
              <div key={url} className="asset-card" onClick={() => addItem(url, activeDrawer)}>
                <img src={url} alt="asset"/>
              </div>
            ))}
          </div>
        </div>

        {/* Viewport with Zoom */}
        <main className="ak-viewport" onMouseDown={(e) => e.target === e.currentTarget && setSelectedId(null)}>
          <div className="zoom-bar">
            <button onClick={() => setScale(scale + 0.1)}>+</button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(scale - 0.1)}>-</button>
          </div>
          <div className="canvas-holder" style={{ transform: `scale(${scale})` }}>
            <Stage width={ratio.w} height={ratio.h} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#fff" stroke="#ddd" />
                {elements.map((el, i) => (
                  <URLImage 
                    key={el.id} 
                    shapeProps={el} 
                    isSelected={el.id === selectedId} 
                    onSelect={() => setSelectedId(el.id)}
                    onChange={(newAttrs) => {
                      const newElements = elements.slice();
                      newElements[i] = newAttrs;
                      setElements(newElements);
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </main>
      </div>

      {/* Draggable Timeline Layout */}
      <footer className="ak-timeline-v2">
        <div className="timeline-labels">
          {elements.map(el => <div key={el.id} className="label">{el.type}</div>)}
        </div>
        <div className="timeline-tracks-area">
          {elements.map(el => (
            <div key={el.id} className={`track-line ${el.id === selectedId ? 'active-track' : ''}`} onClick={() => setSelectedId(el.id)}>
              <div className="track-bar" style={{ left: el.start * 30, width: el.duration * 50 }}>
                {el.id === selectedId && <span className="drag-handle"></span>}
                {el.type}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;

