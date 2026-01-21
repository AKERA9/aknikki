import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// Floating Quick Menu (Delete, Duplicate, More)
const FloatingMenu = ({ x, y, onDelete, onDuplicate, onMore }) => (
  <Group x={x} y={y - 60}>
    <Rect width={120} height={35} fill="white" cornerRadius={8} shadowBlur={10} shadowOpacity={0.2} />
    <Text text="🗑️" x={15} y={10} onClick={onDelete} cursor="pointer" fontSize={14} />
    <Text text="📑" x={50} y={10} onClick={onDuplicate} cursor="pointer" fontSize={14} />
    <Text text="•••" x={85} y={10} onClick={onMore} cursor="pointer" fontSize={14} />
  </Group>
);

const RenderElement = ({ el, isSelected, onSelect, onChange, onDelete, onDuplicate, onMore }) => {
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
      onChange({
        ...el,
        x: node.x(), y: node.y(),
        scaleX: node.scaleX(), scaleY: node.scaleY(),
        rotation: node.rotation(),
      });
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
        <>
          <Transformer ref={trRef} rotateEnabled={true} anchorSize={8} borderStroke="#006aff" />
          <FloatingMenu x={el.x} y={el.y} onDelete={onDelete} onDuplicate={onDuplicate} onMore={onMore} />
        </>
      )}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // Left Panel
  const [showProperties, setShowProperties] = useState(false); // Right Panel (3-dots)
  const [uploadTab, setUploadTab] = useState('Image');
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(0.8);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  // Timeline Resizing States
  const [isResizing, setIsResizing] = useState(false);
  const [resizeTargetId, setResizeTargetId] = useState(null);

  const assets = {
    BG: [
      { name: 'Blue Grad', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=300' },
      { name: 'Abstract', url: 'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=300' },
      { name: 'Neon', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300' }
    ],
    Char: [
      { name: 'Lion', url: 'https://img.icons8.com/color/200/lion.png' },
      { name: 'Man', url: 'https://img.icons8.com/fluency/200/business-man.png' },
      { name: 'Robot', url: 'https://img.icons8.com/color/200/robot-3.png' }
    ],
    GIF: [
      { name: 'Cat GIF', url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' },
      { name: 'Loading', url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif' }
    ],
    Video: [
      { name: 'Nature Clip', url: 'https://img.icons8.com/color/200/video-file.png' } // Placeholder for Video
    ]
  };

  const addItem = (type, data = {}) => {
    const id = `el-${Date.now()}`;
    const newEl = type === 'Text' 
      ? { id, type, content: data.content || 'New Text', x: 100, y: 200, fontSize: 30, fill: '#000', start: 0, duration: 5 }
      : { id, type, url: data.url, x: 100, y: 100, start: 0, duration: 5, scaleX: 1, scaleY: 1, rotation: 0 };
    
    setElements([...elements, newEl]);
    setActivePanel(null);
    setSelectedId(id);
    setShowProperties(false);
  };

  // --- Timeline Resize Logic ---
  const handleTimelineMouseDown = (e, id) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeTargetId(id);
  };

  const handleTimelineMouseMove = (e) => {
    if (isResizing && resizeTargetId) {
      // Calculate new duration based on mouse X position
      // Assuming 1 second = 30px width
      const trackStart = document.getElementById('timeline-tracks').getBoundingClientRect().left;
      const mouseX = e.clientX - trackStart;
      
      const newElements = elements.map(el => {
        if (el.id === resizeTargetId) {
          // Find start position in pixels
          const startPx = el.start * 30;
          // New width = Mouse Pos - Start Pos
          let newWidth = mouseX - startPx;
          if (newWidth < 30) newWidth = 30; // Min duration 1 sec
          return { ...el, duration: newWidth / 30 };
        }
        return el;
      });
      setElements(newElements);
    }
  };

  const handleTimelineMouseUp = () => {
    setIsResizing(false);
    setResizeTargetId(null);
  };
  // -----------------------------

  const moveLayer = (direction) => {
    if (!selectedId) return;
    const index = elements.findIndex(e => e.id === selectedId);
    if (index === -1) return;
    
    const newElements = [...elements];
    const targetIndex = index + direction;
    
    if (targetIndex >= 0 && targetIndex < newElements.length) {
      [newElements[index], newElements[targetIndex]] = [newElements[targetIndex], newElements[index]];
      setElements(newElements);
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleTimelineMouseMove);
      window.addEventListener('mouseup', handleTimelineMouseUp);
    } else {
      window.removeEventListener('mousemove', handleTimelineMouseMove);
      window.removeEventListener('mouseup', handleTimelineMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleTimelineMouseMove);
      window.removeEventListener('mouseup', handleTimelineMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="ak-pro-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki <span>Pro</span></div>
        <div className="header-right">
          <select onChange={(e) => setRatio(e.target.value === '16:9' ? {w:640,h:360} : {w:360,h:450})}>
            <option value="4:5">4:5 Insta</option>
            <option value="16:9">16:9 YT</option>
          </select>
          <button className="export-btn">Export</button>
        </div>
      </header>

      <div className="ak-main">
        {/* Left Sidebar */}
        <aside className="ak-sidebar">
          {['BG', 'Char', 'GIF', 'Video', 'Text', 'Audio', 'Upload'].map(item => (
            <div key={item} className={`side-item ${activePanel === item ? 'on' : ''}`} 
                 onClick={() => { setActivePanel(activePanel === item ? null : item); setSearchTerm(""); setShowProperties(false); }}>
              <div className="icon">{item === 'BG' ? '🖼️' : item === 'Char' ? '👤' : item === 'Text' ? 'T' : item === 'Audio' ? '🎵' : item === 'Upload' ? '📤' : item === 'GIF' ? '👾' : '🎥'}</div>
              <span>{item}</span>
            </div>
          ))}
        </aside>

        {/* Left Sliding Panel */}
        <div className={`ak-panel ${activePanel ? 'open' : ''}`}>
          <div className="panel-top">
            <input placeholder={`Search ${activePanel}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-bar" />
            <button className="arrow-close" onClick={() => setActivePanel(null)}>❮</button>
          </div>
          
          {activePanel === 'Upload' && (
             <div className="upload-tabs">
               {['Image', 'Video', 'Audio'].map(t => (
                 <button key={t} className={uploadTab === t ? 'active' : ''} onClick={() => setUploadTab(t)}>{t}</button>
               ))}
             </div>
          )}

          <div className="asset-grid">
            {activePanel === 'Text' && (
              <div className="text-full-row">
                <button onClick={() => addItem('Text', {content: 'Add Heading', fontSize: 35})} className="add-text-btn">Add Heading</button>
                <button onClick={() => addItem('Text', {content: 'Add Body', fontSize: 20})} className="add-text-btn">Add Body</button>
              </div>
            )}
            {activePanel === 'Upload' && <div className="upload-box">Click to Upload {uploadTab}</div>}
            
            {assets[activePanel]?.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map(a => (
              <img key={a.url} src={a.url} onClick={() => addItem(activePanel, {url: a.url})} alt="asset" />
            ))}
          </div>
        </div>

        {/* Center Workspace */}
        <main className="ak-workspace">
          <div className="stage-container" style={{ transform: `scale(${zoom})` }}>
            <Stage width={ratio.w} height={ratio.h} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#fff" shadowBlur={20} shadowOpacity={0.1} />
                {elements.map((el, i) => (
                  <RenderElement key={el.id} el={el} isSelected={el.id === selectedId}
                    onSelect={() => { setSelectedId(el.id); setActivePanel(null); }}
                    onDelete={() => { setElements(elements.filter(e => e.id !== el.id)); setShowProperties(false); }}
                    onDuplicate={() => setElements([...elements, {...el, id: `el-${Date.now()}`, x: el.x + 20}])}
                    onMore={() => setShowProperties(true)}
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
          <div className="zoom-bar-fixed">
            <input type="range" min="0.3" max="1.5" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
            <span>{Math.round(zoom * 100)}%</span>
          </div>
        </main>

        {/* Right Properties Panel (3-Dots Menu) */}
        <div className={`ak-right-panel ${showProperties ? 'open' : ''}`}>
           <div className="rp-header">
             <h3>Properties</h3>
             <button onClick={() => setShowProperties(false)}>×</button>
           </div>
           <div className="rp-content">
             <div className="rp-section">
               <label>Layer Order</label>
               <div className="rp-row">
                 <button onClick={() => moveLayer(1)}>Bring Forward</button>
                 <button onClick={() => moveLayer(-1)}>Send Backward</button>
               </div>
             </div>
             <div className="rp-section">
               <label>Opacity</label>
               <input type="range" min="0" max="1" step="0.1" />
             </div>
             <div className="rp-section">
               <label>Transitions</label>
               <select><option>None</option><option>Fade In</option><option>Slide Left</option></select>
             </div>
             <div className="rp-section">
                <button className="rp-btn-danger" onClick={() => { setElements(elements.filter(e => e.id !== selectedId)); setShowProperties(false); }}>Delete Element</button>
             </div>
           </div>
        </div>
      </div>

      {/* Timeline with Drag Resize */}
      <footer className="ak-timeline">
        <div className="tl-container">
          <div className="tl-labels">
            <div className="tl-title">Layers</div>
            {elements.map(el => (
              <div key={el.id} className={`tl-row-label ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
                <span>{el.type}</span>
              </div>
            ))}
          </div>
          <div className="tl-tracks" id="timeline-tracks">
            <div className="tl-title">Timeline (Drag edge to resize)</div>
            {elements.map(el => (
              <div key={el.id} className={`track-row ${el.id === selectedId ? 'active' : ''}`}>
                <div 
                  className="track-pill" 
                  style={{ width: el.duration * 30, left: el.start * 30 }}
                  onClick={() => setSelectedId(el.id)}
                >
                  <span className="pill-text">{el.type}</span>
                  {/* The Resizer Handle */}
                  <div 
                    className="resize-handle"
                    onMouseDown={(e) => handleTimelineMouseDown(e, el.id)}
                  >||</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
  }
  
