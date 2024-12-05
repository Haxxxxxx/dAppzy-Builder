import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import TwoColumnNavbar from '../Sections/Navbars/TwoColumnNavbar';
import ThreeColumnNavbar from '../Sections/Navbars/ThreeColumnNavbar';
import CustomTemplateNavbar from '../Sections/Navbars/CustomTemplateNavbar';

const DraggableNavbar = ({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { addNewElement, setElements, elements, findElementById, handleRemoveElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const modalRef = useRef(null);

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

  const toggleModal = () => setModalOpen((prev) => !prev);

  const handleRemove = () => {
    handleRemoveElement(id);
  };

  const handleHeroSelection = (heroType) => {
    setModalOpen(false);
    const newHeroId = addNewElement('hero', 1, null, null, heroType);
    console.log(`Added hero section of type '${heroType}' at the same level as navbar with ID '${id}'.`);
  };

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

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
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    );
  } else if (configuration === 'twoColumn') {
    NavbarComponent = (
      <TwoColumnNavbar
        uniqueId={id}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    );
  } else if (configuration === 'threeColumn') {
    NavbarComponent = (
      <ThreeColumnNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
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
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}
      onClick={toggleModal}
    >
      {NavbarComponent}


    </div>
  );
};

export default DraggableNavbar;
