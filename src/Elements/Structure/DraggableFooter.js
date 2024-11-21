// DraggableFooter.js
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';

const DraggableFooter = ({ configuration, isEditing, showDescription = false, contentListWidth }) => {
  const { addNewElement, setElements, setSelectedElement, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'footer', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const newId = addNewElement('footer', 1, null, null, configuration);
        setElements((prevElements) =>
          prevElements.map((el) => (el.id === newId ? { ...el, configuration } : el))
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);

  const uniqueId = useMemo(() => `footer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const descriptions = {
    simple: 'A simple footer with basic company info and a subscription button.',
    detailed: 'A detailed footer with company info, links, and social media.',
    template: 'A template footer with sections and social media icons.',
  };
  const renderFooterByConfiguration = (configuration, uniqueId) => {
    switch (configuration) {
      case 'simple':
        return <SimpleFooter uniqueId={uniqueId} contentListWidth={contentListWidth}
        />;
      case 'detailed':
        return <DetailedFooter uniqueId={uniqueId} contentListWidth={contentListWidth}
        />;
      case 'template':
        return <TemplateFooter uniqueId={uniqueId} contentListWidth={contentListWidth}
        />;
      default:
        return null;
    }
  };
  const footerContent = showDescription ? (
    <footer
      id={uniqueId}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px',
        margin: '8px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'move',
      }}
    >
      <strong>{configuration === 'simple' ? 'Simple Footer' : configuration === 'detailed' ? 'Detailed Footer' : 'Template Footer'}</strong>
      <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#666' }}>
        {descriptions[configuration]}
      </p>
    </footer>
  ) : (
    <>{renderFooterByConfiguration(configuration, uniqueId)}</>
  );



  return selectedElement?.id === uniqueId ? (
    <>
      {footerContent}
      <DropZone
        index={null}
        onDrop={(item) => addNewElement(item.type, 1)}
        text="Drop here to create a new section below"
      />
    </>
  ) : (
    footerContent
  );
};

export default DraggableFooter;
