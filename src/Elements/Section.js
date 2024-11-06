// Section.js
import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from '../Texts/Paragraph';
import Heading from '../Texts/Heading';
import Div from '../Elements/Div';
import Button from '../Elements/Button';
import DropZone from '../utils/DropZone';
import Image from '../Elements/Image';

const Section = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement } = useContext(EditableContext);
  const sectionElement = elements.find((el) => el.id === id);
  console.log('Retrieved section element:', sectionElement); // Debug log
    const { content, styles, children = [], structure } = sectionElement || {};
  const sectionRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
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
      div: <Div id={id} />,
      button: <Button id={id} />,
      image: <Image id={id} />,
    };

    return (
      <React.Fragment key={id}>
        {componentMap[type]}
        {children && children.length > 0 && (type === 'div' || type === 'section') && (
          <div className="nested-elements" style={{ padding: '5px', marginLeft: '10px' }}>
            {children.map((childElement) => renderElement(childElement))}
            <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderStructure = () => {
    if (!structure) {
      console.warn('No structure defined for this section:', id); // Debug log
      return null; // Handle undefined structure gracefully
    }
    console.log('Rendering structure for section:', structure); // Debug log
    switch (structure) {
      case 'title-text':
        return (
          <>
            <Heading id={`${id}-title`} level={1} content="Your Title Here" />
            <Paragraph id={`${id}-text`} content="Your Text Here" />
          </>
        );
      case 'title-image':
        return (
          <>
            <Heading id={`${id}-title`} level={1}  />
            <Image id={`${id}-image`} />
          </>
        );
      case 'two-columns':
        return (
          <Div id={`${id}-columns`} styles={{ display: 'flex' }}>
            <Div id={`${id}-column-1`} styles={{ flex: 1, padding: '5px' }}>
              <DropZone onDrop={(item) => handleDrop(item, `${id}-column-1`)} parentId={`${id}-column-1`} />
            </Div>
            <Div id={`${id}-column-2`} styles={{ flex: 1, padding: '5px' }}>
              <DropZone onDrop={(item) => handleDrop(item, `${id}-column-2`)} parentId={`${id}-column-2`} />
            </Div>
          </Div>
        );
      default:
        return null;
    }
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
        {renderStructure()}
        {children.map((childElement) => renderElement(childElement))}
      </div>
      <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
    </section>
  );
};

export default Section;
