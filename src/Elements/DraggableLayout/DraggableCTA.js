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
  const { addNewElement, setElements, elements, findElementById, setSelectedElement, generateUniqueId } = useContext(EditableContext);
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

  // Handle drop events within the CTA section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    // Get the current CTA section element
    const currentSection = findElementById(id, elements);
    if (!currentSection) {
      console.warn('CTA section not found');
      return;
    }

    // Check if we're trying to add a CTA section inside another CTA section
    if (item.type === 'ctaSection') {
      console.warn('Cannot add a CTA section inside another CTA section');
      return;
    }

    // Check for duplicate elements
    const existingElements = currentSection.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    // For specific elements, check for duplicates
    if (item.type === 'button' || item.type === 'heading' || item.type === 'paragraph') {
      const hasDuplicate = existingElements?.some(el => 
        el.type === item.type && el.content === item.content
      );
      if (hasDuplicate) {
        console.warn(`A ${item.type} with this content already exists in the CTA section`);
        return;
      }
    }

    // Generate a unique ID for the new element
    const newId = generateUniqueId(item.type || 'element');

    // Create base styles based on element type
    const baseStyles = {
      button: {
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#4338CA'
        }
      },
      heading: {
        color: '#1A1A1A',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        lineHeight: '1.2'
      },
      paragraph: {
        color: '#4A4A4A',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        marginBottom: '2rem'
      }
    };

    // Create the new element with proper configuration
    const elementId = addNewElement(
      item.type,
      1,
      index,
      id,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: {
          ...baseStyles[item.type],
          ...item.styles
        },
        configuration: item.configuration || {},
        children: item.children || []
      }
    );

    // Update the parent element's children array
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === id) {
          // Create a new array for the children, maintaining existing ones
          const updatedChildren = [...(el.children || [])];
          
          // Insert the new element ID at the specified index
          updatedChildren.splice(index, 0, elementId);

          return {
            ...el,
            children: updatedChildren
          };
        }
        return el;
      });

      return updatedElements;
    });

    // Select the new element
    setSelectedElement({ 
      id: elementId, 
      type: item.type,
      parentId: id,
      index: index
    });
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
