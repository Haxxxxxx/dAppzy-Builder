import React, { useContext, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import Span from '../Texts/Span';
import Button from '../Interact/Button';
import DropZone from '../../utils/DropZone'; // Import the DropZone component

const DraggableFooter = ({ configuration, isEditing, showDescription = false }) => {
  const { addNewElement, setElements, setSelectedElement, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'footer', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [configuration, isEditing, addNewElement, setElements]);

  // Unique ID generation logic
  const uniqueId = useMemo(() => `footer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);

  // Render quick description if showDescription is true
  if (showDescription) {
    return (
      <div
        id={uniqueId}
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          padding: '16px',
          margin: '8px 0',
          backgroundColor: '#e0e0e0',
          border: '2px solid #333',
          borderRadius: '8px',
        }}
      >
        {configuration === 'simple' ? 'Simple Footer Description' : 'Detailed Footer Description'}
      </div>
    );
  }

  // Render full content otherwise
  return (
    <div
      id={uniqueId}
      ref={drag}
      onClick={() => {
        setSelectedElement({ id: uniqueId, type: 'footer', configuration });
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'default',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#e0e0e0',
        border: selectedElement?.id === uniqueId ? '2px solid blue' : '2px solid #333',
        borderRadius: '8px',
      }}
    >
      {/* Full content rendering logic */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Span id={`${uniqueId}-address`} content="123 Main St, Anytown, USA" />
        </div>
        <div>
          <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
            <li><Span id={`${uniqueId}-privacy`} content="Privacy Policy" /></li>
            <li><Span id={`${uniqueId}-terms`} content="Terms of Service" /></li>
            <li><Span id={`${uniqueId}-contact`} content="Contact Us" /></li>
          </ul>
        </div>
        <div>
          <Button id={`${uniqueId}-cta`} content="Subscribe" />
        </div>
      </div>
    </div>
  );
};

export default DraggableFooter;
