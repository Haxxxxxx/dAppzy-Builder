import React, { useContext, useState, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import TwoColumnNavbar from '../Sections/Navbars/TwoColumnNavbar';
import ThreeColumnNavbar from '../Sections/Navbars/ThreeColumnNavbar';
import CustomTemplateNavbar from '../Sections/Navbars/CustomTemplateNavbar';
import HeroSelectionModal from '../../utils/SectionQuickAdd/HeroSelectionModal'; // Import the modal component

const DraggableNavbar = ({ id, configuration, isEditing, showDescription = false, contentListWidth }) => {
  const { addNewElement, setElements, elements, findElementById, handleRemoveElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false); // Modal state

  const [{ isDragging }, drag] = useDrag(() => ({
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
  }), [configuration, isEditing, addNewElement, setElements]);

  const uniqueId = useMemo(() => `navbar-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);

  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);

    if (parentElement) {
      const newId = addNewElement(item.type, 1, null, parentId);

      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? {
                ...el,
                children: [...new Set([...el.children, newId])], // Ensure unique children
              }
            : el
        )
      );
    }
  };

  const navbar = findElementById(id, elements);
  const children = navbar?.children?.map((childId) => findElementById(childId, elements)) || [];

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleRemove = () => {
    handleRemoveElement(id);
  };

  const handleHeroSelection = (heroType) => {
    closeModal();
  
    // Create the hero section at the same level as the navbar
    const newHeroId = addNewElement('hero', 1, null, null, heroType); // No parentId to keep it at the top level
  
    // Update the state to include the new hero section
    setElements((prevElements) => [
      ...prevElements,
      {
        id: newHeroId,
        type: 'hero',
        styles: {},
        level: 1, // Same level as navbar
        children: [], // Initialize empty children
        parentId: null,
        content: null,
        structure: heroType,
        configuration: heroType,
      },
    ]);
  
    // Optionally log for debugging
    console.log(`Added hero section of type '${heroType}' at the same level as navbar with ID '${id}'.`);
  };

  const descriptions = {
    twoColumn: 'A two-column navbar with logo and links.',
    threeColumn: 'A three-column navbar with logo, links, and a button.',
    customTemplate: 'A custom template navbar with logo, links, and buttons.',
  };

  const titles = {
    twoColumn: 'Two Columns',
    threeColumn: 'Three Columns',
    customTemplate: '3S Template Navbar',
  };

  // Show description mode
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

  let NavbarComponent;
  if (configuration === 'customTemplate') {
    NavbarComponent = (
      <CustomTemplateNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
      />
    );
  } else if (configuration === 'twoColumn') {
    NavbarComponent = (
      <TwoColumnNavbar
        uniqueId={id}
        children={children}
        onDropItem={onDropItem}
      />
    );
  } else if (configuration === 'threeColumn') {
    NavbarComponent = (
      <ThreeColumnNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
      />
    );
  }

  return (
    <div
      ref={drag}
      style={{
        position: 'relative',
        cursor: 'pointer',
        border: isDragging ? '1px dashed #000' : 'none',
        marginBottom: '16px',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}
      onClick={openModal} // Open modal on click

    >
      {/* Render the Navbar Component */}
      {NavbarComponent}

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>

      {isModalOpen && (
        <HeroSelectionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onHeroSelect={handleHeroSelection}
        />
      )}
    </div>
  );
};

export default DraggableNavbar;
