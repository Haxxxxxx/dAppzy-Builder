import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from '../Texts/Paragraph';
import Heading from '../Texts/Heading';
import Div from '../Elements/Div';
import Button from '../Elements/Button';
import DropZone from '../utils/DropZone';

const Section = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement } = useContext(EditableContext);
  const sectionElement = elements.find((el) => el.id === id);
  const { content, styles, children = [] } = sectionElement || {};
  const sectionRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setSelectedElement({ id, type: 'section' });
  };

  const handleDrop = (item, parentId) => {
    addNewElement(item.type, item.level || 1, null, parentId);
  };

  useEffect(() => {
    if (selectedElement?.id === id && sectionRef.current) {
      sectionRef.current.focus();
    }
  }, [selectedElement, id]);

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
    <section
      ref={sectionRef}
      id={id}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      suppressContentEditableWarning={true}
      style={{
        ...styles,
        padding: '10px',
        border: '1px solid rgb(204, 204, 204)',
        borderRadius: '4px',
        margin: '10px 0',
      }}
    >
      {content || 'New Section'}
      <div className="nested-elements" style={{ padding: '5px', marginLeft: '10px' }}>
        {children.map((childElement) => renderElement(childElement))}
      </div>
      <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
    </section>
  );
};

export default Section;
