import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const ObjectControl = ({ x, y, onDelete, onDuplicate }) => (
  <Group x={x} y={y - 50}>
    <Rect width={100} height={32} fill="white" cornerRadius={6} shadowBlur={10} shadowOpacity={0.15} />
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
          <Transformer ref={trRef} rotateEnabled={true} />
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
    BG: [{ name: 'Sky', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200' }, { name: 'Pink', url: 'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=200' }],
    Char: [{ name: 'Lion', url: 'https://img.icons8.com/color/200/lion.png' }, { name: 'Man', url: 'https://img.icons8.com/fluency/200/business-man.png' }]
  };

  const addItem = (type, data = {}) => {
    const newEl = { id: `el-${Date.now()}`, type, x: 50, y: 50, start: 0, duration: 5, ...data };
    setElements([...elements, newEl]);
    setActivePanel(null);
    setSelectedId(newEl.id);
  };

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
        <div className="header-right">
          <select className="ratio-select" onChange={(e) => setRatio(e.target.value === '16:9' ? {w:640,h:360} : {w:360,h:450})}>
            <option value="4:5">4:5 Insta</option>
            <option value="16:9">16:9 YT</option>
          </select>
          <button className="export-btn">Export</button>
        </div>
      </header>

      <div className="ak-main">
        <aside className="ak-sidebar">
          {['BG', 'Char', 'Text', 'Audio', 'Upload'].map(item => (
            <div key={item} className={`side-item ${activePanel === item ? 'on' : ''}`} 
                 onClick={() => { setActivePanel(activePanel === item ? null : item); setSearchTerm(""); }}>
              <div className="icon">{item === 'BG' ? '🖼️' : item === 'Char' ? '👤' : item === 'Text' ? 'T' : item === 'Audio' ? '🎵' : '📤'}</div>
              <span>{item}</span>
            </div>
          ))}
        </aside>

        <div className={`ak-panel ${activePanel ? 'open' : ''}`}>
          <div className="panel-top">
            <input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-bar" />
            <button className="arrow-close" onClick={() => setActivePanel(null)}>❮</button>
          </div>
          <div className="asset-grid">
            {activePanel === 'Text' && (
              <div className="text-full-row">
                <button onClick={() => addItem('Text', {content: 'Add Heading', fontSize: 35, fill: '#000'})} className="add-text-btn">Add Heading</button>
              </div>
            )}
            {assets[activePanel]?.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map(a => (
              <img key={a.url} src={a.url} onClick={() => addItem(activePanel, {url: a.url})} alt="asset" />
            ))}
          </div>
        </div>

        <main className="ak-workspace">
          <div className="stage-container" style={{ transform: `scale(${zoom})` }}>
            <Stage width={ratio.w} height={ratio.h} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}>
              <Layer>
                <Rect width={ratio.w} height={ratio.h} fill="#fff" shadowBlur={15} shadowOpacity={0.1} />
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
          <div className="zoom-bar-fixed">
            <input type="range" min="0.3" max="1.5" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
            <span>{Math.round(zoom * 100)}%</span>
          </div>
        </main>
      </div>

      <footer className="ak-timeline">
        <div className="tl-container">
          <div className="tl-labels">
            <div className="tl-title">Layers</div>
            {elements.map((el, i) => (
              <div key={el.id} className={`tl-row-label ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
                <div className="order-controls">
                  <button onClick={(e) => {e.stopPropagation(); moveLayer(i, 1)}}>▲</button>
                  <button onClick={(e) => {e.stopPropagation(); moveLayer(i, -1)}}>▼</button>
                </div>
                <span>{el.type}</span>
              </div>
            ))}
          </div>
          <div className="tl-tracks">
            <div className="tl-title">Timeline</div>
            {elements.map(el => (
              <div key={el.id} className={`track-row ${el.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(el.id)}>
                <div className="track-pill" style={{ width: el.duration * 30, left: el.start * 30 }}>{el.type}</div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
  }
  
