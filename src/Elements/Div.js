import React, { useContext, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from '../Texts/Paragraph';
import Heading from '../Texts/Heading';
import Section from '../Elements/Section';
import Button from '../Elements/Button';
import DropZone from '../utils/DropZone';
import { List } from '../Elements/List';

const Div = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = divElement || {};
  const divRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setSelectedElement({ id, type: 'div' });
  };

  const handleDrop = (item, parentId) => {
    if (!item || !parentId) return;

    console.log(`Dropping item of type ${item.type} into Div with id ${parentId}`);

    // Check if the parent element already has a child of the same type
    const existingChild = elements.find((el) => el.parentId === parentId && el.type === item.type);
    if (existingChild) {
        // If the parent element already has a child of the same type, return the existing child's ID
        return existingChild.id;
    } else {
        // If the parent element doesn't have a child of the same type, add a new element
        addNewElement(item.type, item.level || 1, null, parentId);
    }
};


const renderElement = (element) => {
  const { id, type, children } = element;
  const componentMap = {
      heading: <Heading id={id} />,
      paragraph: <Paragraph id={id} />,
      section: <Section id={id} />,
      div: <Div id={id} />, // Recursive Div rendering
      button: <Button id={id} />,
      ul: <List id={id} type="ul" />,
      ol: <List id={id} type="ol" />,
  };

  return (
      <React.Fragment key={id}>
          {componentMap[type]}
          {/* Only render nested children for div and section, but not for paragraph */}
          {['div', 'section'].includes(type) && children && children.length > 0 && (
              <div className="nested-elements" style={{ padding: '5px', marginLeft: '10px' }}>
                  {children.map((childId) => {
                      const childElement = elements.find((el) => el.id === childId);
                      return childElement && childElement.type !== 'paragraph' ? renderElement(childElement) : null;
                  })}
              </div>
          )}
      </React.Fragment>
  );
};




  return (
    <div
      id={id}
      ref={divRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      suppressContentEditableWarning={true}
      style={{ ...styles, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}
    >
      <div>
        New Div
        <div className="nested-elements">
          {/* Render each child element */}
          {children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? renderElement(childElement) : null;
          })}
          <DropZone onDrop={(item) => handleDrop(item, id)} />
        </div>
      </div>
    </div>
  );
};

export default Div;
