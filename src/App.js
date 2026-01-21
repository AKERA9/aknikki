import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// Context Menu
const ContextMenu = ({ onClose, onDelete, onDuplicate }) => (
  <div className="context-menu-overlay" onClick={onClose}>
    <div className="context-menu" onClick={e => e.stopPropagation()}>
      <div className="drag-handle"></div>
      <div className="menu-items-row">
        <div className="c-item" onClick={onDuplicate}><div className="c-icon">📑</div><span>Copy</span></div>
        <div className="c-item" onClick={onDuplicate}><div className="c-icon">📋</div><span>Paste</span></div>
        <div className="c-item delete" onClick={onDelete}><div className="c-icon">🗑️</div><span>Delete</span></div>
      </div>
    </div>
  </div>
);

const RenderElement = ({ el, isSelected, onSelect, onChange }) => {
  const [img] = useImage(el.url || '');
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => onChange({ ...el, x: e.target.x(), y: e.target.y() });
  const handleTransformEnd = () => {
    const node = shapeRef.current;
    onChange({ ...el, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
  };

  return (
    <React.Fragment>
      {el.type === 'Text' ? (
        <Text {...el} draggable onClick={onSelect} onTap={onSelect} ref={shapeRef} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} />
      ) : (
        <KonvaImage {...el} image={img} draggable onClick={onSelect} onTap={onSelect} ref={shapeRef} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} />
      )}
      {isSelected && <Transformer ref={trRef} anchorSize={10} borderStroke="#7E22CE" anchorFill="#fff" />}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  
  // Canvas Scaling State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Canvas Size (Internal Resolution)
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920; // 9:16 Ratio

  // Auto-Fit Logic
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 40;
      
      const scaleX = (clientWidth - padding) / CANVAS_WIDTH;
      const scaleY = (clientHeight - padding) / CANVAS_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      
      setScale(newScale);
    }
  }, []); // Run once on mount

  const assets = {
    Elements: [
      { url: 'https://img.icons8.com/color/200/lion.png' },
      { url: 'https://img.icons8.com/fluency/200/business-man.png' },
    ],
  };

  const addItem = (type, data = {}) => {
    const newEl = type === 'Text' 
      ? { id: `el-${Date.now()}`, type, content: 'Text', x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2, fontSize: 80, fill: '#000' }
      : { id: `el-${Date.now()}`, type, url: data.url, x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2, scaleX: 1, scaleY: 1, rotation: 0 };
    setElements([...elements, newEl]);
    setActiveTab(null);
  };

  return (
    <div className="canva-mobile-shell">
      {/* 1. Header (Fixed) */}
      <header className="c-header">
        <div className="icon-btn">🏠</div>
        <div className="c-title">Aknikki Design</div>
        <div className="header-actions">
           <div className="icon-btn">•••</div>
           <button className="c-export">⬆</button>
        </div>
      </header>

      {/* 2. Workspace (Flexible Center) */}
      <main className="c-workspace" ref={containerRef}>
        <div className="canvas-wrapper" 
             style={{ 
               width: CANVAS_WIDTH, 
               height: CANVAS_HEIGHT, 
               transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)` 
             }}>
          <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
            <Layer>
              <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#ffffff" />
              {elements.map((el, i) => (
                <RenderElement 
                  key={el.id} el={el} isSelected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(newAttrs) => {
                    const copy = [...elements];
                    copy[i] = newAttrs;
                    setElements(copy);
                  }}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </main>

      {/* 3. Timeline (Canva Style) */}
      <div className="c-timeline-area">
         <div className="timeline-meta">
            <span className="time-text">0:04 / 0:10</span>
            <button className="play-btn">▶</button>
         </div>
         <div className="timeline-strip">
            <div className="playhead-line"></div>
            <div className="track-scroll">
               <div className="track-item active">
                  <div className="track-thumb">1</div>
               </div>
               <div className="track-item">
                  <div className="track-thumb">2</div>
               </div>
               <div className="track-add">+</div>
            </div>
         </div>
      </div>

      {/* 4. Bottom Menu (Fixed) */}
      <nav className="c-bottom-nav">
        {['Design', 'Elements', 'Text', 'Gallery', 'Uploads'].map(item => (
           <div key={item} className={`nav-tab ${activeTab === item ? 'active' : ''}`} onClick={() => setActiveTab(item)}>
              <div className="nav-icon">{item === 'Elements' ? '❤️' : item === 'Text' ? 'T' : item === 'Gallery' ? '📷' : '🎨'}</div>
              <span>{item}</span>
           </div>
        ))}
      </nav>

      {/* 5. Bottom Sheet (Overlay) */}
      {activeTab && (
        <div className="c-sheet-overlay" onClick={() => setActiveTab(null)}>
           <div className="c-sheet" onClick={e => e.stopPropagation()}>
              <div className="sheet-handle"></div>
              <div className="sheet-search">
                 <span>🔍</span>
                 <input placeholder={`Search ${activeTab}`} />
              </div>
              <div className="sheet-content">
                 {activeTab === 'Elements' && (
                    <div className="c-grid">
                       {assets.Elements.map(a => <img key={a.url} src={a.url} onClick={() => addItem('Img', a)} alt="el"/>)}
                    </div>
                 )}
                 {activeTab === 'Text' && (
                    <div className="text-list">
                       <button className="txt-btn h1" onClick={() => addItem('Text')}>Add Heading</button>
                       <button className="txt-btn h2" onClick={() => addItem('Text')}>Add Subheading</button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {selectedId && <ContextMenu onClose={() => setSelectedId(null)} onDelete={() => {setElements(elements.filter(e => e.id !== selectedId)); setSelectedId(null)}} />}
    </div>
  );
  }
  
