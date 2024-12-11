import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';

const DraggableFooter = ({ id, configuration, isEditing, showDescription = false, contentListWidth, handleOpenMediaPanel}) => {
  const { addNewElement, elements, setElements, setSelectedElement, findElementById } = useContext(EditableContext);

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
        setSelectedElement({ id: newId, type: 'footer' });
      }
    },
  }), [configuration, isEditing, addNewElement, setElements, setSelectedElement]);

  const uniqueId = useMemo(() => `footer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const footerElement = findElementById(id, elements);
  const children = footerElement?.children.map((childId) => findElementById(childId, elements)) || [];

  const descriptions = {
    simple: 'A simple footer with basic company info and a subscription button.',
    detailed: 'A detailed footer with company info, links, and social media.',
    template: 'A template footer with sections and social media icons.',
  };

  const renderFooter = () => {
    switch (configuration) {
      case 'simple':
        return <SimpleFooter handleOpenMediaPanel={handleOpenMediaPanel} uniqueId={id} children={children} />;
      case 'detailed':
        return <DetailedFooter handleOpenMediaPanel={handleOpenMediaPanel} uniqueId={id} children={children} />;
      case 'template':
        return <TemplateFooter handleOpenMediaPanel={handleOpenMediaPanel} uniqueId={id} children={children} contentListWidth={contentListWidth} />;
      default:
        return null;
    }
  };

  if (showDescription) {
    return (
      <div className='bento-extract-display'>
        <strong>{configuration}</strong>

      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          padding: '8px',
          margin: '8px 0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'move',
          backgroundColor: "#FBFBFB",
          color: '#686868'
          }}
      >
        <p>{descriptions[configuration]}</p>
      </div>
            </div>

    );
  }

  return renderFooter();
};

export default DraggableFooter;
