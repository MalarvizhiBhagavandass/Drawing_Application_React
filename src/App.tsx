import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Transformer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';

type ShapeType = 'rectangle' | 'circle' | 'line';

interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed';
}
interface RectangleShape extends BaseShape {
  type: 'rectangle';
  width: number;
  height: number;
  fill: string;
}
interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
  fill: string;
}
interface LineShape extends BaseShape {
  type: 'line';
  x2: number;
  y2: number;
}
type Shape = RectangleShape | CircleShape | LineShape;

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>(() => {
    const saved = localStorage.getItem('drawing');
    return saved ? JSON.parse(saved) : [];
  });

  const [tool, setTool] = useState<ShapeType>('rectangle');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#88ccff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed'>('solid');

  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState<Shape | null>(null);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (selectedId && trRef.current) {
      const selectedShape = shapes.find((s) => s.id === selectedId);
      if (selectedShape?.type === 'line') {
        trRef.current.nodes([]);
        return;
      }
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
      }
    } else {
      trRef.current?.nodes([]);
    }
  }, [selectedId, shapes]);

  const updateShape = (id: string, attrs: Partial<Shape>) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...attrs } : s)));
  };

  const handleMouseDown = (e: any) => {
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const id = uuidv4();

    let shape: Shape;
    if (tool === 'rectangle') {
      shape = {
        id,
        type: 'rectangle',
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
        strokeStyle,
      };
    } else if (tool === 'circle') {
      shape = {
        id,
        type: 'circle',
        x: point.x,
        y: point.y,
        radius: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
        strokeStyle,
      };
    } else {
      shape = {
        id,
        type: 'line',
        x: point.x,
        y: point.y,
        x2: point.x,
        y2: point.y,
        stroke: strokeColor,
        strokeWidth,
        strokeStyle,
      };
    }

    setNewShape(shape);
    setIsDrawing(true);
    setSelectedId(null);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !newShape) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const updated = { ...newShape };

    if (newShape.type === 'rectangle') {
      updated.width = point.x - newShape.x;
      updated.height = point.y - newShape.y;
    } else if (newShape.type === 'circle') {
      const dx = point.x - newShape.x;
      const dy = point.y - newShape.y;
      updated.radius = Math.sqrt(dx * dx + dy * dy);
    } else {
      updated.x2 = point.x;
      updated.y2 = point.y;
    }

    setNewShape(updated);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newShape) return;

    if (
      (newShape.type === 'rectangle' && (Math.abs(newShape.width) < 5 || Math.abs(newShape.height) < 5)) ||
      (newShape.type === 'circle' && newShape.radius < 5) ||
      (newShape.type === 'line' && Math.hypot(newShape.x2 - newShape.x, newShape.y2 - newShape.y) < 5)
    ) {
      setNewShape(null);
      setIsDrawing(false);
      return;
    }

    if (newShape.type === 'rectangle') {
      let { x, y, width, height } = newShape;
      if (width < 0) {
        x += width;
        width = Math.abs(width);
      }
      if (height < 0) {
        y += height;
        height = Math.abs(height);
      }
      setShapes((prev) => [...prev, { ...newShape, x, y, width, height }]);
    } else {
      setShapes((prev) => [...prev, newShape]);
    }

    setNewShape(null);
    setIsDrawing(false);
  };

  const saveDrawing = () => {
    localStorage.setItem('drawing', JSON.stringify(shapes));
    alert('Drawing saved to localStorage.');
  };

  const downloadDrawing = () => {
    const dataStr = JSON.stringify(shapes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyStyleToSelected = () => {
    if (!selectedId) return;
    const updates: Partial<Shape> = {
      stroke: strokeColor,
      strokeWidth,
      strokeStyle,
    };
    const selectedShape = shapes.find((s) => s.id === selectedId);
    if (selectedShape && selectedShape.type !== 'line') {
      (updates as any).fill = fillColor;
    }
    updateShape(selectedId, updates);
  };

  return (
    <div style={{ padding: 10 }}>
      <div style={{ marginBottom: 8, display: 'flex', gap: 10 }}>
        <label>
          Tool:
          <select value={tool} onChange={(e) => setTool(e.target.value as ShapeType)} style={{ marginLeft: 5 }}>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="line">Line</option>
          </select>
        </label>
        <button onClick={saveDrawing}>Save to Browser</button>
        <button onClick={downloadDrawing}>Download Drawing</button>
        {selectedId && (
          <>
            <label>
              Stroke:
              <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
            </label>
            {tool !== 'line' && (
              <label>
                Fill:
                <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} />
              </label>
            )}
            <label>
              Width:
              <input
                type="number"
                min={1}
                max={10}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                style={{ width: 50 }}
              />
            </label>
            <label>
              Style:
              <select value={strokeStyle} onChange={(e) => setStrokeStyle(e.target.value as any)}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
              </select>
            </label>
            <button onClick={applyStyleToSelected}>Apply</button>
          </>
        )}
      </div>

      <Stage
        width={800}
        height={600}
        style={{ border: '1px solid #ccc', background: '#f8f8f8' }}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {shapes.map((shape) => {
            const commonProps = {
              key: shape.id,
              id: shape.id,
              stroke: shape.stroke,
              strokeWidth: shape.strokeWidth,
              dash: shape.strokeStyle === 'dashed' ? [10, 5] : [],
              draggable: true,
              onClick: () => {
                setSelectedId(shape.id);
                setStrokeColor(shape.stroke);
                setStrokeWidth(shape.strokeWidth);
                setStrokeStyle(shape.strokeStyle);
                if (shape.type !== 'line') {
                  setFillColor((shape as any).fill);
                }
              },
              onDragEnd: (e: any) => {
                const pos = e.target.position();
                if (shape.type === 'line') {
                  const dx = pos.x;
                  const dy = pos.y;
                  updateShape(shape.id, {
                    x: shape.x + dx,
                    y: shape.y + dy,
                    x2: shape.x2 + dx,
                    y2: shape.y2 + dy,
                  });
                  e.target.position({ x: 0, y: 0 });
                } else {
                  updateShape(shape.id, { x: pos.x, y: pos.y });
                }
              },
            };

            if (shape.type === 'rectangle') {
              return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={(shape as RectangleShape).fill} />;
            }
            if (shape.type === 'circle') {
              return <Circle {...commonProps} x={shape.x} y={shape.y} radius={(shape as CircleShape).radius} fill={(shape as CircleShape).fill} />;
            }
            return <Line {...commonProps} x={shape.x} y={shape.y} points={[0, 0, shape.x2 - shape.x, shape.y2 - shape.y]} />;
          })}

          {/* Live drawing preview */}
          {newShape &&
            (() => {
              if (newShape.type === 'rectangle') {
                let { x, y, width, height } = newShape;
                if (width < 0) {
                  x += width;
                  width = Math.abs(width);
                }
                if (height < 0) {
                  y += height;
                  height = Math.abs(height);
                }
                return <Rect x={x} y={y} width={width} height={height} fill={newShape.fill} stroke={newShape.stroke} strokeWidth={newShape.strokeWidth} dash={newShape.strokeStyle === 'dashed' ? [10, 5] : []} />;
              }
              if (newShape.type === 'circle') {
                return <Circle x={newShape.x} y={newShape.y} radius={newShape.radius} fill={newShape.fill} stroke={newShape.stroke} strokeWidth={newShape.strokeWidth} dash={newShape.strokeStyle === 'dashed' ? [10, 5] : []} />;
              }
              return <Line x={newShape.x} y={newShape.y} points={[0, 0, newShape.x2 - newShape.x, newShape.y2 - newShape.y]} stroke={newShape.stroke} strokeWidth={newShape.strokeWidth} dash={newShape.strokeStyle === 'dashed' ? [10, 5] : []} />;
            })()}

          <Transformer ref={trRef} rotateEnabled={false} enabledAnchors={selectedId && shapes.find((s) => s.id === selectedId)?.type !== 'line' ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : []} />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
