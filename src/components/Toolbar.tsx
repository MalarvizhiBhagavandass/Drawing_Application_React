import React from 'react';
import { useDrawing } from '../context/DrawingContext';

export const Toolbar: React.FC = () => {
  const { currentTool, setCurrentTool } = useDrawing();

  return (
    <div className="toolbar">
      <button onClick={() => setCurrentTool('rectangle')} className={currentTool === 'rectangle' ? 'active' : ''}>
        Rectangle
      </button>
      <button onClick={() => setCurrentTool('circle')} className={currentTool === 'circle' ? 'active' : ''}>
        Circle
      </button>
      <button onClick={() => setCurrentTool('line')} className={currentTool === 'line' ? 'active' : ''}>
        Line
      </button>
    </div>
  );
};
