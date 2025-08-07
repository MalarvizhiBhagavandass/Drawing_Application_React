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

  const [tool, setTool] = useState<ShapeType>('rectangle'); // Default tool is rectangle
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#88ccff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed'>('solid');
  const [canvasWidth, setCanvasWidth] = useState(800);

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

  const clearDrawing = () => {
    setShapes([]);
    localStorage.removeItem('drawing');
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
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Left Panel */}
      <div
        style={{
          width: 300,
          padding: '20px',
          backgroundColor: '#fafafa',
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
          borderRight: '1px solid #ddd',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>Shape Properties</h2>

        {/* Shape Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px' }}>Select Shape</h3>
          <div>
            <button
              onClick={() => setTool('rectangle')}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                border: 'none',
                backgroundColor: tool === 'rectangle' ? '#4CAF50' : '#f1f1f1',
                color: tool === 'rectangle' ? '#fff' : '#333',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              Rectangle
            </button>
            <button
              onClick={() => setTool('circle')}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                border: 'none',
                backgroundColor: tool === 'circle' ? '#4CAF50' : '#f1f1f1',
                color: tool === 'circle' ? '#fff' : '#333',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              Circle
            </button>
            <button
              onClick={() => setTool('line')}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                border: 'none',
                backgroundColor: tool === 'line' ? '#4CAF50' : '#f1f1f1',
                color: tool === 'line' ? '#fff' : '#333',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              Line
            </button>
          </div>
        </div>

        {/* Stroke Color */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', display: 'block' }}>Stroke Color:</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            style={{
              width: '100%',
              height: '35px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
            }}
          />
        </div>

        {/* Fill Color (only for rectangles and circles) */}
        {tool !== 'line' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', display: 'block' }}>Fill Color:</label>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              style={{
                width: '100%',
                height: '35px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            />
          </div>
        )}

        {/* Stroke Width */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', display: 'block' }}>Stroke Width:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            style={{
              width: '100%',
              height: '35px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              padding: '0 10px',
            }}
          />
        </div>

        {/* Stroke Style */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', display: 'block' }}>Stroke Style:</label>
          <select
            value={strokeStyle}
            onChange={(e) => setStrokeStyle(e.target.value as 'solid' | 'dashed')}
            style={{
              width: '100%',
              height: '35px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              padding: '0 10px',
            }}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
          </select>
        </div>

        <button
          onClick={applyStyleToSelected}
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            backgroundColor: '#4CAF50',
            color: '#fff',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Apply to Shape
        </button>

        {/* Canvas Width */}
        <label style={{ fontSize: '14px', display: 'block' }}>Canvas Width:</label>
        <input
          type="range"
          min={500}
          max={2000}
          value={canvasWidth}
          onChange={(e) => setCanvasWidth(Number(e.target.value))}
          style={{ width: '100%', marginBottom: '10px' }}
        />

        {/* Save, Download, and Clear Buttons */}
        <button
          onClick={saveDrawing}
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            backgroundColor: '#2196F3',
            color: '#fff',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Save Drawing
        </button>

        <button
          onClick={downloadDrawing}
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            backgroundColor: '#FF5722',
            color: '#fff',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Download Drawing
        </button>

        <button
          onClick={clearDrawing}
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            backgroundColor: '#f44336',
            color: '#fff',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Clear All
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#f4f4f4' }}>
        <Stage
          width={canvasWidth}
          height={600}
          style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '8px' }}
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
                return (
                  <Rect
                    {...commonProps}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={(shape as RectangleShape).fill}
                  />
                );
              }
              if (shape.type === 'circle') {
                return (
                  <Circle
                    {...commonProps}
                    x={shape.x}
                    y={shape.y}
                    radius={(shape as CircleShape).radius}
                    fill={(shape as CircleShape).fill}
                  />
                );
              }
              return (
                <Line
                  {...commonProps}
                  x={shape.x}
                  y={shape.y}
                  points={[0, 0, shape.x2 - shape.x, shape.y2 - shape.y]}
                />
              );
            })}

            {/* Live drawing preview */}
            {newShape && (() => {
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
                return (
                  <Rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={newShape.fill}
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                    dash={newShape.strokeStyle === 'dashed' ? [10, 5] : []}
                  />
                );
              }
              if (newShape.type === 'circle') {
                return (
                  <Circle
                    x={newShape.x}
                    y={newShape.y}
                    radius={newShape.radius}
                    fill={newShape.fill}
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                    dash={newShape.strokeStyle === 'dashed' ? [10, 5] : []}
                  />
                );
              }
              return (
                <Line
                  x={newShape.x}
                  y={newShape.y}
                  points={[0, 0, newShape.x2 - newShape.x, newShape.y2 - newShape.y]}
                  stroke={newShape.stroke}
                  strokeWidth={newShape.strokeWidth}
                  dash={newShape.strokeStyle === 'dashed' ? [10, 5] : []}
                />
              );
            })()}

            <Transformer
              ref={trRef}
              rotateEnabled={false}
              flipEnabled={false}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default App;
