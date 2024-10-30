// src/Texts/ContentList.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from './Paragraph';
import Heading from './Heading';

const ContentList = () => {
  const { elements, addNewElement } = useContext(EditableContext);

  if (!elements || Object.keys(elements).length === 0) {
    return <p>No content available. Please add some content.</p>;
  }

  const handleAddElement = (index, type, level) => {
    addNewElement(type, level, index);
  };

  return (
    <div className="content-list">
      {Object.keys(elements).map((id, index) => {
        const element = elements[id];
        return (
          <div key={id}>
            {/* Position marker for adding elements */}
            <button onClick={() => handleAddElement(index, 'paragraph')}>Add Paragraph Here</button>
            <button onClick={() => handleAddElement(index, 'heading', 1)}>Add Heading Here</button>

            {/* Render the element based on its type */}
            {element.type === 'heading' ? (
              <Heading id={id} level={element.level} />
            ) : (
              <Paragraph id={id} />
            )}
          </div>
        );
      })}
      
      {/* Position marker at the end of the list */}
      <button onClick={() => handleAddElement(Object.keys(elements).length, 'paragraph')}>Add Paragraph at End</button>
      <button onClick={() => handleAddElement(Object.keys(elements).length, 'heading', 1)}>Add Heading at End</button>
    </div>
  );
};

export default ContentList;
