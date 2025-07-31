# React Drawing Application

This is a React-based drawing app that allows users to draw rectangles, circles, and lines on a canvas. Users can:

- Select shapes to modify appearance (fill color, stroke color, stroke width, stroke style)
- Drag shapes to reposition them
- Draw shapes live by dragging on the canvas
- Save the entire drawing state locally in the browser (`localStorage`)
- Export drawing as a JSON file to save externally
- Load drawing from local storage when the app loads

## Features

- Drawing rectangles, circles, and straight lines with live preview
- Selecting and editing shape styles
- Drag and reposition shapes on canvas
- Persistent drawing saved in browser localStorage
- Export drawing JSON file for backup or sharing

## Technologies

- React 18 with functional components and hooks
- TypeScript for type safety
- React Konva for performant canvas drawing and interaction
- LocalStorage for saving drawings
- Basic CSS for styling

## How to Run Locally

1. Clone the repository

```bash
git clone https://github.com/MalarvizhiBhagavandass/Drawing_Application.git

cd Drawing_Application

Install dependencies
npm install
Run the development server

npm run dev
Open your browser at http://localhost:3000 (or as indicated in terminal)

How to Use
Select a shape tool (Rectangle, Circle, Line) from the toolbar

Click and drag on the canvas to draw the shape live

Click on existing shapes to select and edit their styles

Drag selected shapes to reposition them

Use the "Save" button to save your drawing to localStorage

Use the "Export JSON" button to download your drawing as a JSON file

Future Improvements
Add undo/redo functionality

Add keyboard shortcuts

Support more shapes (polygons, curves)

Add load from JSON file functionality


Created by MalarvizhiBhagavandass
