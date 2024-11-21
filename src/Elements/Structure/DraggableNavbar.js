import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import TwoColumnNavbar from '../Sections/Navbars/TwoColumnNavbar';
import ThreeColumnNavbar from '../Sections/Navbars/ThreeColumnNavbar';
import CustomTemplateNavbar from '../Sections/Navbars/CustomTemplateNavbar';

const DraggableNavbar = ({ configuration, isEditing, showDescription = false, contentListWidth }) => {
  const { addNewElement, setElements, setSelectedElement, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'ELEMENT',
      item: { type: 'navbar', configuration },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (monitor.didDrop() && !isEditing) {
          const newId = addNewElement('navbar', 1, null, null, configuration);
          setElements((prevElements) =>
            prevElements.map((el) =>
              el.id === newId ? { ...el, configuration } : el
            )
          );
        }
      },
    }),
    [configuration, isEditing, addNewElement, setElements]
  );

  const uniqueId = useMemo(() => `navbar-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Descriptions for each navbar configuration
  const descriptions = {
    twoColumn: 'A two-column navbar with logo and links.',
    threeColumn: 'A three-column navbar with logo, links, and a button.',
    customTemplate: 'A custom template navbar with logo, links, and buttons.',
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
        <strong>{configuration === 'twoColumn' ? 'Two-Column Navbar' : configuration === 'threeColumn' ? 'Three-Column Navbar' : 'Custom Template Navbar'}</strong>
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#666' }}>
          {descriptions[configuration]}
        </p>
      </div>
    );
  }

  let NavbarComponent;
  if (configuration === 'twoColumn') {
    NavbarComponent = <TwoColumnNavbar uniqueId={uniqueId} contentListWidth={contentListWidth} />;
  } else if (configuration === 'threeColumn') {
    NavbarComponent = <ThreeColumnNavbar uniqueId={uniqueId} contentListWidth={contentListWidth} />;
  } else if (configuration === 'customTemplate') {
    NavbarComponent = <CustomTemplateNavbar uniqueId={uniqueId} contentListWidth={contentListWidth} />;
  }

  return selectedElement?.id === uniqueId ? (
    <>
      {NavbarComponent}
      <DropZone
        index={null}
        onDrop={(item) => addNewElement(item.type, 1)}
        text="Drop here to create a new section below"
      />
    </>
  ) : (
    NavbarComponent
  );
};

export default DraggableNavbar;
