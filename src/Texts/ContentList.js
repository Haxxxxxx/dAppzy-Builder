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

  const handleDrop = (item, index, parentId = null) => {
    if (item.type === 'heading') {
      setShowLevelSelector(true);
    } else {
      const newId = addNewElement(item.type, 1, index, parentId); // Make sure parentId is being used correctly here
      setSelectedElement({ id: newId, type: item.type });
    }
  };
  

  const handleLevelSelect = (level) => {
    const newId = addNewElement('heading', level);
    setSelectedElement({ id: newId, type: 'heading', level });
    setShowLevelSelector(false);
  };

  const renderElement = (element) => {
    const { id, type, children } = element;
    const componentMap = {
      heading: <Heading id={id} />,
      paragraph: <Paragraph id={id} />,
      section: <Section id={id} />,
      div: <Div id={id} />,
      button: <Button id={id} />,
    };
  
    console.log("Rendering element:", { id, type, children });
  
    return (
      <div key={id}>
        {componentMap[type] || <p>Unsupported element type</p>}
        {children && children.length > 0 && (
          <div className="nested-elements">
            {children.map((childId) => {
              const childElement = elements.find((el) => el.id === childId);
              return childElement ? renderElement(childElement) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  
  
  
  

  return (
    <div className="content-list">
      {elements.length === 0 && <p>Start adding elements by dragging from the sidebar.</p>}
      {elements.map((element, index) => (
        <div key={element.id}> {/* Ensure each root element has a unique key */}
          {renderElement(element)}
        </div>
      ))}
      <DropZone index={elements.length} onDrop={(item) => handleDrop(item, elements.length)} />

      {showLevelSelector && (
        <HeadingLevelSelector onSelectLevel={(level) => handleLevelSelect(level)} />
      )}
    </div>
  );
};

export default ContentList;
