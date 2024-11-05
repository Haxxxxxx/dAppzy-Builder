import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from '../Texts/Paragraph';
import Heading from '../Texts/Heading';
import Section from '../Elements/Section';
import Button from '../Elements/Button';
import DropZone from '../utils/DropZone';

const Div = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, addNewElement } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { content, styles, children = [] } = divElement || {};
  const divRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setSelectedElement({ id, type: 'div' });
  };

  // const handleBlur = (e) => {
  //   if (selectedElement?.id === id) {
  //     updateContent(id, e.target.innerText);
  //   }
  // };

  const handleDrop = (item) => {
    console.log(`Dropping item of type ${item.type} into Div with id ${id}`);
    addNewElement(item.type, item.level || 1, null, id);
  };

  const renderElement = (element) => {
    const { id, type, children } = element;
    const componentMap = {
      heading: <Heading id={id} />,
      paragraph: <Paragraph id={id} />,
      section: <Section id={id} />,
      div: <Div id={id} />, // Recursive Div rendering
      button: <Button id={id} />,
    };

    return (
      <div key={id}>
        {componentMap[type]}
        {children && children.length > 0 && (
          <div className="nested-elements">
            {children.map((childElement) => (
              <div key={childElement.id}>
                {renderElement(childElement)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id={id}
      ref={divRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      // onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{ ...styles, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}
    >
      {content || 'New Div'}
      <div className="nested-elements">
        {children.map((childElement) => (
          <div key={childElement.id}>
            {renderElement(childElement)}
          </div>
        ))}
      </div>
      <DropZone onDrop={handleDrop} />
    </div>
  );
};

export default Div;
