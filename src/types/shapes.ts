export type ShapeType = 'rectangle' | 'circle' | 'line';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed';
  isSelected: boolean;
}

export interface Rectangle extends BaseShape {
  width: number;
  height: number;
  fill: string;
}

export interface Circle extends BaseShape {
  radius: number;
  fill: string;
}

export interface Line extends BaseShape {
  x2: number;
  y2: number;
}

export type Shape = Rectangle | Circle | Line;
