import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';

const DraggableCTA = ({
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
    // rename config -> structure so handleDrop sees item.structure
    item: { type: 'cta', structure: configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

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

  const ctaElement = findElementById(id, elements);
  const children = ctaElement?.children?.map((childId) => findElementById(childId, elements)) || [];
  
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

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: 'cta', styles: ctaElement?.styles });
  };
  const titles = {
    ctaOne: 'CTA one',
    ctaTwo: 'CTA two',
  };

  // Render description if requested
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

  let CTAComponent;

  if (configuration === 'ctaOne') {
    CTAComponent = (
      <CTAOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'ctaTwo') {
    CTAComponent = (
      <CTATwo
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
  // Render the draggable CTA component
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

      <strong>{label}</strong>
      {CTAComponent}
    </div>
  );
};

export default DraggableCTA;
