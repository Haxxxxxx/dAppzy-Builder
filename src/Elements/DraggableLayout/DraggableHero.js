import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import HeroOne from '../Sections/Heros/HeroOne';
import HeroTwo from '../Sections/Heros/HeroTwo';
import HeroThree from '../Sections/Heros/HeroThree';
import { structureConfigurations } from '../../configs/structureConfigurations.js';

/**
 * DraggableHero component for rendering and managing Hero sections.
 * Supports drag and drop functionality, modal interactions, and different hero configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the hero
 * @param {string} props.configuration - Hero configuration type
 * @param {boolean} props.isEditing - Whether the hero is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handlePanelToggle - Function to handle panel toggle
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the hero preview
 * @param {string} props.label - Label for the hero
 */
const DraggableHero = ({
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
      type: 'hero', 
      configuration,
      structure: configuration
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const heroConfig = structureConfigurations[item.configuration];
        if (heroConfig) {
          // Check if a hero with this configuration already exists in the current section
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingHero = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'hero' && el?.configuration === item.configuration);

            if (!existingHero) {
              // Only create a new hero if one doesn't exist in the section
              addNewElement('hero', 1, null, targetSectionId, {
                ...heroConfig,
                configuration: item.configuration,
                structure: item.configuration
              });
            }
          }
        }
        setSelectedElement({ id: item.id, type: 'hero', configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements]);

  // Handle dropping items inside this hero with improved error handling
  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);
    if (!parentElement) return;

    // Check if the item being dropped is a hero
    if (item.type === 'hero') {
      // Check if a hero with this configuration already exists in the parent section
      const sectionElement = findElementById(parentElement.parentId, elements);
      const existingHero = sectionElement?.children
        ?.map(childId => findElementById(childId, elements))
        ?.find(el => el?.type === 'hero' && el?.configuration === item.configuration);

      if (existingHero) {
        // If a hero with this configuration exists, don't create a new one
        return;
      }
    }

    // Special handling for heros with wrappers (example: content/image split)
    let newElement = {
      type: item.type,
      content: item.content || '',
      styles: item.styles || {},
      configuration: item.configuration,
      settings: item.settings || {}
    };

    // If the configuration requires wrappers, add them (example: main and side)
    if (item.configuration === 'defaultHero' || item.configuration === 'customHero') {
      newElement = {
        ...newElement,
        children: [
          {
            type: 'div',
            styles: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: '16px' },
            children: []
          },
          {
            type: 'div',
            styles: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 },
            children: []
          }
        ]
      };
    }

    const newId = addNewElement(item.type, 1, null, parentId, newElement);

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

  // Find the current hero and its children with improved error handling
  const heroElement = findElementById(id, elements);
  const configChildren = structureConfigurations[configuration]?.children || [];
  const resolvedChildren = (heroElement?.children || [])
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
    setSelectedElement({ id, type: 'hero', styles: heroElement?.styles });
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

  // Assign the correct hero component based on configuration
  let HeroComponent;
  if (configuration === 'heroOne') {
    HeroComponent = (
      <HeroOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'heroTwo') {
    HeroComponent = (
      <HeroTwo
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'heroThree') {
    HeroComponent = (
      <HeroThree
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

  // Render the draggable hero component
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
      {HeroComponent}
    </div>
  );
};

export default DraggableHero;
