import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// 1. Canva Style Action Sheet (Bottom Menu)
const ActionSheet = ({ onClose, onDelete, onDuplicate, onLayerUp, onLayerDown }) => (
  <div className="action-sheet-overlay" onClick={onClose}>
    <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
      <div className="sheet-handle"></div>
      <div className="sheet-grid">
        <div className="sheet-item" onClick={onDuplicate}><div className="sheet-icon">📑</div><span>Duplicate</span></div>
        <div className="sheet-item" onClick={onLayerUp}><div className="sheet-icon">🔼</div><span>Bring Fwd</span></div>
        <div className="sheet-item" onClick={onLayerDown}><div className="sheet-icon">🔽</div><span>Send Back</span></div>
        <div className="sheet-item delete" onClick={onDelete}><div className="sheet-icon">🗑️</div><span>Delete</span></div>
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

  const commonProps = {
    ...el,
    ref: shapeRef,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e) => onChange({ ...el, x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const node = shapeRef.current;
      onChange({ ...el, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
    }
  };

  return (
    <React.Fragment>
      {el.type === 'Text' ? (
        <Text {...commonProps} text={el.content} fontSize={el.fontSize} fill={el.fill} padding={10} />
      ) : (
        <KonvaImage {...commonProps} image={img} />
      )}
      {isSelected && (
        <Transformer 
          ref={trRef} 
          anchorStroke="#8b3dff" 
          anchorFill="#fff" 
          anchorSize={10} 
          borderStroke="#8b3dff" 
          borderDash={[4, 4]} 
        />
      )}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('Elements'); // Elements, Uploads, Text
  const [showMenu, setShowMenu] = useState(false); // Bottom Sheet State
  const [zoom, setZoom] = useState(0.8);
  
  // Timeline Logic
  const [duration, setDuration] = useState(5); // Default clip duration

  const assets = {
    Elements: [
      { name: 'Lion', url: 'https://img.icons8.com/color/200/lion.png' },
      { name: 'Shape', url: 'https://img.icons8.com/fluency/200/geometric-shape.png' }
    ],
    Uploads: [],
  };

  const addItem = (type, data = {}) => {
    const id = `el-${Date.now()}`;
    const newEl = type === 'Text' 
      ? { id, type, content: 'Happy Republic Day', x: 50, y: 150, fontSize: 32, fill: '#333', duration: 5 }
      : { id, type, url: data.url, x: 50, y: 50, scaleX: 1, scaleY: 1, rotation: 0, duration: 5 };
    
    setElements([...elements, newEl]);
    setSelectedId(id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    setElements(elements.filter(e => e.id !== selectedId));
    setShowMenu(false);
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    const el = elements.find(e => e.id === selectedId);
    if (el) {
      setElements([...elements, { ...el, id: `el-${Date.now()}`, x: el.x + 20, y: el.y + 20 }]);
      setShowMenu(false);
    }
  };

  return (
    <div className="canva-layout">
      {/* 1. Clean Top Bar (Like Canva) */}
      <header className="top-bar">
        <div className="home-icon">🏠</div>
        <div className="file-menu">File</div>
        <div className="spacer"></div>
        <button className="pro-export-btn">Share</button>
      </header>

      <div className="main-area">
        {/* 2. Floating Sidebar (Rounded & Clean) */}
        <aside className="floating-sidebar">
          <div className={`nav-icon ${activeTab === 'Elements' ? 'active' : ''}`} onClick={() => setActiveTab('Elements')}>
            <span className="icon">🎨</span><span>Elements</span>
          </div>
          <div className={`nav-icon ${activeTab === 'Text' ? 'active' : ''}`} onClick={() => setActiveTab('Text')}>
            <span className="icon">T</span><span>Text</span>
          </div>
          <div className={`nav-icon ${activeTab === 'Uploads' ? 'active' : ''}`} onClick={() => setActiveTab('Uploads')}>
            <span className="icon">☁️</span><span>Uploads</span>
          </div>
        </aside>

        {/* 3. Sliding Panel (White & Smooth) */}
        {activeTab && (
          <div className="side-panel">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input placeholder={`Search ${activeTab}...`} />
            </div>
            
            <div className="assets-container">
               {activeTab === 'Text' && (
                 <div className="text-presets">
                   <button className="add-heading" onClick={() => addItem('Text')}>Add a heading</button>
                   <button className="add-subheading" onClick={() => addItem('Text')}>Add a subheading</button>
                 </div>
               )}
               {activeTab === 'Elements' && (
                 <div className="grid-2">
                   {assets.Elements.map(a => <img key={a.url} src={a.url} onClick={() => addItem('Img', a)} alt="el"/>)}
                 </div>
               )}
               {/* Close Tab */}
               <button className="close-tab" onClick={() => setActiveTab(null)}>◀</button>
            </div>
          </div>
        )}

        {/* 4. Canvas Center (Gray Background like Canva) */}
        <div className="canvas-wrapper">
          <div className="canvas-whiteboard" style={{ transform: `scale(${zoom})` }}>
            <Stage width={360} height={640} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={360} height={640} fill="#ffffff" shadowBlur={20} shadowColor="rgba(0,0,0,0.1)" />
                {elements.map((el, i) => (
                  <RenderElement 
                    key={el.id} el={el} isSelected={el.id === selectedId}
                    onSelect={() => { setSelectedId(el.id); setShowMenu(true); }}
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
        </div>
      </div>

      {/* 5. Canva Style Timeline (Filmstrip Look) */}
      <div className="timeline-area">
        <div className="timeline-controls">
          <span>0:00 / 0:05</span>
          <button className="play-btn">▶</button>
        </div>
        <div className="timeline-track-container">
           {/* Plus Button inside Timeline */}
           <button className="add-timeline-btn">+</button> 
           
           <div className="track-scroll">
             {elements.map(el => (
               <div key={el.id} className={`clip-box ${el.id === selectedId ? 'selected' : ''}`} onClick={() => setSelectedId(el.id)}>
                  {/* White Handles for Trimming */}
                  <div className="handle left"></div>
                  <div className="clip-content">
                    <span className="clip-icon">{el.type === 'Text' ? 'T' : '🖼️'}</span>
                    <span className="clip-duration">5.0s</span>
                  </div>
                  <div className="handle right"></div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* 6. Action Sheet (Popup Menu) */}
      {showMenu && selectedId && (
        <ActionSheet 
          onClose={() => setShowMenu(false)}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onLayerUp={() => alert('Moved Up')}
          onLayerDown={() => alert('Moved Down')}
        />
      )}
    </div>
  );
  }
  
