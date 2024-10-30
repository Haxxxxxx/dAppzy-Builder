// src/components/NewElementPanel.js
import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableElement = ({ type, level, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type, level },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '8px',
        margin: '4px 0',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {label}
    </div>
  );
};

const NewElementPanel = () => {
  return (
    <div>
      <h3>Create New Element</h3>
      <DraggableElement type="paragraph" label="Paragraph" />
      <DraggableElement type="heading" level={1} label="Heading 1" />
      <DraggableElement type="heading" level={2} label="Heading 2" />
      {/* Add more draggable elements as needed */}
    </div>
  );
};

export default NewElementPanel;
