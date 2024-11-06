// ContentList.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import Paragraph from '../Texts/Paragraph';
import Heading from '../Texts/Heading';
import Section from '../Elements/Section';
import Div from '../Elements/Div';
import Button from '../Elements/Button';
import HeadingLevelSelector from '../Debug/HeadingLevelSelector';
import DropZone from '../utils/DropZone';
import Image from '../Elements/Image';
import Form from '../Elements/Form';
import { List } from '../Elements/List';
import Span from '../Elements/Span';
import Input from '../Elements/Input';
import SectionStructureModal from '../utils/SectionStructureModal';

const ContentList = () => {
  const { elements, addNewElement, setSelectedElement } = useContext(EditableContext);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);

  const handleDrop = (item, index, parentId = null) => {
    if (item.type === 'heading') {
      setShowLevelSelector(true);
    } else if (item.type === 'section') {
      setShowStructureModal(true);
    } else {
      const newId = addNewElement(item.type, 1, index, parentId);
      setSelectedElement({ id: newId, type: item.type });
    }
  };

  const handleLevelSelect = (level) => {
    const newId = addNewElement('heading', level);
    setSelectedElement({ id: newId, type: 'heading', level });
    setShowLevelSelector(false);
  };


  const handleStructureSelect = (structure) => {
    console.log('Creating section with structure:', structure); // Debug log
    const newId = addNewElement('section', 1, elements.length, null, structure);
    setSelectedElement({ id: newId, type: 'section', structure });
    setShowStructureModal(false);
  };
  useEffect(() => {
    console.log('Elements state:', elements); // Debugging log
  }, [elements]);
  


  const renderElement = (element) => {
    const { id, type, children } = element;

    if (type === 'ul' || type === 'ol') {
      return <List key={id} id={id} type={type} />;
    }

    const componentMap = {
      heading: <Heading id={id} />,
      paragraph: <Paragraph id={id} />,
      section: <Section id={id} />,
      div: <Div id={id} />,
      button: <Button id={id} />,
      image: <Image id={id} />,
      span: <Span id={id} />,
      input: <Input id={id} />,
      form: <Form id={id} />,
    };

    if (!componentMap[type]) {
      console.warn(`Unsupported element type: ${type}`);
      return null;
    }

    return (
      <div key={id}>
        {componentMap[type]}
        {['div', 'section', 'ul', 'ol'].includes(type) && children && children.length > 0 && (
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
      {elements
        .filter((element) => !element.parentId)
        .map((element) => renderElement(element))}
      <DropZone
        index={elements.length}
        onDrop={(item) => handleDrop(item, elements.length)}
        onClick={() => setShowStructureModal(true)}
      />

      {showLevelSelector && (
        <HeadingLevelSelector onSelectLevel={(level) => handleLevelSelect(level)} />
      )}
      {showStructureModal && (
        <SectionStructureModal
          onClose={() => setShowStructureModal(false)}
          onSelectStructure={handleStructureSelect}
        />
      )}
    </div>
  );
};

export default ContentList;
