import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const CanvasElement = ({ shapeProps, isSelected, onSelect, onChange, onDelete, onDuplicate }) => {
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
        <>
          <Transformer ref={trRef} rotateEnabled={true} />
          {/* Floating Object Menu */}
          <Group x={shapeProps.x} y={shapeProps.y - 50}>
            <Rect width={120} height={35} fill="white" cornerRadius={5} shadowBlur={5} />
            <Text text="🗑️" x={10} y={10} onClick={onDelete} />
            <Text text="📑" x={45} y={10} onClick={onDuplicate} />
            <Text text="•••" x={85} y={10} onClick={() => alert('Options: Lock, Flip, Opacity')} />
          </Group>
        </>
      )}
    </React.Fragment>
  );
};

function App() {
  const [elements, setElements] = useState([]); // Layers stack
  const [selectedId, setSelectedId] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  const assets = {
    bg: ['https://images.unsplash.com/photo-1557683316-973673baf926?w=400'],
    char: ['https://img.icons8.com/color/200/lion.png', 'https://img.icons8.com/fluency/200/business-man.png']
  };

  const addItem = (url, type) => {
    const id = `el-${Date.now()}`;
    // Naya element hamesha stack ke upar jayega
    setElements([...elements, { id, url, type, x: 100, y: 100, start: 0, duration: 5, scaleX: 1, scaleY: 1, rotation: 0 }]);
    setActiveDrawer(null);
  };

  const duplicateItem = (id) => {
    const item = elements.find(el => el.id === id);
    if(item) {
      addItem(item.url, item.type);
    }
  };

  // Canvas Pan (Free Move) logic
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = scale;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);
  };

  return (
    <div className="ak-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki</div>
        <div className="header-actions">
           <select onChange={(e) => setRatio(e.target.value === '16:9' ? {w:480,h:270} : {w:360,h:450})}>
              <option value="4:5">4:5 Insta</option>
              <option value="16:9">16:9 YT</option>
           </select>
           <button className="ak-btn-blue">Export</button>
        </div>
      </header>

      <div className="ak-body">
        <aside className="ak-sidebar-pro">
          <div className="tool-btn" onClick={() => setActiveDrawer('bg')}>🖼️ <span>BG</span></div>
          <div className="tool-btn" onClick={() => setActiveDrawer('char')}>👤 <span>Char</span></div>
        </aside>

        <div className={`ak-slide-panel ${activeDrawer ? 'open' : ''}`}>
           <div className="drawer-head"><h3>Select {activeDrawer}</h3> <button onClick={() => setActiveDrawer(null)}>×</button></div>
           <div className="asset-grid-scroll">
              {assets[activeDrawer]?.map(url => <img src={url} key={url} onClick={() => addItem(url, activeDrawer)} alt="asset"/>)}
           </div>
        </div>

        <main className="ak-viewport">
          <Stage 
            width={window.innerWidth - 90} 
            height={window.innerHeight - 260}
            draggable // Enables free moving of the whole world
            onWheel={handleWheel}
            scaleX={scale}
            scaleY={scale}
            x={stagePos.x}
            y={stagePos.y}
            onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
          >
            <Layer>
              {/* Base Layer - Fixed Duration Reference */}
              <Rect width={ratio.w} height={ratio.h} fill="#ffffff" shadowBlur={10} x={window.innerWidth/4} y={50} />
              
              {elements.map((el, i) => (
                <CanvasElement 
                  key={el.id} 
                  shapeProps={{...el, x: el.x + window.innerWidth/4, y: el.y + 50}} 
                  isSelected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  onDelete={() => setElements(elements.filter(e => e.id !== el.id))}
                  onDuplicate={() => duplicateItem(el.id)}
                  onChange={(newAttrs) => {
                    const items = elements.slice();
                    items[i] = {...newAttrs, x: newAttrs.x - window.innerWidth/4, y: newAttrs.y - 50};
                    setElements(items);
                  }}
                />
              ))}
            </Layer>
          </Stage>
        </main>
      </div>

      <footer className="ak-timeline-v2">
        <div className="timeline-controls">0:00 / 0:05 <button>+ Add Audio</button></div>
        <div className="timeline-scroll">
          {/* Layers rendered in reverse (top-most element = top-most track) */}
          {[...elements].reverse().map(el => (
            <div key={el.id} className={`track-line ${el.id === selectedId ? 'selected-track' : ''}`} onClick={() => setSelectedId(el.id)}>
              <div className="track-label">{el.type}</div>
              <div className="track-bar-container">
                <div className="track-bar" style={{ width: el.duration * 50, left: el.start * 50 }}>
                   <div className="resize-handle left"></div>
                   <div className="resize-handle right"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
export default App;
