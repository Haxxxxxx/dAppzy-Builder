import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import MintingSection from '../Sections/Web3Related/MintingSection';
import { Web3Configs } from '../../configs/Web3/Web3Configs';
import { merge } from 'lodash';
import '../../components/css/LeftBar.css';

// Default styles for Minting components
const defaultMintingStyles = {
  mintingSection: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box',
    padding: '2rem',
    backgroundColor: '#f8f9fa'
  },
  mintingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  mintingModule: {
    position: 'relative',
    boxSizing: 'border-box',
    padding: '20px',
    margin: '10px 0',
    backgroundColor: 'rgba(42, 42, 60, 0.5)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
    width: '100%',
    minHeight: '200px'
  }
};

/**
 * DraggableMinting component for rendering and managing minting sections.
 * Supports drag and drop functionality, modal interactions, and different minting configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the minting section
 * @param {string} props.configuration - Minting configuration type
 * @param {boolean} props.isEditing - Whether the minting section is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handlePanelToggle - Function to handle panel toggle
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the minting section preview
 * @param {string} props.label - Label for the minting section
 * @param {string} props.description - Description of the minting section
 * @param {Object} props.structure - Structure of the minting section
 */
const DraggableMinting = ({
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
  const { addNewElement, setElements, elements, findElementById, setSelectedElement, generateUniqueId, updateStyles } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  const defaultInjectedRef = useRef(false);

  // Generate a unique ID if none is provided
  const sectionId = id || `minting-section-${Date.now()}`;

  // Initialize the Minting structure with content container
  useEffect(() => {
    if (!sectionId || defaultInjectedRef.current) return;

    // First, ensure the Minting section has the default styles
    const mergedMintingStyles = merge({}, defaultMintingStyles.mintingSection, findElementById(sectionId, elements)?.styles);
    updateStyles(sectionId, mergedMintingStyles);

    const contentContainerId = `${sectionId}-content`;

    // Create content container if it doesn't exist
    if (!findElementById(contentContainerId, elements)) {
      const contentContainer = {
        id: contentContainerId,
        type: 'div',
        styles: defaultMintingStyles.mintingContent,
        children: [],
        parentId: sectionId,
      };
      setElements(prev => [...prev, contentContainer]);

      // Add default modules to content container
      const mintingConfig = Web3Configs[configuration];
      if (mintingConfig?.children) {
        const moduleIds = mintingConfig.children.map(module => {
          const newId = addNewElement('mintingModule', 1, null, contentContainerId);
          // Update the module with content and styles
          setElements(prev => prev.map(el => {
            if (el.id === newId) {
              return {
                ...el,
                content: module.content,
                styles: merge(defaultMintingStyles.mintingModule, module.styles || {}),
                settings: {
                  ...module.settings,
                  enabled: true
                }
              };
            }
            return el;
          }));
          return newId;
        });

        // Update content container with all module IDs
        setElements(prev => prev.map(el => {
          if (el.id === contentContainerId) {
            return {
              ...el,
              children: moduleIds
            };
          }
          return el;
        }));
      }
    }

    // Update Minting section's children to only include the content container
    setElements(prev => prev.map(el => {
      if (el.id === sectionId) {
        return {
          ...el,
          children: [contentContainerId],
          configuration: configuration
        };
      }
      return el;
    }));

    defaultInjectedRef.current = true;
  }, [sectionId, elements, findElementById, setElements, addNewElement, updateStyles, configuration]);

  // Standardized container creation helper
  const createContainerStructure = (parentId, type) => {
    const contentContainerId = `${parentId}-content`;
    return {
      id: contentContainerId,
      type: 'div',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto'
      },
      children: [],
      parentId: parentId
    };
  };

  // Standardized style management
  const applyStyles = (element, type) => {
    const baseStyles = {
      mintingSection: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box'
      },
      mintingModule: {
        position: 'relative',
        boxSizing: 'border-box',
        padding: '20px',
        margin: '10px 0',
        backgroundColor: 'rgba(42, 42, 60, 0.5)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        width: '100%',
        minHeight: '200px'
      }
    };
    return {
      ...baseStyles[type],
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
      structure: config.structure,
      styles: applyStyles({}, type),
      settings: config.settings || {},
      children: []
    };
  };

  // Standardized ID generation
  const generateElementIds = (type, count) => {
    return Array(count).fill(null).map(() => generateUniqueId(type));
  };

  // Set up drag-and-drop functionality with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id: sectionId, 
      type: 'mintingSection', 
      configuration,
      structure: Web3Configs[configuration]
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const mintingConfig = Web3Configs[item.configuration];
        if (mintingConfig) {
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingMinting = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'mintingSection' && el?.configuration === item.configuration);

            if (!existingMinting) {
              // Generate unique IDs for the section and its modules
              const newSectionId = generateUniqueId('mintingSection');
              const moduleIds = generateElementIds('mintingModule', mintingConfig.children?.length || 0);
              
              // Create the content container first
              const contentContainer = createContainerStructure(newSectionId, 'mintingSection');

              // Create the new Minting section with standardized configuration
              const newMintingSection = createElementConfig('mintingSection', {
                type: 'mintingSection',
                structure: mintingConfig,
                settings: mintingConfig.settings || {}
              });
              newMintingSection.id = newSectionId;
              newMintingSection.children = [contentContainer.id];

              // Create default modules with standardized structure
              const modules = mintingConfig.children?.map((child, index) => ({
                id: moduleIds[index],
                type: 'mintingModule',
                content: child.content,
                settings: child.settings || {},
                styles: applyStyles(child, 'mintingModule')
              })) || [];

              // Add all elements in a single update
              setElements(prev => {
                const newElements = [...prev];
                newElements.push(newMintingSection, contentContainer, ...modules);
                return newElements;
              });

              setSelectedElement({ id: newSectionId, type: 'mintingSection', configuration: item.configuration });
            }
          }
        }
      }
    },
  }), [configuration, isEditing, elements, sectionId]);

  // Handle drop events within the minting section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    // Get the current minting section element
    const currentSection = findElementById(sectionId, elements);
    if (!currentSection) {
      console.warn('Minting section not found');
      return;
    }

    // Check if we're trying to add a minting section inside another minting section
    if (item.type === 'mintingSection') {
      console.warn('Cannot add a minting section inside another minting section');
      return;
    }

    // Check for duplicate elements
    const existingElements = currentSection.children
        ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    // For specific elements, check for duplicates
    if (item.type === 'mintButton' || item.type === 'priceDisplay' || item.type === 'countdownTimer') {
      const hasDuplicate = existingElements?.some(el => 
        el.type === item.type && el.configuration?.id === item.configuration?.id
      );
      if (hasDuplicate) {
        console.warn(`A ${item.type} with this configuration already exists in the minting section`);
        return;
      }
    }

    // Generate a unique ID for the new element
    const newId = generateUniqueId(item.type || 'element');

    // Create base styles based on element type
    const baseStyles = {
      mintButton: {
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      priceDisplay: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: '1rem'
      },
      countdownTimer: {
        fontSize: '1.5rem',
        color: '#4A4A4A',
        marginBottom: '1rem'
      }
    };

    // Create the new element with proper configuration and unique ID
    const elementId = addNewElement(
      item.type,
      1,
      index,
      sectionId,
      {
        id: newId,
        type: item.type,
      content: item.content || '',
        styles: {
          ...baseStyles[item.type],
          ...item.styles
        },
        configuration: {
          ...item.configuration,
          id: newId
        },
        settings: item.settings || {},
        children: item.children?.map(child => ({
          ...child,
          id: generateUniqueId(child.type || 'element'),
          settings: child.settings || {},
          styles: child.styles || {}
        })) || []
      }
    );

    // Update the parent element's children array
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === sectionId) {
          const updatedChildren = [...(el.children || [])];
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
      parentId: sectionId,
      index: index
    });
  };

  // Find the current Minting section and its children
  const mintingElement = findElementById(sectionId, elements);
  const contentContainer = mintingElement?.children?.[0] ? findElementById(mintingElement.children[0], elements) : null;
  const resolvedChildren = contentContainer?.children
    ?.map((childId) => findElementById(childId, elements))
    .filter(Boolean) || [];

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
    e.stopPropagation();
    setSelectedElement({ id: sectionId, type: 'mintingSection', styles: mintingElement?.styles });
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

  // Render the draggable Minting component
  return (
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
      onClick={toggleModal}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
      aria-label={`${label} component`}
    >
      <strong>{label}</strong>
      <MintingSection
        id={sectionId}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    </div>
  );
};

export default DraggableMinting;
