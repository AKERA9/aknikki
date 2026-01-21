import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// Floating Control for Objects
const FloatingMenu = ({ x, y, onDelete, onDuplicate }) => (
  <Group x={x} y={y - 50}>
    <Rect width={100} height={32} fill="#ffffff" cornerRadius={6} shadowBlur={10} shadowOpacity={0.15} />
    <Text text="🗑️" x={12} y={8} onClick={onDelete} cursor="pointer" />
    <Text text="📑" x={42} y={8} onClick={onDuplicate} cursor="pointer" />
    <Text text="•••" x={72} y={8} cursor="pointer" />
  </Group>
);

const RenderElement = ({ el, isSelected, onSelect, onChange, onDelete, onDuplicate }) => {
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
        <Text {...commonProps} text={el.content} fontSize={el.fontSize} fill={el.fill} />
      ) : (
        <KonvaImage {...commonProps} image={img} />
      )}
      {isSelected && (
        <>
          <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => Math.abs(newBox.width) < 5 ? oldBox : newBox} />
          <FloatingMenu x={el.x} y={el.y} onDelete={onDelete} onDuplicate={onDuplicate} />
        </>
      )}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [uploadTab, setUploadTab] = useState('Images'); // Tabs: Images, Videos, Audio
  const [zoom, setZoom] = useState(0.8);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  const addItem = (type, data = {}) => {
    const id = `el-${Date.now()}`;
    const newEl = type === 'Text' 
      ? { id, type, content: data.content || 'New Text', x: 50, y: 150, fontSize: 30, fill: '#000', start: 0, duration: 5 }
      : { id, type, url: data.url, x: 50, y: 50, start: 0, duration: 5, scaleX: 1, scaleY: 1, rotation: 0 };
    
    setElements([...elements, newEl]);
    setActivePanel(null);
    setSelectedId(id);
  };

  return (
    <div className="ak-pro-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki <span>Pro</span></div>
        <div className="header-right">
          <select className="ratio-select" onChange={(e) => setRatio(e.target.value === '16:9' ? {w:640,h:360} : {w:360,h:450})}>
            <option value="4:5">4:5 Insta</option>
            <option value="16:9">16:9 YT</option>
          </select>
          <button className="export-btn">Export</button>
        </div>
      </header>

      <div className="ak-main">
        {/* Sidebar */}
        <aside className="ak-sidebar">
          <div className={`side-item ${activePanel === 'BG' ? 'on' : ''}`} onClick={() => setActivePanel('BG')}>🖼️<span>BG</span></div>
          <div className={`side-item ${activePanel === 'Char' ? 'on' : ''}`} onClick={() => setActivePanel('Char')}>👤<span>Char</span></div>
          <div className={`side-item ${activePanel === 'Text' ? 'on' : ''}`} onClick={() => setActivePanel('Text')}>T<span>Text</span></div>
          <div className={`side-item ${activePanel === 'Audio' ? 'on' : ''}`} onClick={() => setActivePanel('Audio')}>🎵<span>Audio</span></div>
          <div className={`side-item ${activePanel === 'Upload' ? 'on' : ''}`} onClick={() => setActivePanel('Upload')}>📤<span>Upload</span></div>
        </aside>

        {/* Sliding Panel */}
        <div className={`ak-panel ${activePanel ? 'open' : ''}`}>
          <div className="panel-top">
            <h3>{activePanel}</h3>
            <button onClick={() => setActivePanel(null)}>×</button>
          </div>

          {/* Special Upload Tabs */}
          {activePanel === 'Upload' && (
            <div className="upload-tabs">
              <button className={uploadTab === 'Images' ? 'active' : ''} onClick={() => setUploadTab('Images')}>Images</button>
              <button className={uploadTab === 'Videos' ? 'active' : ''} onClick={() => setUploadTab('Videos')}>Videos</button>
              <button className={uploadTab === 'Audio' ? 'active' : ''} onClick={() => setUploadTab('Audio')}>Audio</button>
            </div>
          )}

          <div className="panel-content">
            {activePanel === 'Text' && (
              <div className="text-options">
                <button onClick={() => addItem('Text', {content: 'Heading'})} className="add-text-btn h1">Add Heading</button>
                <button onClick={() => addItem('Text', {content: 'Subheading'})} className="add-text-btn h2">Add Subheading</button>
              </div>
            )}
            {activePanel === 'BG' && (
              <div className="asset-grid">
                <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200" onClick={() => addItem('BG', {url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'})} alt="bg"/>
              </div>
            )}
            {activePanel === 'Upload' && (
              <div className="upload-section">
                <label className="upload-box">
                  <input type="file" hidden />
                  <span>Click to Upload {uploadTab}</span>
                </label>
                <div className="empty-msg">No {uploadTab} Uploaded Yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Area */}
        <main className="ak-workspace">
          <div className="stage-center" style={{ transform: `scale(${zoom})` }}>
            <Stage width={ratio.w} height={ratio.h} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#fff" shadowBlur={15} shadowOpacity={0.1} />
                {elements.map((el, i) => (
                  <RenderElement 
                    key={el.id} el={el} isSelected={el.id === selectedId}
                    onSelect={() => setSelectedId(el.id)}
                    onDelete={() => setElements(elements.filter(e => e.id !== el.id))}
                    onDuplicate={() => setElements([...elements, {...el, id: `el-${Date.now()}`, x: el.x + 20}])}
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
          <div className="zoom-control">
            <input type="range" min="0.2" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
            <span>{Math.round(zoom * 100)}%</span>
          </div>
        </main>
      </div>

      {/* Timeline with Placeholders */}
      <footer className="ak-timeline">
        <div className="tl-container">
          <div className="tl-track-placeholder">Backgrounds</div>
          <div className="tl-track-placeholder">Characters / Elements</div>
          <div className="tl-track-placeholder">Audio Clips</div>
          
          {/* Active Layers Render here */}
          {elements.map(el => (
            <div key={el.id} className={`tl-row ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
              <div className="tl-label">{el.type}</div>
              <div className="tl-bar-bg"><div className="tl-bar" style={{ width: el.duration * 30, left: el.start * 30 }}>{el.type}</div></div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
  }
  
