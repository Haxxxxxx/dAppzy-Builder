import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';
import { structureConfigurations } from '../../configs/structureConfigurations';

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

  const { addNewElement, setElements, elements, findElementById, handleRemoveElement } = useContext(EditableContext);
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
        return <CTAOne
          handleOpenMediaPanel={handleOpenMediaPanel}
          uniqueId={id}
          children={children}
          onDropItem={onDropItem}
          contentListWidth={contentListWidth}

        />;
      case 'ctaTwo':
        return <CTATwo
          handleOpenMediaPanel={handleOpenMediaPanel}
          uniqueId={id}
          children={children}
          onDropItem={onDropItem}
          contentListWidth={contentListWidth}

        />;
      default:
        console.warn(`Unsupported CTA configuration: ${configuration}`);
        return;
    }
  };

  const CTAComponent = renderCTAComponent();

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
          {/* <p>{descriptions[configuration]}</p> */}
        </div>
        <strong className='element-name'>{label}</strong>
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
