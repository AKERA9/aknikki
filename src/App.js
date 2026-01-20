import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const URLImage = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const [img] = useImage(shapeProps.url);
  const shapeRef = useRef();
  const trRef = useRef();

  React.useEffect(() => {
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
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5 ? oldBox : newBox)}
        />
      )}
    </React.Fragment>
  );
};

function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [scale, setScale] = useState(1);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  const assets = {
    bg: ['https://images.unsplash.com/photo-1557683316-973673baf926?w=200', 'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=200'],
    char: ['https://img.icons8.com/color/200/lion.png', 'https://img.icons8.com/fluency/200/business-man.png']
  };

  const addItem = (url, type) => {
    const id = `el-${Date.now()}`;
    setElements([...elements, { id, url, type, x: 50, y: 50, start: 0, duration: 5, rotation: 0 }]);
    setActiveDrawer(null);
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
  };

  return (
    <div className="ak-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki</div>
        <select onChange={(e) => setRatio(e.target.value === '16:9' ? {w:480,h:270} : {w:360,h:450})}>
          <option value="4:5">4:5 Insta</option>
          <option value="16:9">16:9 YT</option>
        </select>
        <button className="ak-btn-blue">Export</button>
      </header>

      <div className="ak-body">
        <aside className="ak-sidebar-pro">
          <div className="tool-btn" onClick={() => setActiveDrawer(activeDrawer === 'bg' ? null : 'bg')}>🖼️ BG</div>
          <div className="tool-btn" onClick={() => setActiveDrawer(activeDrawer === 'char' ? null : 'char')}>👤 Char</div>
          <div className="tool-btn" onClick={() => deleteElement(selectedId)}>🗑️ Del</div>
        </aside>

        {/* Sliding Panel */}
        <div className={`ak-slide-panel ${activeDrawer ? 'open' : ''}`}>
          <div className="grid">
            {assets[activeDrawer]?.map(url => <img src={url} key={url} onClick={() => addItem(url, activeDrawer)} alt="asset"/>)}
          </div>
        </div>

        <main className="ak-viewport">
          <div className="zoom-controls">
            <button onClick={() => setScale(scale + 0.1)}>+</button>
            <button onClick={() => setScale(scale - 0.1)}>-</button>
          </div>
          <div className="canvas-holder" style={{ transform: `scale(${scale})` }}>
            <Stage width={ratio.w} height={ratio.h} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#fff" stroke="#ccc"/>
                {elements.map((el, i) => (
                  <URLImage key={el.id} shapeProps={el} isSelected={el.id === selectedId} 
                    onSelect={() => setSelectedId(el.id)}
                    onChange={(newAttrs) => {
                      const rects = elements.slice();
                      rects[i] = newAttrs;
                      setElements(rects);
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </main>
      </div>

      <footer className="ak-timeline-v2">
        {elements.map(el => (
          <div key={el.id} className="timeline-layer">
            <div className="layer-label">{el.type}</div>
            <div className="layer-bar-bg">
               <div className="layer-bar" style={{ left: el.start * 20, width: el.duration * 40 }}>
                 {el.id === selectedId ? '● Active' : ''}
               </div>
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
export default App;
