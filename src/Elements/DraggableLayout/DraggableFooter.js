import React, { useContext, useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';
import { Image, Span, LinkBlock } from '../SelectableElements';
import useElementDrop from '../../utils/useElementDrop';
import DeFiFooter from '../Sections/Footers/DeFiFooter';
import { FooterConfigurations } from '../../configs/footers/FooterConfigurations';
import { SimplefooterStyles, DetailedFooterStyles, TemplateFooterStyles, DeFiFooterStyles } from '../Sections/Footers/defaultFooterStyles';

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
  const navRef = useRef(null);

  // Handle drop events within the footer with improved error handling
  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);
    if (!parentElement) return;

    // Check if the item being dropped is a footer
    if (item.type === 'footer') {
      // Check if a footer with this configuration already exists in the parent section
      const sectionElement = findElementById(parentElement.parentId, elements);
      const existingFooter = sectionElement?.children
        ?.map(childId => findElementById(childId, elements))
        ?.find(el => el?.type === 'footer' && el?.configuration === item.configuration);

      if (existingFooter) {
        // If a footer with this configuration exists, don't create a new one
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

  // Setup drag behavior with improved configuration handling
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
        const footerConfig = FooterConfigurations[item.configuration];
        if (footerConfig) {
          // Check if a footer with this configuration already exists in the current section
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingFooter = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'footer' && el?.configuration === item.configuration);

            if (!existingFooter) {
              // Only create a new footer if one doesn't exist in the section
              addNewElement('footer', 1, null, targetSectionId, {
                ...footerConfig,
                configuration: item.configuration,
                structure: item.configuration
              });
            }
          }
        }
        setSelectedElement({ id: item.id, type: 'footer', configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements]);

  // Find the current footer and its children with improved error handling
  const footer = findElementById(id, elements);
  const configChildren = FooterConfigurations[configuration]?.children || [];
  const resolvedChildren = (footer?.children || [])
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
    setSelectedElement({ id, type: 'footer', styles: footer?.styles });
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

  // Special handling for DeFi footer
  if (configuration === 'defiFooter') {
    return (
      <DeFiFooter
        handleSelect={handleSelect}
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    );
  }

  // Assign the correct footer component based on configuration
  let FooterComponent;
  if (configuration === 'customTemplateFooter') {
    FooterComponent = (
      <SimpleFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
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
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'templateFooter') {
    FooterComponent = (
      <TemplateFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  }

  // Render the draggable footer component
  if (isEditing) {
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
        {FooterComponent}
      </div>
    );
  }

  return FooterComponent;
};

export default DraggableFooter;
