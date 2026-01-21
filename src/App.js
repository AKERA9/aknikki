import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// Context Menu Component for Objects
const ObjectControl = ({ x, y, onDelete, onDuplicate }) => (
  <Group x={x} y={y - 55}>
    <Rect width={110} height={35} fill="white" cornerRadius={8} shadowBlur={10} shadowOpacity={0.1} />
    <Text text="🗑️" x={12} y={10} onClick={onDelete} />
    <Text text="📑" x={45} y={10} onClick={onDuplicate} />
    <Text text="•••" x={78} y={10} />
  </Group>
);

const CanvasItem = ({ shapeProps, isSelected, onSelect, onChange, onDelete, onDuplicate }) => {
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
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          onChange({
            ...shapeProps,
            x: node.x(), y: node.y(),
            scaleX: node.scaleX(), scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <>
          <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => Math.abs(newBox.width) < 5 ? oldBox : newBox} />
          <ObjectControl x={shapeProps.x} y={shapeProps.y} onDelete={onDelete} onDuplicate={onDuplicate} />
        </>
      )}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  const assets = {
    BG: ['https://images.unsplash.com/photo-1557683316-973673baf926?w=400', 'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=400'],
    Char: ['https://img.icons8.com/color/200/lion.png', 'https://img.icons8.com/fluency/200/business-man.png']
  };

  const addItem = (url, type) => {
    const id = `el-${Date.now()}`;
    setElements([...elements, { id, url, type, x: 50, y: 50, start: 0, duration: 5, rotation: 0, scaleX: 1, scaleY: 1 }]);
    setActivePanel(null);
  };

  return (
    <div className="aknikki-pro-root">
      {/* Top Navbar */}
      <header className="ak-top-nav">
        <div className="ak-brand">Aknikki <span>Pro</span></div>
        <div className="ak-nav-tools">
          <select onChange={(e) => setRatio(e.target.value === '16:9' ? {w:640,h:360} : {w:360,h:450})}>
            <option value="4:5">4:5 Insta</option>
            <option value="16:9">16:9 YouTube</option>
          </select>
          <button className="ak-export-btn">Export Video</button>
        </div>
      </header>

      <div className="ak-main-layout">
        {/* Sidebar */}
        <aside className="ak-side-menu">
          <div className={`menu-item ${activePanel === 'BG' ? 'active' : ''}`} onClick={() => setActivePanel(activePanel === 'BG' ? null : 'BG')}>🖼️<span>Background</span></div>
          <div className={`menu-item ${activePanel === 'Char' ? 'active' : ''}`} onClick={() => setActivePanel(activePanel === 'Char' ? null : 'Char')}>👤<span>Character</span></div>
          <div className="menu-item">🎵<span>Audio</span></div>
          <div className="menu-item">T<span>Text</span></div>
        </aside>

        {/* Sliding Side Panel */}
        <div className={`ak-side-panel ${activePanel ? 'visible' : ''}`}>
          <div className="panel-header">
            <h3>Select {activePanel}</h3>
            <button onClick={() => setActivePanel(null)}>×</button>
          </div>
          <div className="panel-content">
            {assets[activePanel]?.map(url => (
              <div key={url} className="asset-box" onClick={() => addItem(url, activePanel)}>
                <img src={url} alt="asset" />
              </div>
            ))}
          </div>
        </div>

        {/* Center Canvas Area */}
        <main className="ak-canvas-workspace">
          <div className="canvas-container" style={{ transform: `scale(${zoom})` }}>
            <Stage width={ratio.w} height={ratio.h} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#ffffff" shadowBlur={15} shadowOpacity={0.05} />
                {elements.map((el, i) => (
                  <CanvasItem 
                    key={el.id} shapeProps={el} isSelected={el.id === selectedId} 
                    onSelect={() => setSelectedId(el.id)}
                    onDelete={() => setElements(elements.filter(e => e.id !== el.id))}
                    onDuplicate={() => setElements([...elements, {...el, id: `el-${Date.now()}`, x: el.x + 15}])}
                    onChange={(newAttrs) => {
                      const newElements = [...elements];
                      newElements[i] = newAttrs;
                      setElements(newElements);
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </div>

          {/* Zoom Slider */}
          <div className="ak-zoom-bar">
            <span>-</span>
            <input type="range" min="0.5" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
            <span>+</span>
            <div className="zoom-value">{Math.round(zoom * 100)}%</div>
          </div>
        </main>
      </div>

      {/* Modern Timeline */}
      <footer className="ak-bottom-timeline">
        <div className="timeline-header">
           <div className="time-display">00:00:00 / 00:00:10</div>
           <div className="play-controls">⏮ ⏸ ⏭</div>
        </div>
        <div className="timeline-layers">
          {elements.map(el => (
            <div key={el.id} className={`layer-row ${el.id === selectedId ? 'selected' : ''}`} onClick={() => setSelectedId(el.id)}>
              <div className="layer-info">{el.type}</div>
              <div className="layer-track">
                <div className="layer-pill" style={{ width: el.duration * 40, left: el.start * 40 }}>{el.type}</div>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
