import React, { useContext, useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SectionOne from '../Sections/ContentSections/SectionOne';
import SectionTwo from '../Sections/ContentSections/SectionTwo';
import SectionThree from '../Sections/ContentSections/SectionThree';
import SectionFour from '../Sections/ContentSections/SectionFour';
import StructurePanel from '../../components/LeftbarPanels/StructurePanel';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { mergeStyles } from '../../utils/htmlRenderUtils/containerHelpers';
import { defaultSectionStyles } from '../Sections/ContentSections/defaultSectionStyles';
import { merge } from 'lodash';

/**
 * DraggableContentSections component for rendering and managing content sections.
 * Supports drag and drop functionality, modal interactions, and different section configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the section
 * @param {string} props.configuration - Section configuration type
 * @param {boolean} props.isEditing - Whether the section is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handlePanelToggle - Function to handle panel toggle
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the section preview
 * @param {string} props.label - Label for the section
 * @param {string} props.description - Description for the section
 */
const DraggableContentSections = ({
  id,
  configuration,
  type,
  label,
  description,
  isEditing,
  showDescription,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc,
}) => {
  const {
    addNewElement,
    setElements,
    elements,
    findElementById,
    setSelectedElement,
    updateStyles,
    generateUniqueId
  } = useContext(EditableContext);

  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  const defaultInjectedRef = useRef(false);

  // Initialize the Content Section structure with containers
  useEffect(() => {
    if (!id || defaultInjectedRef.current) return;

    // First, ensure the section has the default styles
    const mergedSectionStyles = merge({}, defaultSectionStyles.section, findElementById(id, elements)?.styles);
    updateStyles(id, mergedSectionStyles);

    // Create default containers
    const containers = [
      {
        id: `${id}-content`,
        type: 'div',
        part: 'content',
        layout: 'content',
        styles: defaultSectionStyles.contentWrapper,
        children: [],
        parentId: id,
        configuration: configuration
      },
      {
        id: `${id}-buttons`,
        type: 'div',
        part: 'buttons',
        layout: 'buttons',
        styles: defaultSectionStyles.buttonContainer,
        children: [],
        parentId: id,
        configuration: configuration
      },
      {
        id: `${id}-image`,
        type: 'div',
        part: 'image',
        layout: 'image',
        styles: defaultSectionStyles.imageContainer,
        children: [],
        parentId: id,
        configuration: configuration
      }
    ];

    // Add containers if they don't exist
    containers.forEach(container => {
      if (!findElementById(container.id, elements)) {
        setElements(prev => [...prev, container]);
      }
    });

    // Update section's children to include all containers
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        return {
          ...el,
          children: containers.map(c => c.id),
          configuration: configuration
        };
      }
      return el;
    }));

    defaultInjectedRef.current = true;
  }, [id, elements, findElementById, setElements, updateStyles, configuration]);

  // Standardized container creation helper
  const createContainerStructure = (parentId, type, config) => {
    const containers = [
      {
        id: `${parentId}-content`,
        type: 'div',
        part: 'content',
        layout: 'content',
        styles: defaultSectionStyles.contentWrapper,
        children: [],
        parentId: parentId,
        configuration: config
      },
      {
        id: `${parentId}-buttons`,
        type: 'div',
        part: 'buttons',
        layout: 'buttons',
        styles: defaultSectionStyles.buttonContainer,
        children: [],
        parentId: parentId,
        configuration: config
      },
      {
        id: `${parentId}-image`,
        type: 'div',
        part: 'image',
        layout: 'image',
        styles: defaultSectionStyles.imageContainer,
        children: [],
        parentId: parentId,
        configuration: config
      }
    ];
    return containers;
  };

  // Standardized style management
  const applyStyles = (element, type) => {
    return {
      ...defaultSectionStyles[type],
      ...element.styles,
      position: 'relative',
      boxSizing: 'border-box'
    };
  };

  // Standardized configuration handling
  const createElementConfig = (type, config) => {
    return {
      type,
      configuration: config.type,
      styles: applyStyles({}, type),
      content: '',
      label: config.label || '',
      description: config.description || '',
      settings: config.settings || {},
      children: [],
      layout: ['left', 'right']
    };
  };

  // Standardized ID generation
  const generateElementIds = (type, count) => {
    return Array(count).fill(null).map(() => generateUniqueId(type));
  };

  // Setup drag behavior with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'section', 
      configuration,
      structure: configuration 
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const dropResult = monitor.getDropResult();
        const targetSectionId = dropResult?.sectionId;
        
        if (targetSectionId) {
          const sectionElement = findElementById(targetSectionId, elements);
          const existingSection = sectionElement?.children
            ?.map(childId => findElementById(childId, elements))
            ?.find(el => el?.type === 'section' && el?.configuration === item.configuration);

          if (!existingSection) {
            // Generate unique ID for the section
            const newSectionId = generateUniqueId('section');
            
            // Create the new section with standardized configuration
            const newSection = createElementConfig('section', {
              type: 'section',
              label: label || '',
              description: description || '',
              settings: {}
            });
            newSection.id = newSectionId;

            // Create default containers
            const containers = createContainerStructure(newSectionId, 'section', item.configuration);
            newSection.children = containers.map(container => container.id);

            // Add all elements in a single update
            setElements(prev => {
              const newElements = [...prev];
              newElements.push(newSection, ...containers);
              return newElements;
            });

            // Apply styles to all containers
            containers.forEach(container => {
              updateStyles(container.id, container.styles);
            });

            setSelectedElement({ id: newSectionId, type: 'section', configuration: item.configuration });
          }
        }
      }
    },
  }), [configuration, isEditing, elements, label, description]);

  // Handle drop events within the content section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    // Get the current content section element
    const currentSection = findElementById(id, elements);
    if (!currentSection) {
      console.warn('Content section not found');
      return;
    }

    // Check if we're trying to add a content section inside another content section
    if (item.type === 'contentSection') {
      console.warn('Cannot add a content section inside another content section');
      return;
    }

    // Check for duplicate elements
    const existingElements = currentSection.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    // For specific elements, check for duplicates
    if (item.type === 'heading' || item.type === 'paragraph' || item.type === 'image') {
      const hasDuplicate = existingElements?.some(el => 
        el.type === item.type && el.content === item.content
      );
      if (hasDuplicate) {
        console.warn(`A ${item.type} with this content already exists in the content section`);
        return;
      }
    }

    // Generate a unique ID for the new element
    const newId = generateUniqueId(item.type || 'element');

    // Create base styles based on element type
    const baseStyles = {
      heading: {
        color: '#1A1A1A',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        lineHeight: '1.2'
      },
      paragraph: {
        color: '#4A4A4A',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        marginBottom: '1.5rem'
      },
      image: {
        width: '100%',
        height: 'auto',
        borderRadius: '12px',
        objectFit: 'cover',
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

  // Find the current section and its children
  const sectionElement = findElementById(id, elements);
  const containers = sectionElement?.children
    ?.map(childId => findElementById(childId, elements))
    .filter(Boolean) || [];

  // Get the appropriate section component
  const getSectionComponent = () => {
    const props = {
      uniqueId: id,
      contentListWidth,
      onDropItem,
      handlePanelToggle,
      handleOpenMediaPanel,
      handleSelect: (e) => {
        e.stopPropagation();
        const element = findElementById(id, elements);
        setSelectedElement(element || { id, type: 'section', styles: {} });
      },
      containers: containers
    };

    switch (configuration) {
      case 'sectionOne':
        return <SectionOne {...props} />;
      case 'sectionTwo':
        return <SectionTwo {...props} />;
      case 'sectionThree':
        return <SectionThree {...props} />;
      case 'sectionFour':
        return <SectionFour {...props} />;
      default:
        return null;
    }
  };

  // Toggle modal state
  const toggleModal = () => setModalOpen(prev => !prev);

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

  // Render preview with description
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
        <strong className='element-name'>{label}</strong>
        {description && <p className='element-description'>{description}</p>}
      </div>
    );
  }

  return (
    <>
      <div
        ref={drag}
        style={{
          cursor: 'pointer',
          border: isDragging ? '1px dashed #000' : 'none',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleModal();
        }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
        aria-label={`${label} component`}
      >
        <strong>{label}</strong>
        {getSectionComponent()}
      </div>

      {isModalOpen && (
        <div
          ref={modalRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === modalRef.current) {
              toggleModal();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Edit Structure"
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '80%',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Structure</h2>
            <StructurePanel />
            <button
              onClick={toggleModal}
              style={{
                marginTop: '20px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              aria-label="Close modal"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DraggableContentSections;
