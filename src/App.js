import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const CanvasObject = ({ shapeProps, isSelected, onSelect, onChange, onDelete, onDuplicate }) => {
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
      <Group>
        {isSelected && (
          <Group x={shapeProps.x} y={shapeProps.y - 50} scaleX={1/shapeProps.scaleX || 1}>
            <Rect width={120} height={40} fill="white" cornerRadius={5} shadowBlur={5} />
            <Text text="🗑️" x={10} y={10} onClick={onDelete} />
            <Text text="📑" x={45} y={10} onClick={onDuplicate} />
            <Text text="⋮" x={85} y={10} fontSize={20} />
          </Group>
        )}
        <KonvaImage
          image={img}
          ref={shapeRef}
          {...shapeProps}
          draggable
          onClick={onSelect}
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
      </Group>
      {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
    </React.Fragment>
  );
};

// Placeholder for Konva Text since we need to import it properly
const Text = ({ text, x, y, onClick, fontSize = 16 }) => (
  <Rect x={x} y={y} width={30} height={30} onClick={onClick} />
);

function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  // Free Pan Logic
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = scale;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
  };

  const addElement = (url, type) => {
    const newEl = {
      id: `el-${Date.now()}`, url, type,
      x: 100, y: 100, scaleX: 1, scaleY: 1, rotation: 0,
      start: 0, duration: 5 // Default 5 seconds
    };
    setElements([newEl, ...elements]); // Newest on top
    setSelectedId(newEl.id);
  };

  return (
    <div className="ak-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki Pro</div>
        <div className="ak-actions">
           <select onChange={(e) => setRatio(e.target.value === '16:9' ? {w:600, h:337} : {w:360, h:450})}>
              <option value="4:5">4:5 Insta</option>
              <option value="16:9">16:9 YouTube</option>
           </select>
           <button className="ak-btn-blue">Export</button>
        </div>
      </header>

      <div className="ak-body">
        <aside className="ak-sidebar">
          <div className="tool" onClick={() => addElement('https://img.icons8.com/color/200/lion.png', 'char')}>👤 Char</div>
          <div className="tool" onClick={() => addElement('https://images.unsplash.com/photo-1557683316-973673baf926?w=400', 'bg')}>🖼️ BG</div>
        </aside>

        <main className="ak-canvas-free">
          <Stage
            width={window.innerWidth - 100}
            height={window.innerHeight - 300}
            draggable // Free Pan Enabled
            onWheel={handleWheel}
            scaleX={scale}
            scaleY={scale}
            x={stagePos.x}
            y={stagePos.y}
            onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
          >
            <Layer>
              {/* Base Fixed Layer (Video Background) */}
              <Rect width={ratio.w} height={ratio.h} fill="white" shadowBlur={10} stroke="#ddd" />
              
              {/* Flexible Layers - Reversed to show newest on top */}
              {[...elements].reverse().map((el, i) => (
                <CanvasObject
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(newAttrs) => {
                    const items = elements.slice();
                    const index = items.findIndex(x => x.id === el.id);
                    items[index] = newAttrs;
                    setElements(items);
                  }}
                  onDelete={() => setElements(elements.filter(x => x.id !== el.id))}
                />
              ))}
            </Layer>
          </Stage>
          
          <div className="zoom-indicator">Zoom: {Math.round(scale * 100)}% | Drag Canvas Freely</div>
        </main>
      </div>

      <footer className="ak-timeline-canva">
        <div className="timeline-labels">
          {elements.map(el => (
            <div key={el.id} className={`label-item ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
              {el.type}
            </div>
          ))}
        </div>
        <div className="timeline-tracks">
          {elements.map(el => (
            <div key={el.id} className="track-row">
              <div 
                className={`track-block ${el.id === selectedId ? 'selected' : ''}`}
                style={{ left: el.start * 20, width: el.duration * 30 }}
                onClick={() => setSelectedId(el.id)}
              >
                <div className="resize-handle left"></div>
                {el.type}
                <div className="resize-handle right"></div>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
export default App;
