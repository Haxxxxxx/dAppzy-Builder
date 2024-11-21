// DraggableCTA.js
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';

const DraggableCTA = ({ configuration, isEditing, showDescription = false }) => {
  const { addNewElement, setElements, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'cta', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const newId = addNewElement('cta', 1, null, null, configuration);
        setElements((prevElements) =>
          prevElements.map((el) => (el.id === newId ? { ...el, configuration } : el))
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);

  const uniqueId = useMemo(() => `cta-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const descriptions = {
    ctaOne: 'A simple CTA section with a title, description, and a button.',
    ctaTwo: 'A detailed CTA section with a title, and two action buttons.',
  };

  // Determine which CTA component to render based on the configuration
  const renderCTAComponent = () => {
    switch (configuration) {
      case 'ctaOne':
        return <CTAOne uniqueId={uniqueId} />;
      case 'ctaTwo':
        return <CTATwo uniqueId={uniqueId} />;
      default:
        return null;
    }
  };

  const CTAComponent = renderCTAComponent();

  return showDescription ? (
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
      <strong>{configuration === 'ctaOne' ? 'CTA Section One' : 'CTA Section Two'}</strong>
      <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#666' }}>
        {descriptions[configuration]}
      </p>
    </div>
  ) : selectedElement?.id === uniqueId ? (
    <>
      {CTAComponent}
      <DropZone
        index={null}
        onDrop={(item) => addNewElement(item.type, 1)}
        text="Drop here to create a new section below"
      />
    </>
  ) : (
    CTAComponent
  );
};

export default DraggableCTA;
