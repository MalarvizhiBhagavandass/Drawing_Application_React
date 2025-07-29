// src/context/DrawingContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Shape, ShapeType } from '../types/shapes';

interface DrawingContextType {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  selectedShapeId: string | null;
  setSelectedShapeId: (id: string | null) => void;
  currentTool: ShapeType;
  setCurrentTool: (tool: ShapeType) => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const DrawingProvider = ({ children }: { children: React.ReactNode }) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<ShapeType>('rectangle');

  return (
    <DrawingContext.Provider
      value={{
        shapes,
        setShapes,
        selectedShapeId,
        setSelectedShapeId,
        currentTool,
        setCurrentTool,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
};

export const useDrawing = (): DrawingContextType => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within a DrawingProvider');
  }
  return context;
};
