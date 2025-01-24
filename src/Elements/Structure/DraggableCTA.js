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
  handleOpenMediaPanel,
  contentListWidth,
  imgSrc, // Image source for the navbar preview
  label, // Label for the navbar
}) => {

  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const modalRef = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'cta', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        // Just add the hero element with configuration as structure
        const newId = addNewElement('cta', 1, null, null, configuration);

        // Now update the element with the given configuration
        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === newId ? { ...el, configuration } : el
          )
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);

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
              children: [...new Set([...el.children, newId])],
            }
            : el
        )
      );
    }
  };

  const ctaElement = findElementById(id, elements);
  const children = ctaElement?.children?.map((childId) => findElementById(childId, elements));
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
    setSelectedElement({ id, type: 'CTA', styles: ctaElement?.styles });
  };

  // Render description if requested
  if (showDescription) {
    return (
      <div className='bento-extract-display' onClick={toggleModal}
      >
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
        </div>
        <strong className='element-name'>{label}</strong>
      </div>
    );
  }
  let CTAComponent;
  if (configuration === 'CTAOne') {
    CTAComponent = (
      <CTAOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'CTATwo') {
    CTAComponent = (
      <CTATwo
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handleSelect={handleSelect}
      />
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
