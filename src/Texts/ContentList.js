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
    drop: (item) => onDrop(item, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

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
    const level = item.level || 1; // Default to level 1 if undefined
    addNewElement(item.type, level, index);
  };

  return (
    <div className="content-list">
      {elements.length === 0 && (
        <p>Start adding elements by dragging from the sidebar.</p>
      )}

      {elements.map((element, index) => {
        const renderElement = () => {
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
          <div key={element.id} id={element.id}>
            {renderElement()}
            <DropZone index={index} onDrop={handleDrop} />

          </div>
        );
      })}

      <DropZone index={elements.length} onDrop={handleDrop} />
    </div>
  );
};

export default ContentList;
