// HeroPanel.js
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import HeroOne from '../Sections/Heros/HeroOne';
import HeroTwo from '../Sections/Heros/HeroTwo';
import HeroThree from '../Sections/Heros/HeroThree';

const DraggableHero = ({ configuration, isEditing, showDescription = false, contentListWidth }) => {
  const { addNewElement, setElements, setSelectedElement, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'ELEMENT',
      item: { type: 'hero', configuration },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (monitor.didDrop() && !isEditing) {
          const newId = addNewElement('hero', 1, null, null, configuration);
          setElements((prevElements) =>
            prevElements.map((el) => (el.id === newId ? { ...el, configuration } : el))
          );
        }
      },
    }),
    [configuration, isEditing, addNewElement, setElements]
  );

  const uniqueId = useMemo(() => `hero-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Descriptions for each hero configuration
  const descriptions = {
    heroOne: 'A simple hero section with title, subtitle, and a button.',
    heroTwo: 'Another hero section with a different layout and styling.',
    heroThree: 'A more detailed hero section.',
  };

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
        <strong>
          {configuration === 'heroOne' ? 'Hero Section One' : configuration === 'heroTwo' ? 'Hero Section Two' : configuration === 'heroThree' ? 'Hero Section Three' : 'Undefined'}
        </strong>
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#666' }}>
          {descriptions[configuration]}
        </p>
      </div>
    );
  }

  let HeroComponent;
  if (configuration === 'heroOne') {
    HeroComponent = <HeroOne uniqueId={uniqueId} contentListWidth={contentListWidth} />;
  } else if (configuration === 'heroTwo') {
    HeroComponent = <HeroTwo uniqueId={uniqueId} contentListWidth={contentListWidth} />;
  } else if (configuration === 'heroThree') {
    HeroComponent = <HeroThree uniqueId={uniqueId} contentListWidth={contentListWidth} />;
  }

  return selectedElement?.id === uniqueId ? (
    <>
      {HeroComponent}
      <DropZone
        index={null}
        onDrop={(item) => addNewElement(item.type, 1)}
        text="Drop here to create a new section below"
      />
    </>
  ) : (
    HeroComponent
  );
};

export default DraggableHero;
