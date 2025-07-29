// src/components/Canvas.tsx
import React, { useRef, useEffect } from 'react';
import { useDrawing } from '../context/DrawingContext';
import { v4 as uuidv4 } from 'uuid';
import { Shape } from '../types/shapes';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { shapes, setShapes, currentTool } = useDrawing();

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const shape of shapes) {
      ctx.save();
      ctx.strokeStyle = shape.stroke;
      ctx.lineWidth = shape.strokeWidth;
      ctx.setLineDash(shape.strokeStyle === 'dashed' ? [5, 5] : []);

      if (shape.type === 'rectangle') {
        const rect = shape as any;
        ctx.fillStyle = rect.fill;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      } else if (shape.type === 'circle') {
        const circle = shape as any;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.fillStyle = circle.fill;
        ctx.fill();
        ctx.stroke();
      } else if (shape.type === 'line') {
        const line = shape as any;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx);
  }, [shapes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = uuidv4();
    let newShape: Shape;
    if (currentTool === 'rectangle') {
      newShape = {
        id,
        type: 'rectangle',
        x,
        y,
        width: 100,
        height: 50,
        fill: 'lightblue',
        stroke: 'black',
        strokeWidth: 2,
        strokeStyle: 'solid',
        isSelected: false,
      };
    } else if (currentTool === 'circle') {
      newShape = {
        id,
        type: 'circle',
        x,
        y,
        radius: 30,
        fill: 'lightgreen',
        stroke: 'black',
        strokeWidth: 2,
        strokeStyle: 'solid',
        isSelected: false,
      };
    } else if (currentTool === 'line') {
      newShape = {
        id,
        type: 'line',
        x,
        y,
        x2: x + 80,
        y2: y + 40,
        stroke: 'black',
        strokeWidth: 2,
        strokeStyle: 'solid',
        isSelected: false,
      };
    }

    setShapes(prev => [...prev, newShape]);
  };

  return <canvas ref={canvasRef} width={1000} height={600} style={{ border: '1px solid #ccc' }} onMouseDown={handleMouseDown} />;
};
