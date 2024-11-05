
import React, { useContext, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from '../Texts/Paragraph';
import Heading from '../Texts/Heading';
import Section from '../Elements/Section';
import Button from '../Elements/Button';
import DropZone from '../utils/DropZone';

const Div = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { content, styles, children = [] } = divElement || {};
  const divRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setSelectedElement({ id, type: 'div' });
  };

  const handleDrop = (item, parentId) => {
    console.log(`Dropping item of type ${item.type} into Div with id ${parentId}`);
    addNewElement(item.type, item.level || 1, null, parentId);
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
      <React.Fragment key={id} id={id} style={{ padding: '5px', border: type === 'div' ? '1px solid black' : undefined }}>
        {componentMap[type]}
        {/* Render children with a consistent structure if the current element is a div or section */}
        {children && children.length > 0 && (type === 'div' || type === 'section') && (
          <div className="nested-elements" style={{ padding: '5px', marginLeft: '10px' }}>
            {children.map((childElement) => renderElement(childElement))}

            {/* DropZone to add new children for div or section, or at the same level for other types */}
            {(type === 'div' || type === 'section') ? (
              <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
            ) : (
              <DropZone onDrop={(item) => handleDrop(item, null)} parentId={null} />
            )}
          </div>
        )}
      </React.Fragment >
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
      <div>New Div
      {/* Render each child element */}
      {children.map((childElement) => renderElement(childElement))}
      <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
      </div>
    </div>
  );
};

export default Div;