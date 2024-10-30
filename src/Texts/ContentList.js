// src/Texts/ContentList.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from './Paragraph';
import Heading from './Heading';
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

  if (!elements || Object.keys(elements).length === 0) {
    return <p>No content available. Please add some content.</p>;
  }

  const handleDrop = (item, index) => {
    addNewElement(item.type, item.level || 1, index);
  };

  return (
    <div className="content-list">
      {Object.keys(elements).map((id, index) => {
        const element = elements[id];
        return (
          <div key={id}>
            {/* DropZone between each element */}
            <DropZone index={index} onDrop={handleDrop} />
            {element.type === 'heading' ? (
              <Heading id={id} level={element.level} />
            ) : (
              <Paragraph id={id} />
            )}
          </div>
        );
      })}
      
      {/* DropZone at the end of the list */}
      <DropZone index={Object.keys(elements).length} onDrop={handleDrop} />
    </div>
  );
};

export default ContentList;
