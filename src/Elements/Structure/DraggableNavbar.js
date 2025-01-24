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
  imgSrc, // Image source for the navbar preview
  label, // Label for the navbar
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const modalRef = useRef(null);

  // Set up drag-and-drop functionality
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

  // Generate a unique ID for the navbar
  const uniqueId = useMemo(() => `navbar-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);

  // Handle dropping items inside this navbar
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

  // Find the current navbar and its children
  const navbar = findElementById(id, elements);
  const children = navbar?.children?.map((childId) => findElementById(childId, elements)) || [];

  // Toggle the modal state
  const toggleModal = () => setModalOpen((prev) => !prev);

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

  // Descriptions for different configurations
  const descriptions = {
    twoColumn: 'A two-column navbar with logo and links.',
    threeColumn: 'A three-column navbar with logo, links, and a button.',
    customTemplate: 'A custom template navbar with logo, links, and buttons.',
  };

  const titles = {
    twoColumn: 'Two Columns',
    threeColumn: 'Three Columns',
    customTemplate: '3S Navbar',
  };

  // Inside DraggableNavbar.js
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: 'navbar', styles: navbar?.styles });
  };

  // Handle preview display with description
  if (showDescription) {
    return (
      <div className="bento-extract-display" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <img
          src={imgSrc}
          alt={label}
          style={{
            width: '100%',
            height: 'auto',
            marginBottom: '8px',
            borderRadius: '4px',
          }}
        />
        <strong className='element-name'>{titles[configuration]}</strong>
        {/* <p>{descriptions[configuration]}</p> */}
      </div>
    );
  }

  // Assign the correct navbar component
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
        handleSelect={handleSelect}

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
        handleSelect={handleSelect}

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
        handleSelect={handleSelect}
      />
    );
  }

  // Render draggable navbar with preview
  return (
    <div
      ref={drag}
      style={{
        position: 'relative',
        cursor: 'pointer',
        border: isDragging ? '1px dashed #000' : 'none',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => {
        toggleModal();    // show/hide your modal
      }}
    >
      <img
        src={imgSrc}
        alt={label}
        style={{
          width: '100%',
          height: 'auto',
          marginBottom: '8px',
          borderRadius: '4px',
          border: '1px solid #ddd',
        }}
      />
      <strong>{label}</strong>
      {NavbarComponent}
    </div>
  );
};

export default DraggableNavbar;
