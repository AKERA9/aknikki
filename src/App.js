import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const CanvasElement = ({ shapeProps, isSelected, onSelect, onChange, onDelete, onDuplicate }) => {
  const [img] = useImage(shapeProps.url);
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
      <KonvaImage
        image={img}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragStart={() => onSelect()}
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
          <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => Math.abs(newBox.width) < 5 ? oldBox : newBox} />
          <Group x={shapeProps.x} y={shapeProps.y - 45}>
            <Rect width={80} height={30} fill="white" cornerRadius={5} shadowBlur={10} shadowOpacity={0.2} />
            <Text text="🗑️" x={10} y={8} onClick={onDelete} />
            <Text text="📑" x={35} y={8} onClick={onDuplicate} />
            <Text text="•••" x={60} y={8} />
          </Group>
        </>
      )}
    </React.Fragment>
  );
};

function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  const assets = {
    bg: ['https://images.unsplash.com/photo-1557683316-973673baf926?w=400', 'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=400'],
    char: ['https://img.icons8.com/color/200/lion.png', 'https://img.icons8.com/fluency/200/business-man.png']
  };

  const addItem = (url, type) => {
    const id = `el-${Date.now()}`;
    setElements([...elements, { id, url, type, x: 50, y: 50, start: 0, duration: 5, scaleX: 1, scaleY: 1, rotation: 0 }]);
    setActiveDrawer(null);
  };

  return (
    <div className="ak-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki Pro</div>
        <div className="header-actions">
           <select className="ak-select" onChange={(e) => setRatio(e.target.value === '16:9' ? {w:640,h:360} : {w:360,h:450})}>
              <option value="4:5">4:5 Insta</option>
              <option value="16:9">16:9 YouTube</option>
           </select>
           <button className="ak-btn-blue">Export</button>
        </div>
      </header>

      <div className="ak-body">
        <aside className="ak-sidebar">
          <div className={`tool-btn ${activeDrawer === 'bg' ? 'active' : ''}`} onClick={() => setActiveDrawer(activeDrawer === 'bg' ? null : 'bg')}>🖼️<span>BG</span></div>
          <div className={`tool-btn ${activeDrawer === 'char' ? 'active' : ''}`} onClick={() => setActiveDrawer(activeDrawer === 'char' ? null : 'char')}>👤<span>Char</span></div>
        </aside>

        <div className={`ak-slide-panel ${activeDrawer ? 'open' : ''}`}>
           <div className="panel-head"><h3>Select {activeDrawer}</h3><button onClick={() => setActiveDrawer(null)}>×</button></div>
           <div className="asset-grid">
              {assets[activeDrawer]?.map(url => <img src={url} key={url} onClick={() => addItem(url, activeDrawer)} />)}
           </div>
        </div>

        <main className="ak-viewport">
          <div className="zoom-info">Zoom: {Math.round(scale * 100)}% | Drag Canvas Freely</div>
          <Stage 
            width={window.innerWidth} 
            height={window.innerHeight - 250}
            draggable={!selectedId} // Drag stage only when nothing is selected
            x={stagePos.x} y={stagePos.y}
            scaleX={scale} scaleY={scale}
            onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
            onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}
          >
            <Layer>
              <Rect width={ratio.w} height={ratio.h} fill="white" x={window.innerWidth / 4} y={50} shadowBlur={20} shadowOpacity={0.1} />
              {elements.map((el, i) => (
                <CanvasElement 
                  key={el.id} 
                  shapeProps={{...el, x: el.x + window.innerWidth / 4, y: el.y + 50}} 
                  isSelected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  onDelete={() => setElements(elements.filter(e => e.id !== el.id))}
                  onDuplicate={() => setElements([...elements, {...el, id: `el-${Date.now()}`, x: el.x + 20, y: el.y + 20}])}
                  onChange={(newAttrs) => {
                    const items = elements.slice();
                    items[i] = {...newAttrs, x: newAttrs.x - window.innerWidth / 4, y: newAttrs.y - 50};
                    setElements(items);
                  }}
                />
              ))}
            </Layer>
          </Stage>
        </main>
      </div>

      <footer className="ak-timeline">
        <div className="timeline-labels">{elements.map(el => <div key={el.id} className="label-item">{el.type}</div>)}</div>
        <div className="timeline-tracks">
          {elements.map(el => (
            <div key={el.id} className={`track-row ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
              <div className="track-pill" style={{ width: el.duration * 40, left: el.start * 40 }}>{el.type}</div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
