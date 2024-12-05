import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';
import { structureConfigurations } from '../../configs/structureConfigurations';
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
  
        // Add children based on configuration
        const config = structureConfigurations[configuration];
        if (config?.children) {
          config.children.forEach((child, index) => {
            const childId = addNewElement(
              child.type,
              2,
              null,
              newId,
              null,
              child.content,
              child.styles
            );
            setElements((prev) =>
              prev.map((el) =>
                el.id === newId
                  ? {
                      ...el,
                      children: [...(el.children || []), childId],
                    }
                  : el
              )
            );
          });
        }
  
        setElements((prev) =>
          prev.map((el) =>
            el.id === newId ? { ...el, configuration } : el
          )
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
        console.warn(`Unsupported CTA configuration: ${configuration}`);
        return;
    }
  };

  const CTAComponent = renderCTAComponent();

  // Render description if requested
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

  // Render the draggable CTA component
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #ccc',
        cursor: 'move',
      }}
    >
      {CTAComponent}
    </div>
  );
};

export default DraggableCTA;
