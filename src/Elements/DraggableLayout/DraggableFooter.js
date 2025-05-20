import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';
import DeFiFooter from '../Sections/Footers/DeFiFooter';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { 
  SimplefooterStyles, 
  DetailedFooterStyles, 
  TemplateFooterStyles, 
  DeFiFooterStyles 
} from '../Sections/Footers/defaultFooterStyles';

/**
 * DraggableFooter component for rendering and managing footer sections.
 * Supports drag and drop functionality, modal interactions, and different footer configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the footer
 * @param {string} props.configuration - Footer configuration type
 * @param {boolean} props.isEditing - Whether the footer is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the footer preview
 * @param {string} props.label - Label for the footer
 */
const DraggableFooter = ({
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

  // Memoize footer styles to avoid recalculation
  const footerStyles = useMemo(() => ({
    simpleFooter: SimplefooterStyles.footerSection,
    detailedFooter: DetailedFooterStyles.footerSection,
    advancedFooter: TemplateFooterStyles.footerSection,
    defiFooter: DeFiFooterStyles.footerSection
  }), []);

  // Set up drag-and-drop functionality with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'footer', 
      configuration,
      structure: configuration
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const footerConfig = structureConfigurations[item.configuration];
        if (footerConfig) {
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            // Check for existing footer in a single pass
            const sectionElement = findElementById(targetSectionId, elements);
            const hasExistingFooter = sectionElement?.children?.some(childId => {
              const child = findElementById(childId, elements);
              return child?.type === 'footer' && child?.configuration === item.configuration;
            });

            if (!hasExistingFooter) {
              // Create footer with base styles
              const baseStyles = footerStyles[item.configuration] || footerConfig.styles || {};

              // Create footer element with minimal properties
              const newFooterId = addNewElement('footer', 1, null, targetSectionId, {
                type: 'footer',
                configuration: item.configuration,
                structure: item.configuration,
                styles: { ...baseStyles }
              });

              // Create main container
              const mainContainerId = `${newFooterId}-main`;
              const mainContainer = {
                id: mainContainerId,
                type: 'div',
                styles: {
                  width: '100%',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '2rem',
                  padding: '10px'
                },
                children: [],
                parentId: newFooterId,
              };

              // Add default content to main container
              const defaultContent = footerConfig.children || [];
              
              // Create all content elements in a single batch
              const contentElements = defaultContent.map(child => {
                const newId = addNewElement(child.type, 1, null, mainContainerId);
                return {
                  id: newId,
                  type: child.type,
                  content: child.content,
                  src: child.src,
                  href: child.href,
                  styles: child.styles || {}
                };
              });

              // Update all elements in a single batch
              setElements(prev => {
                const newElements = [
                  ...prev,
                  mainContainer,
                  ...contentElements
                ];
                
                return newElements.map(el => {
                  if (el.id === newFooterId) {
                    return {
                      ...el,
                      children: [mainContainerId],
                      configuration: item.configuration
                    };
                  }
                  if (el.id === mainContainerId) {
                    return {
                      ...el,
                      children: contentElements.map(e => e.id)
                    };
                  }
                  return el;
                });
              });

              // Batch state updates
              requestAnimationFrame(() => {
                setSelectedElement({ 
                  id: newFooterId, 
                  type: 'footer', 
                  configuration: item.configuration 
                });
              });
            }
          }
        }
      }
    },
  }), [configuration, isEditing, elements, findElementById, addNewElement, setSelectedElement, footerStyles]);

  // Handle drop events within the footer section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentSection = findElementById(id, elements);
    if (!currentSection) {
      console.warn('Footer section not found');
      return;
    }

    if (item.type === 'footer') {
      console.warn('Cannot add a footer inside another footer');
      return;
    }

    // Check for duplicates in a single pass
    const hasDuplicate = currentSection.children?.some(childId => {
      const child = findElementById(childId, elements);
      return child?.type === item.type && 
             (item.type === 'heading' || item.type === 'paragraph' || item.type === 'button') &&
             child?.content === item.content;
    });

    if (hasDuplicate) {
      console.warn(`A ${item.type} with this content already exists in the footer section`);
      return;
    }

    // Add new element with minimal properties
    const elementId = addNewElement(
      item.type,
      1,
      index,
      id,
      {
        type: item.type,
        content: item.content || '',
        styles: item.styles || {},
        configuration: item.configuration || {}
      }
    );

    // Batch state updates
    requestAnimationFrame(() => {
      setSelectedElement({ 
        id: elementId, 
        type: item.type,
        parentId: id,
        index: index
      });
    });
  };

  // Memoize footer element and children with improved caching
  const footerElement = useMemo(() => findElementById(id, elements), [id, elements, findElementById]);
  
  const configChildren = useMemo(() => 
    structureConfigurations[configuration]?.children || [], 
    [configuration]
  );

  const resolvedChildren = useMemo(() => {
    if (!footerElement?.children?.length) return [];
    return footerElement.children
      .map(childId => findElementById(childId, elements))
      .filter(Boolean);
  }, [footerElement?.children, elements, findElementById]);

  const childrenToRender = useMemo(() => 
    resolvedChildren.length > 0 ? resolvedChildren : configChildren,
    [resolvedChildren, configChildren]
  );

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
    setSelectedElement({ id, type: 'footer', styles: footerElement?.styles });
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

  // Assign the correct footer component based on configuration
  let FooterComponent;
  if (configuration === 'simpleFooter') {
    FooterComponent = (
      <SimpleFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'detailedFooter') {
    FooterComponent = (
      <DetailedFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'advancedFooter') {
    FooterComponent = (
      <TemplateFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'defiFooter') {
    FooterComponent = (
      <DeFiFooter
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

  // Render the draggable footer component
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
      {FooterComponent}
    </div>
  );
};

export default DraggableFooter;
