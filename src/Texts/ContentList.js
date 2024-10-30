// src/Texts/ContentList.js
import React, { useContext, useState } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from './Paragraph';
import Heading from './Heading';
import Section from '../Elements/Section';
import Div from '../Elements/Div';
import Button from '../Elements/Button';
import HeadingLevelSelector from '../Debug/HeadingLevelSelector';
import DropZone from '../utils/DropZone';

const ContentList = () => {
  const { elements, addNewElement, setSelectedElement } = useContext(EditableContext);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [currentDropIndex, setCurrentDropIndex] = useState(null);

  const handleDrop = (item, index) => {
    if (item.type === 'heading') {
      setShowLevelSelector(true);
      setCurrentDropIndex(index);
    } else {
      const newId = addNewElement(item.type, 1, index);
      setSelectedElement({ id: newId, type: item.type });
    }
  };

  const handleLevelSelect = (level) => {
    const newId = addNewElement('heading', level, currentDropIndex);
    setSelectedElement({ id: newId, type: 'heading', level });
    setShowLevelSelector(false);
    console.log("Level Selected for the heading:", level);
  };

  return (
    <div className="content-list">
      {elements.length === 0 && <p>Start adding elements by dragging from the sidebar.</p>}

      {elements.map((element, index) => {
        const renderElement = () => {
          switch (element.type) {
            case 'heading':
              return <Heading id={element.id} />;
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
          <div key={element.id}>
            <DropZone index={index} onDrop={handleDrop} />
            {renderElement()}
          </div>
        );
      })}

      <DropZone index={elements.length} onDrop={handleDrop} />

      {showLevelSelector && (
        <HeadingLevelSelector onSelectLevel={handleLevelSelect} />
      )}
    </div>
  );
};

export default ContentList;
