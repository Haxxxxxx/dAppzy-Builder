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

    const sectionElement = findElementById(id, elements);
    if (!sectionElement) return;

    // Get configuration styles
    const config = structureConfigurations[configuration] || {};
    const configStyles = config.styles || {};

    // First, ensure the section has the default styles
    const mergedSectionStyles = mergeStyles(defaultSectionStyles.section, configStyles.section || {});
    updateStyles(id, mergedSectionStyles);

    // Create default containers with their content
    const containers = [
      {
        id: `${id}-content`,
        type: 'div',
        part: 'content',
        layout: 'content',
        styles: mergeStyles(defaultSectionStyles.contentWrapper, configStyles.content || {}),
        children: [
          {
            id: `${id}-heading-${generateUniqueId('heading')}`,
            type: 'heading',
            content: 'Bibendum amet at molestie mattis.',
            styles: mergeStyles(defaultSectionStyles.heading, configStyles.heading || {}),
            parentId: `${id}-content`,
            configuration: configuration
          },
          {
            id: `${id}-paragraph-${generateUniqueId('paragraph')}`,
            type: 'paragraph',
            content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.',
            styles: mergeStyles(defaultSectionStyles.paragraph, configStyles.paragraph || {}),
            parentId: `${id}-content`,
            configuration: configuration
          }
        ],
        parentId: id,
        configuration: configuration
      },
      {
        id: `${id}-buttons`,
        type: 'div',
        part: 'buttons',
        layout: 'buttons',
        styles: mergeStyles(defaultSectionStyles.buttonContainer, configStyles.buttons || {}),
        children: [
          {
            id: `${id}-button-${generateUniqueId('button')}`,
            type: 'button',
            content: 'Primary Action',
            styles: mergeStyles(defaultSectionStyles.button, configStyles.button || {}),
            parentId: `${id}-buttons`,
            configuration: configuration
          },
          {
            id: `${id}-button-${generateUniqueId('button')}`,
            type: 'button',
            content: 'Secondary Action',
            styles: mergeStyles(defaultSectionStyles.button, configStyles.button || {}),
            parentId: `${id}-buttons`,
            configuration: configuration
          }
        ],
        parentId: id,
        configuration: configuration
      },
      {
        id: `${id}-image`,
        type: 'div',
        part: 'image',
        layout: 'image',
        styles: mergeStyles(defaultSectionStyles.imageContainer, configStyles.image || {}),
        children: [
          {
            id: `${id}-image-${generateUniqueId('image')}`,
            type: 'image',
            content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
            styles: mergeStyles(defaultSectionStyles.image, configStyles.image || {}),
            parentId: `${id}-image`,
            configuration: configuration
          }
        ],
        parentId: id,
        configuration: configuration
      }
    ];

    // Check for existing containers and only add missing ones
    setElements(prev => {
      const existingIds = new Set(prev.map(el => el.id));
      const newElements = [];
      
      // Add containers and their content elements
      containers.forEach(container => {
        if (!existingIds.has(container.id)) {
          newElements.push(container);
          container.children.forEach(child => {
            if (!existingIds.has(child.id)) {
              newElements.push(child);
            }
          });
        }
      });
      
      if (newElements.length === 0) {
        return prev;
      }

      // Update section's children to only include containers
      const updatedElements = [...prev];
      const sectionIndex = updatedElements.findIndex(el => el.id === id);
      
      if (sectionIndex !== -1) {
        // Remove any non-container children from the section
        const containerIds = containers.map(c => c.id);
        const currentChildren = updatedElements[sectionIndex].children || [];
        const nonContainerChildren = currentChildren.filter(childId => !containerIds.includes(childId));
        
        // Remove non-container children from the elements array
        const filteredElements = updatedElements.filter(el => !nonContainerChildren.includes(el.id));
        
        // Update the section with only container children
        filteredElements[sectionIndex] = {
          ...filteredElements[sectionIndex],
          children: containerIds,
          configuration: configuration,
          styles: mergedSectionStyles
        };

        return [...filteredElements, ...newElements];
      }

      return [...updatedElements, ...newElements];
    });

    defaultInjectedRef.current = true;
  }, [id, elements, findElementById, setElements, updateStyles, configuration, generateUniqueId]);

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
      structure: configuration,
      styles: structureConfigurations[configuration]?.styles || {},
      children: structureConfigurations[configuration]?.children || []
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
            
            // Get configuration styles
            const config = structureConfigurations[item.configuration] || {};
            const configStyles = config.styles || {};

            // Create the new section with standardized configuration
            const newSection = {
              id: newSectionId,
              type: 'section',
              configuration: item.configuration,
              structure: item.configuration,
              styles: mergeStyles(defaultSectionStyles.section, configStyles.section || {}),
              children: [],
              label: label || '',
              description: description || '',
              settings: {}
            };

            // Create default containers with their content
            const containers = [
              {
                id: `${newSectionId}-content`,
                type: 'div',
                part: 'content',
                layout: 'content',
                styles: mergeStyles(defaultSectionStyles.contentWrapper, configStyles.content || {}),
                children: [
                  {
                    id: `${newSectionId}-heading-${generateUniqueId('heading')}`,
                    type: 'heading',
                    content: 'Bibendum amet at molestie mattis.',
                    styles: mergeStyles(defaultSectionStyles.heading, configStyles.heading || {}),
                    parentId: `${newSectionId}-content`,
                    configuration: item.configuration
                  },
                  {
                    id: `${newSectionId}-paragraph-${generateUniqueId('paragraph')}`,
                    type: 'paragraph',
                    content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.',
                    styles: mergeStyles(defaultSectionStyles.paragraph, configStyles.paragraph || {}),
                    parentId: `${newSectionId}-content`,
                    configuration: item.configuration
                  }
                ],
                parentId: newSectionId,
                configuration: item.configuration
              },
              {
                id: `${newSectionId}-buttons`,
                type: 'div',
                part: 'buttons',
                layout: 'buttons',
                styles: mergeStyles(defaultSectionStyles.buttonContainer, configStyles.buttons || {}),
                children: [
                  {
                    id: `${newSectionId}-button-${generateUniqueId('button')}`,
                    type: 'button',
                    content: 'Primary Action',
                    styles: mergeStyles(defaultSectionStyles.button, configStyles.button || {}),
                    parentId: `${newSectionId}-buttons`,
                    configuration: item.configuration
                  },
                  {
                    id: `${newSectionId}-button-${generateUniqueId('button')}`,
                    type: 'button',
                    content: 'Secondary Action',
                    styles: mergeStyles(defaultSectionStyles.button, configStyles.button || {}),
                    parentId: `${newSectionId}-buttons`,
                    configuration: item.configuration
                  }
                ],
                parentId: newSectionId,
                configuration: item.configuration
              },
              {
                id: `${newSectionId}-image`,
                type: 'div',
                part: 'image',
                layout: 'image',
                styles: mergeStyles(defaultSectionStyles.imageContainer, configStyles.image || {}),
                children: [
                  {
                    id: `${newSectionId}-image-${generateUniqueId('image')}`,
                    type: 'image',
                    content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
                    styles: mergeStyles(defaultSectionStyles.image, configStyles.image || {}),
                    parentId: `${newSectionId}-image`,
                    configuration: item.configuration
                  }
                ],
                parentId: newSectionId,
                configuration: item.configuration
              }
            ];

            // Add all elements in a single batch update
            setElements(prev => {
              const existingIds = new Set(prev.map(el => el.id));
              const newElements = [];
              
              // Add containers and their content elements
              containers.forEach(container => {
                if (!existingIds.has(container.id)) {
                  newElements.push(container);
                  container.children.forEach(child => {
                    if (!existingIds.has(child.id)) {
                      newElements.push(child);
                    }
                  });
                }
              });
              
              if (newElements.length === 0) {
                return prev;
              }

              // Update the section's children in the same batch
              const updatedElements = [...prev];
              const sectionIndex = updatedElements.findIndex(el => el.id === newSectionId);
              
              if (sectionIndex !== -1) {
                updatedElements[sectionIndex] = {
                  ...updatedElements[sectionIndex],
                  children: containers.map(c => c.id)
                };
              }

              return [...updatedElements, ...newElements];
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

    // Find the appropriate container for the element type
    const containerMap = {
      heading: 'content',
      paragraph: 'content',
      button: 'buttons',
      image: 'image'
    };

    const containerType = containerMap[item.type];
    if (!containerType) {
      console.warn(`No container found for element type: ${item.type}`);
      return;
    }

    // Find the container
    const container = currentSection.children
      ?.map(childId => findElementById(childId, elements))
      ?.find(el => el?.part === containerType);

    if (!container) {
      console.warn(`Container not found for type: ${containerType}`);
      return;
    }

    // Check for duplicate elements within the container
    const existingElements = container.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    const hasDuplicate = existingElements?.some(el => 
      el.type === item.type && el.content === item.content
    );

    if (hasDuplicate) {
      console.warn(`A ${item.type} with this content already exists in the ${containerType} container`);
      return;
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
      container.id,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: mergeStyles(baseStyles[item.type] || {}, item.styles || {}),
        children: item.children || [],
        parentId: container.id,
        configuration: currentSection.configuration
      }
    );

    // Update the container's children array
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === container.id) {
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
      parentId: container.id,
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
      handleSelect: (e) => {
        e.stopPropagation();
        const element = findElementById(id, elements);
        setSelectedElement(element || { id, type: 'section', styles: {} });
      },
      uniqueId: id,
      onDropItem,
      handleOpenMediaPanel,
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
