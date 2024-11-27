import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';

const DraggableCTA = ({ id, configuration, isEditing, showDescription = false }) => {
  const { addNewElement, elements, setElements, findElementById } = useContext(EditableContext);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'cta', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const newId = addNewElement('cta', 1, null, null, configuration);
        setElements((prev) =>
          prev.map((el) => (el.id === newId ? { ...el, configuration } : el))
        );
      }
    },
  }));

  const uniqueId = useMemo(() => `cta-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const ctaElement = findElementById(id, elements);
  const children = ctaElement?.children?.map((childId) => findElementById(childId, elements)) || [];

  const descriptions = {
    ctaOne: 'A simple CTA with a title, description, and a button.',
    ctaTwo: 'A CTA with a title and two action buttons.',
  };

  const titles = {
    ctaOne: 'CTA One',
    ctaTwo: 'CTA Two',
  };

  const renderCTAComponent = () => {
    switch (configuration) {
      case 'ctaOne':
        return <CTAOne uniqueId={id} children={children} />;
      case 'ctaTwo':
        return <CTATwo uniqueId={id} children={children} />;
      default:
        return null;
    }
  };

  const CTAComponent = renderCTAComponent();

  if (showDescription) {
    return (
      <div
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
        <strong>{titles[configuration]}</strong>
        <p>{descriptions[configuration]}</p>
      </div>
    );
  }

  return <>{CTAComponent}</>;
};

export default DraggableCTA;
