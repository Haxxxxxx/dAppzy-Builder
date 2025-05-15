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
 */
const DraggableContentSections = ({
  id,
  configuration,
  isEditing,
  showDescription,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc,
  label,
}) => {
  const {
    addNewElement,
    setElements,
    elements,
    findElementById,
    setSelectedElement,
    updateStyles,
  } = useContext(EditableContext);

  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  const defaultInjectedRef = useRef(false);

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
        const sectionConfig = structureConfigurations[item.configuration];
        if (sectionConfig) {
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingSection = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'section' && el?.configuration === item.configuration);

            if (!existingSection) {
              // Create a new section with the proper configuration and styles
              const newSectionId = addNewElement('section', 1, null, targetSectionId, {
                type: 'section',
                configuration: item.configuration,
                styles: sectionConfig.styles?.section || {},
                content: '',
                label: sectionConfig.label || '',
                settings: sectionConfig.settings || {},
                children: [],
                layout: sectionConfig.layout || ['left', 'right']
              });

              // Create default containers for the section based on its layout
              const layout = sectionConfig.layout || ['left', 'right'];
              const containerUpdates = layout.map(part => ({
                id: `${newSectionId}-${part}`,
                type: 'div',
                part: part,
                layout: part,
                styles: sectionConfig.styles?.[part] || {},
                children: [],
                parentId: newSectionId,
                configuration: item.configuration
              }));

              // Add all containers in a single update
              setElements(prev => {
                const newElements = [...prev];
                containerUpdates.forEach(container => {
                  newElements.push(container);
                });
                // Update the section's children array
                const sectionIndex = newElements.findIndex(el => el.id === newSectionId);
                if (sectionIndex !== -1) {
                  newElements[sectionIndex] = {
                    ...newElements[sectionIndex],
                    children: containerUpdates.map(container => container.id)
                  };
                }
                return newElements;
              });

              // Apply configuration styles
              if (sectionConfig.styles) {
                // Apply section styles
                updateStyles(newSectionId, sectionConfig.styles.section || {});

                // Apply container styles
                containerUpdates.forEach(container => {
                  if (sectionConfig.styles[container.part]) {
                    updateStyles(container.id, sectionConfig.styles[container.part]);
                  }
                });

                // Create and apply styles for content elements
                sectionConfig.children?.forEach(child => {
                  const containerType = child.type === 'button' ? 'buttons' : 
                                      child.type === 'image' ? 'image' : 'content';
                  const containerId = `${newSectionId}-${containerType}`;
                  const newId = `${newSectionId}-${child.type}-${Math.random().toString(36).substr(2, 9)}`;

                  // Get the appropriate styles for this element type
                  let elementStyles = {};
                  if (child.type === 'button') {
                    elementStyles = child.content === 'Primary Action' ? 
                      sectionConfig.styles.primaryButton : 
                      sectionConfig.styles.secondaryButton;
                  } else if (child.type === 'image') {
                    // Get both image container and image element styles
                    elementStyles = {
                      ...sectionConfig.styles.image,
                      img: sectionConfig.styles.image?.img || {}
                    };
                  } else {
                    elementStyles = sectionConfig.styles[child.type] || {};
                  }

                  // Create the element with its styles
                  const newElement = {
                    id: newId,
                    type: child.type,
                    content: child.content,
                    styles: elementStyles,
                    parentId: containerId,
                    configuration: item.configuration
                  };

                  // Add the element
                  setElements(prev => [...prev, newElement]);

                  // Update container's children array
                  setElements(prev => prev.map(el => 
                    el.id === containerId
                      ? { ...el, children: [...(el.children || []), newId] }
                      : el
                  ));

                  // Apply the element's styles
                  updateStyles(newId, elementStyles);
                });
              }
            }
          }
        }
        setSelectedElement({ id: item.id, type: 'section', configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements]);

  // Handle drop events within the section with improved error handling
  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);
    if (!parentElement) return;

    // Check if the item being dropped is a section
    if (item.type === 'ContentSection') {
      const sectionElement = findElementById(parentElement.parentId, elements);
      const existingSection = sectionElement?.children
        ?.map(childId => findElementById(childId, elements))
        ?.find(el => el?.type === 'ContentSection' && el?.configuration === item.configuration);

      if (existingSection) return;
    }

    // Create new element with proper configuration
    const newElement = {
      type: item.type,
      content: item.content || '',
      styles: mergeStyles(item.styles || {}, {}),
      configuration: item.configuration,
      settings: item.settings || {},
      children: []
    };

    // Add wrappers for specific configurations
    if (item.configuration === 'defaultContentSection' || item.configuration === 'customContentSection') {
      newElement.children = [
          {
            type: 'div',
            styles: { display: 'flex', flexDirection: 'column', flex: 3, gap: '16px' },
            children: []
          },
          {
            type: 'div',
            styles: { display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' },
            children: []
          }
      ];
    }

    const newId = addNewElement(item.type, 1, null, parentId, newElement);

    // Update parent's children array
    setElements(prev => prev.map(el => 
        el.id === parentId
        ? { ...el, children: [...new Set([...el.children, newId])] }
          : el
    ));

    setSelectedElement({ id: newId, type: item.type, configuration: item.configuration });
  };

  // Find the current section and its children
  const sectionElement = findElementById(id, elements);
  const configChildren = structureConfigurations[configuration]?.children || [];
  const resolvedChildren = (sectionElement?.children || [])
    .map(childId => findElementById(childId, elements))
    .filter(Boolean);
  const childrenToRender = resolvedChildren.length > 0 ? resolvedChildren : configChildren;

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

  // Handle element selection
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'ContentSection', styles: sectionElement?.styles });
  };

  // Render preview with description
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

  // Get the appropriate section component
  const getSectionComponent = () => {
    const props = {
      uniqueId: id,
      contentListWidth,
      children: childrenToRender,
      onDropItem,
      handlePanelToggle,
      handleOpenMediaPanel,
      handleSelect,
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
