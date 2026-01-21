import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// Context Menu (Canva Style Bottom Popup)
const ContextMenu = ({ onClose, onDelete, onDuplicate }) => (
  <div className="context-menu-overlay" onClick={onClose}>
    <div className="context-menu" onClick={e => e.stopPropagation()}>
      <div className="drag-handle"></div>
      <div className="menu-items-row">
        <div className="c-item" onClick={onDuplicate}>
          <div className="c-icon">📑</div>
          <span>Copy</span>
        </div>
        <div className="c-item" onClick={onDuplicate}>
          <div className="c-icon">📋</div>
          <span>Paste</span>
        </div>
        <div className="c-item delete" onClick={onDelete}>
          <div className="c-icon">🗑️</div>
          <span>Delete</span>
        </div>
      </div>
      <div className="menu-list">
        <div className="list-item"><span>🔒</span> Lock Element</div>
        <div className="list-item"><span>↕️</span> Layer Order</div>
        <div className="list-item"><span>Transparency</span></div>
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
      {isSelected && (
        <Transformer 
          ref={trRef} 
          anchorSize={12} 
          borderStroke="#7E22CE" 
          anchorStroke="#7E22CE" 
          anchorFill="#fff" 
          borderDash={[4, 4]}
        />
      )}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState(null); 
  const [zoom, setZoom] = useState(0.55); // Mobile fit

  const assets = {
    Elements: [
      { url: 'https://img.icons8.com/color/200/lion.png' },
      { url: 'https://img.icons8.com/fluency/200/business-man.png' },
      { url: 'https://img.icons8.com/color/200/robot-3.png' }
    ],
  };

  const addItem = (type, data = {}) => {
    const newEl = type === 'Text' 
      ? { id: `el-${Date.now()}`, type, content: 'Add Text', x: 50, y: 150, fontSize: 40, fill: '#000' }
      : { id: `el-${Date.now()}`, type, url: data.url, x: 50, y: 50, scaleX: 1, scaleY: 1, rotation: 0 };
    
    setElements([...elements, newEl]);
    setActiveTab(null);
  };

  return (
    <div className="mobile-app">
      {/* 1. Gradient Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="round-btn">🏠</div>
          <div className="round-btn">↩</div>
          <div className="round-btn">↪</div>
        </div>
        <div className="header-right">
          <div className="round-btn">•••</div>
          <button className="export-pill">⬆</button>
        </div>
      </header>

      {/* 2. Workspace (Gray Background) */}
      <main className="workspace">
        <div className="canvas-shadow-box" style={{ transform: `scale(${zoom})` }}>
          <Stage width={360} height={640} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
            <Layer>
              <Rect width={360} height={640} fill="#fff" />
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

      {/* 3. Timeline Strip (Just above menu) */}
      <div className="timeline-strip">
        <div className="timer">0:00 <span className="play-triangle">▶</span> 0:05</div>
        <div className="timeline-content">
          <div className="timeline-add">+</div>
          <div className="frame-thumb active">
             <div className="thumb-content">Page 1</div>
          </div>
          <div className="frame-thumb">
             <div className="thumb-content">Page 2</div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Tab Bar (Fixed) */}
      <nav className="bottom-tabs">
        <div className="tab-item" onClick={() => setActiveTab('Design')}>
           <div className="tab-icon">🎨</div>
           <span>Design</span>
        </div>
        <div className="tab-item" onClick={() => setActiveTab('Elements')}>
           <div className="tab-icon">❤️</div>
           <span>Elements</span>
        </div>
        <div className="tab-item" onClick={() => setActiveTab('Text')}>
           <div className="tab-icon">T</div>
           <span>Text</span>
        </div>
        <div className="tab-item" onClick={() => setActiveTab('Gallery')}>
           <div className="tab-icon">📷</div>
           <span>Gallery</span>
        </div>
        <div className="tab-item" onClick={() => setActiveTab('Brand')}>
           <div className="tab-icon">©️</div>
           <span>Brand</span>
        </div>
      </nav>

      {/* 5. Bottom Sheet (Content Drawer) */}
      {activeTab && (
        <div className="sheet-container">
          <div className="sheet-backdrop" onClick={() => setActiveTab(null)}></div>
          <div className="sheet-modal">
            <div className="sheet-drag-handle"></div>
            <div className="sheet-search">
              <span>🔍</span>
              <input placeholder={`Search ${activeTab}...`} autoFocus />
            </div>
            
            <div className="sheet-body">
              {activeTab === 'Elements' && (
                <>
                  <div className="section-title">Recently Used</div>
                  <div className="grid-row">
                    {assets.Elements.map(a => <img key={a.url} src={a.url} onClick={() => addItem('Img', a)} className="grid-item" alt="el"/>)}
                  </div>
                  <div className="section-title">Shapes</div>
                  <div className="grid-row">
                     <div className="shape-box circle" onClick={() => addItem('Text')}></div>
                     <div className="shape-box square" onClick={() => addItem('Text')}></div>
                     <div className="shape-box tri" onClick={() => addItem('Text')}></div>
                  </div>
                </>
              )}
              {activeTab === 'Text' && (
                <div className="text-stack">
                  <button className="add-heading-btn" onClick={() => addItem('Text')}>Add a heading</button>
                  <button className="add-sub-btn" onClick={() => addItem('Text')}>Add a subheading</button>
                  <button className="add-body-btn" onClick={() => addItem('Text')}>Add a little bit of body text</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Context Menu Logic */}
      {selectedId && (
        <ContextMenu 
          onClose={() => setSelectedId(null)}
          onDelete={() => { setElements(elements.filter(e => e.id !== selectedId)); setSelectedId(null); }}
          onDuplicate={() => {
             const el = elements.find(e => e.id === selectedId);
             setElements([...elements, { ...el, id: `el-${Date.now()}`, x: el.x + 20 }]);
          }}
        />
      )}
    </div>
  );
  }
            
