import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// Context Menu (Edit/Delete/Duplicate)
const ActionMenu = ({ onClose, onDelete, onDuplicate, onLayerUp }) => (
  <div className="action-menu-overlay" onClick={onClose}>
    <div className="action-menu" onClick={(e) => e.stopPropagation()}>
      <div className="drag-handle"></div>
      <div className="menu-grid">
        <div className="menu-item" onClick={onDuplicate}><span>📑</span><small>Duplicate</small></div>
        <div className="menu-item" onClick={onLayerUp}><span>🔼</span><small>Layer Up</small></div>
        <div className="menu-item delete" onClick={onDelete}><span>🗑️</span><small>Delete</small></div>
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

  return (
    <React.Fragment>
      {el.type === 'Text' ? (
        <Text
          {...el}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          ref={shapeRef}
          onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
          onTransformEnd={() => {
            const node = shapeRef.current;
            onChange({ ...el, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
          }}
        />
      ) : (
        <KonvaImage
          {...el}
          image={img}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          ref={shapeRef}
          onDragEnd={(e) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
          onTransformEnd={() => {
            const node = shapeRef.current;
            onChange({ ...el, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
          }}
        />
      )}
      {isSelected && <Transformer ref={trRef} anchorSize={10} borderStroke="#8b3dff" />}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // Controls Bottom Sheet
  const [zoom, setZoom] = useState(0.6); // Default zoom for mobile view

  // Demo Assets
  const assets = {
    Elements: [
      { url: 'https://img.icons8.com/color/200/lion.png' },
      { url: 'https://img.icons8.com/fluency/200/business-man.png' },
      { url: 'https://img.icons8.com/color/200/robot-3.png' }
    ],
    Uploads: [], // User uploads placeholder
  };

  const addItem = (type, data = {}) => {
    const newEl = type === 'Text' 
      ? { id: `el-${Date.now()}`, type, content: 'Double Tap', x: 50, y: 150, fontSize: 40, fill: '#000', duration: 5 }
      : { id: `el-${Date.now()}`, type, url: data.url, x: 50, y: 50, scaleX: 1, scaleY: 1, rotation: 0, duration: 5 };
    
    setElements([...elements, newEl]);
    setActiveTab(null); // Close sheet after adding
  };

  return (
    <div className="mobile-layout">
      {/* 1. Header (Fixed Top) */}
      <header className="mobile-header">
        <div className="home-btn">🏠</div>
        <div className="app-title">Aknikki</div>
        <button className="export-pill">Export</button>
      </header>

      {/* 2. Workspace (Middle Area) */}
      <main className="mobile-workspace">
        <div className="canvas-frame" style={{ transform: `scale(${zoom})` }}>
          <Stage width={360} height={640} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
            <Layer>
              <Rect width={360} height={640} fill="#fff" shadowBlur={30} shadowOpacity={0.1} />
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

      {/* 3. Timeline (Above Menu) */}
      <div className="mobile-timeline">
        <div className="timeline-info">
          <span>00:00</span>
          <div className="play-circle">▶</div>
          <button className="add-clip-btn">+</button>
        </div>
        <div className="timeline-scroller">
          {elements.map(el => (
            <div key={el.id} className={`clip-card ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
              <div className="clip-icon">{el.type === 'Text' ? 'T' : '🖼️'}</div>
              <div className="clip-handle left"></div>
              <div className="clip-handle right"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Menu (Scrollable Navigation) */}
      <nav className="bottom-nav">
        <div className="nav-scroll-container">
          {['Elements', 'Text', 'Uploads', 'Audio', 'Draw', 'Projects', 'Apps'].map(item => (
            <div key={item} className={`nav-item ${activeTab === item ? 'active' : ''}`} onClick={() => setActiveTab(item)}>
              <div className="nav-icon">
                {item === 'Elements' ? '🎨' : item === 'Text' ? 'T' : item === 'Uploads' ? '☁️' : item === 'Audio' ? '🎵' : '✏️'}
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* 5. Bottom Sheet (Overlay) */}
      {activeTab && (
        <div className="bottom-sheet-overlay" onClick={() => setActiveTab(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="drag-pill"></div>
              <div className="search-bar">
                <span>🔍</span>
                <input placeholder={`Search ${activeTab}...`} autoFocus />
              </div>
            </div>
            
            <div className="sheet-content">
              {activeTab === 'Text' && (
                <div className="text-options">
                  <button className="text-btn big" onClick={() => addItem('Text')}>Add Heading</button>
                  <button className="text-btn small" onClick={() => addItem('Text')}>Add Body Text</button>
                </div>
              )}
              {activeTab === 'Elements' && (
                <div className="grid-2">
                  {assets.Elements.map(a => <img key={a.url} src={a.url} onClick={() => addItem('Img', a)} alt="el"/>)}
                </div>
              )}
              {activeTab === 'Uploads' && <div className="upload-placeholder">Tap to upload media</div>}
            </div>
          </div>
        </div>
      )}

      {/* 6. Context Menu (When Object Selected) */}
      {selectedId && (
        <ActionMenu 
          onClose={() => setSelectedId(null)} 
          onDelete={() => { setElements(elements.filter(e => e.id !== selectedId)); setSelectedId(null); }}
          onDuplicate={() => {
            const el = elements.find(e => e.id === selectedId);
            setElements([...elements, {...el, id: `el-${Date.now()}`, x: el.x + 20}]);
          }}
          onLayerUp={() => alert('Moved up')}
        />
      )}
    </div>
  );
}
  
