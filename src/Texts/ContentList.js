// src/Texts/ContentList.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from './Paragraph';
import Heading from './Heading';
import Section from '../Elements/Section';
import Div from '../Elements/Div';
import Button from '../Elements/Button';
import { useDrop } from 'react-dnd';

const DropZone = ({ index, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    drop: (item) => onDrop(item, index),  // Ensure index is passed correctly
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [index, onDrop]);  // Include index in dependencies

  return (
    <div
      ref={drop}
      style={{
        height: '20px',
        backgroundColor: isOver ? '#ddd' : 'transparent',
        margin: '4px 0',
      }}
    />
  );
};

const ContentList = () => {
  const { elements, addNewElement } = useContext(EditableContext);

  const handleDrop = (item, index) => {
    const level = item.level || 1;
    addNewElement(item.type, level, index);  // Pass index to addNewElement
  };

  const renderElement = (element) => {
    switch (element.type) {
      case 'heading':
        return <Heading id={element.id} level={element.level} />;
      case 'paragraph':
        return <Paragraph id={element.id} />;
      case 'section':
        return <Section id={element.id} />;
      case 'div':
        return <Div id={element.id} />;
      case 'button':
        return <Button id={element.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="content-list">
      {elements.length === 0 && <p>Start adding elements by dragging from the sidebar.</p>}

      {elements.map((element, index) => (
        <div key={element.id}>
          {/* DropZone above each element */}
          <DropZone index={index} onDrop={handleDrop} />
          {renderElement(element)}
        </div>
      ))}

      {/* Final DropZone at the end of the list */}
      <DropZone index={elements.length} onDrop={handleDrop} />
    </div>
  );
};

export default ContentList;
