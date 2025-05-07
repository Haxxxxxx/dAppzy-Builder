import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';
import { structureConfigurations } from '../../configs/structureConfigurations.js';

/**
 * DraggableCTA component for rendering and managing CTA (Call to Action) elements.
 * Supports drag and drop functionality, modal interactions, and different CTA configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the CTA
 * @param {string} props.configuration - CTA configuration type
 * @param {boolean} props.isEditing - Whether the CTA is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handlePanelToggle - Function to handle panel toggle
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the CTA preview
 * @param {string} props.label - Label for the CTA
 */
const DraggableCTA = ({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc,
  label,
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Set up drag-and-drop functionality with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'cta', 
      configuration,
      structure: configuration
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const ctaConfig = structureConfigurations[item.configuration];
        if (ctaConfig) {
          // Check if a CTA with this configuration already exists in the current section
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingCTA = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'cta' && el?.configuration === item.configuration);

            if (!existingCTA) {
              // Only create a new CTA if one doesn't exist in the section
              addNewElement('cta', 1, null, targetSectionId, {
                ...ctaConfig,
                configuration: item.configuration,
                structure: item.configuration
              });
            }
          }
        }
        setSelectedElement({ id: item.id, type: 'cta', configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements]);

  // Handle dropping items inside this CTA with improved error handling
  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);
    if (!parentElement) return;

    // Check if the item being dropped is a CTA
    if (item.type === 'cta') {
      // Check if a CTA with this configuration already exists in the parent section
      const sectionElement = findElementById(parentElement.parentId, elements);
      const existingCTA = sectionElement?.children
        ?.map(childId => findElementById(childId, elements))
        ?.find(el => el?.type === 'cta' && el?.configuration === item.configuration);

      if (existingCTA) {
        // If a CTA with this configuration exists, don't create a new one
        return;
      }
    }

    // Create a new element with the same type and configuration as the dropped item
    const newId = addNewElement(item.type, 1, null, parentId, {
      content: item.content || '',
      styles: item.styles || {},
      configuration: item.configuration,
      settings: item.settings || {}
    });

    // Update the parent element's children with unique values
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

    // Select the newly created element
    setSelectedElement({ id: newId, type: item.type, configuration: item.configuration });
  };

  // Find the current CTA and its children with improved error handling
  const ctaElement = findElementById(id, elements);
  const configChildren = structureConfigurations[configuration]?.children || [];
  const resolvedChildren = (ctaElement?.children || [])
    .map((childId) => findElementById(childId, elements))
    .filter(Boolean);
  const childrenToRender = resolvedChildren.length > 0 ? resolvedChildren : configChildren;

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

  // Handle element selection
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: 'cta', styles: ctaElement?.styles });
  };

  // Handle preview display with description
  if (showDescription) {
    return (
      <div 
        className="bento-extract-display" 
        ref={drag} 
        style={{ 
          opacity: isDragging ? 0.5 : 1,
          cursor: 'pointer'
        }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
        aria-label={`${label} preview`}
      >
        <img
          src={imgSrc}
          alt={label}
          style={{
            width: '100%',
            height: 'auto',
            marginBottom: '8px',
            borderRadius: '4px',
          }}
          loading="lazy"
        />
        <strong className='element-name'>{label}</strong>
      </div>
    );
  }

  // Assign the correct CTA component based on configuration
  let CTAComponent;
  if (configuration === 'ctaOne') {
    CTAComponent = (
      <CTAOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
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
        children={childrenToRender}
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
      onClick={toggleModal}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
      aria-label={`${label} component`}
    >
      <strong>{label}</strong>
      {CTAComponent}
    </div>
  );
};

export default DraggableCTA;
