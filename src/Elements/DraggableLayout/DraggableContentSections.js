import React, { useContext, useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SectionOne from '../Sections/ContentSections/SectionOne';
import SectionTwo from '../Sections/ContentSections/SectionTwo';
import SectionThree from '../Sections/ContentSections/SectionThree';
import SectionFour from '../Sections/ContentSections/SectionFour';
import StructurePanel from '../../components/LeftbarPanels/StructurePanel';
import { structureConfigurations } from '../../configs/structureConfigurations.js';

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
  } = useContext(EditableContext);

  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Setup drag behavior with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'ContentSection', 
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
          // Check if a section with this configuration already exists in the current section
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingSection = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'ContentSection' && el?.configuration === item.configuration);

            if (!existingSection) {
              // Only create a new section if one doesn't exist in the section
              addNewElement('ContentSection', 1, null, targetSectionId, {
                ...sectionConfig,
                configuration: item.configuration,
                structure: item.configuration
              });
            }
          }
        }
        setSelectedElement({ id: item.id, type: 'ContentSection', configuration: item.configuration });
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
      // Check if a section with this configuration already exists in the parent section
      const sectionElement = findElementById(parentElement.parentId, elements);
      const existingSection = sectionElement?.children
        ?.map(childId => findElementById(childId, elements))
        ?.find(el => el?.type === 'ContentSection' && el?.configuration === item.configuration);

      if (existingSection) {
        // If a section with this configuration exists, don't create a new one
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

  // Find the current section and its children with improved error handling
  const sectionElement = findElementById(id, elements);
  const configChildren = structureConfigurations[configuration]?.children || [];
  const resolvedChildren = (sectionElement?.children || [])
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
    setSelectedElement({ id, type: 'ContentSection', styles: sectionElement?.styles });
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

  // Assign the correct section component based on configuration
  let SectionComponent;
  if (configuration === 'sectionOne') {
    SectionComponent = (
      <SectionOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'sectionTwo') {
    SectionComponent = (
      <SectionTwo
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'sectionThree') {
    SectionComponent = (
      <SectionThree
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'sectionFour') {
    SectionComponent = (
      <SectionFour
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

  // Render the draggable section component
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
        {SectionComponent}
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
