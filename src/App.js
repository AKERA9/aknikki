import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import './App.css';

// Context Menu Component (Canva Style)
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
    if (isSelected) {
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
        <Text {...commonProps} text={el.content} fontSize={el.fontSize} fill={el.fill} fontStyle={el.fontStyle} />
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
  const [zoom, setZoom] = useState(0.8);
  const [ratio, setRatio] = useState({ w: 360, h: 450 });
  const [searchTerm, setSearchTerm] = useState("");

  const assets = {
    Background: [
      { id: 1, name: 'Night Sky', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400' },
      { id: 2, name: 'Soft Gradient', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400' }
    ],
    Character: [
      { id: 101, name: 'Lion Mascot', url: 'https://img.icons8.com/color/200/lion.png' },
      { id: 102, name: 'Office Man', url: 'https://img.icons8.com/fluency/200/business-man.png' }
    ]
  };

  const addItem = (type, data = {}) => {
    const id = `el-${Date.now()}`;
    const newEl = type === 'Text' 
      ? { id, type, content: 'Double click to edit', x: 50, y: 150, fontSize: 30, fill: '#000', start: 0, duration: 5 }
      : { id, type, url: data.url, x: 50, y: 50, start: 0, duration: 5, scaleX: 1, scaleY: 1, rotation: 0 };
    
    setElements([...elements, newEl]);
    setActivePanel(null);
    setSelectedId(id);
  };

  const filteredAssets = activePanel && assets[activePanel] 
    ? assets[activePanel].filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())) 
    : [];

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
          <div className={`side-item ${activePanel === 'Background' ? 'on' : ''}`} onClick={() => setActivePanel('Background')}>🖼️<span>BG</span></div>
          <div className={`side-item ${activePanel === 'Character' ? 'on' : ''}`} onClick={() => setActivePanel('Character')}>👤<span>Char</span></div>
          <div className="side-item" onClick={() => addItem('Text')}>T<span>Text</span></div>
        </aside>

        <div className={`ak-panel ${activePanel ? 'open' : ''}`}>
          <div className="panel-top">
            <input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={() => setActivePanel(null)}>×</button>
          </div>
          <div className="asset-grid">
            {filteredAssets.map(a => <img key={a.id} src={a.url} onClick={() => addItem(activePanel, a)} alt="a"/>)}
          </div>
        </div>

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

      <footer className="ak-timeline">
        <div className="tl-wrap">
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
