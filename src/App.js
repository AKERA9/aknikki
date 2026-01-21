import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const ObjectControl = ({ x, y, onDelete, onDuplicate }) => (
  <Group x={x} y={y - 50}>
    <Rect width={100} height={32} fill="white" cornerRadius={6} shadowBlur={10} shadowOpacity={0.1} />
    <Text text="🗑️" x={12} y={10} onClick={onDelete} cursor="pointer" />
    <Text text="📑" x={45} y={10} onClick={onDuplicate} cursor="pointer" />
    <Text text="•••" x={75} y={10} cursor="pointer" />
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
          <Transformer ref={trRef} />
          <ObjectControl x={el.x} y={el.y} onDelete={onDelete} onDuplicate={onDuplicate} />
        </>
      )}
    </React.Fragment>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(0.8);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });

  const assets = {
    BG: [{ name: 'Sky', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200' }],
    Char: [{ name: 'Lion', url: 'https://img.icons8.com/color/200/lion.png' }]
  };

  const addItem = (type, data = {}) => {
    const newEl = { id: `el-${Date.now()}`, type, x: 50, y: 50, start: 0, duration: 5, ...data };
    setElements([...elements, newEl]);
    setActivePanel(null);
  };

  // Layer Order Change (Drag & Drop Logic)
  const moveLayer = (index, direction) => {
    const newElements = [...elements];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newElements.length) {
      [newElements[index], newElements[targetIndex]] = [newElements[targetIndex], newElements[index]];
      setElements(newElements);
    }
  };

  return (
    <div className="ak-pro-root">
      <header className="ak-header">
        <div className="ak-logo">Aknikki <span>Pro</span></div>
        <select onChange={(e) => setRatio(e.target.value === '16:9' ? {w:640,h:360} : {w:360,h:450})}>
          <option value="4:5">4:5 Insta</option>
          <option value="16:9">16:9 YT</option>
        </select>
        <button className="export-btn">Export</button>
      </header>

      <div className="ak-main">
        <aside className="ak-sidebar">
          {['BG', 'Char', 'Text', 'Audio', 'Upload'].map(item => (
            <div key={item} className={`side-item ${activePanel === item ? 'on' : ''}`} 
                 onClick={() => setActivePanel(activePanel === item ? null : item)}>
              {item === 'BG' ? '🖼️' : item === 'Char' ? '👤' : item === 'Text' ? 'T' : item === 'Audio' ? '🎵' : '📤'}
              <span>{item}</span>
            </div>
          ))}
        </aside>

        {/* Sliding Panel with Search & Arrow Close */}
        <div className={`ak-panel ${activePanel ? 'open' : ''}`}>
          <div className="panel-top">
            <input placeholder="Search assets..." onChange={(e) => setSearchTerm(e.target.value)} className="search-bar" />
            <button className="arrow-close" onClick={() => setActivePanel(null)}>❮</button>
          </div>
          <div className="asset-grid">
            {activePanel === 'Text' && <button onClick={() => addItem('Text', {content: 'New Text', fontSize: 30})}>Add Text</button>}
            {assets[activePanel]?.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map(a => (
              <img key={a.url} src={a.url} onClick={() => addItem(activePanel, {url: a.url})} alt="asset" />
            ))}
          </div>
        </div>

        <main className="ak-workspace">
          <div className="stage-center" style={{ transform: `scale(${zoom})` }}>
            <Stage width={ratio.w} height={ratio.h} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#fff" shadowBlur={15} />
                {elements.map((el, i) => (
                  <RenderElement key={el.id} el={el} isSelected={el.id === selectedId}
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
            <input type="range" min="0.3" max="1.5" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
          </div>
        </main>
      </div>

      <footer className="ak-timeline">
        {elements.map((el, i) => (
          <div key={el.id} className={`tl-row ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
            <div className="tl-order">
              <button onClick={() => moveLayer(i, 1)}>▲</button>
              <button onClick={() => moveLayer(i, -1)}>▼</button>
            </div>
            <div className="tl-label">{el.type}</div>
            <div className="tl-bar-bg"><div className="tl-bar" style={{ width: el.duration * 30, left: el.start * 30 }}>{el.type}</div></div>
          </div>
        ))}
      </footer>
    </div>
  );
  }
  
