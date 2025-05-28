import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import HeroOne from '../Sections/Heros/HeroOne';
import HeroTwo from '../Sections/Heros/HeroTwo';
import HeroThree from '../Sections/Heros/HeroThree';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { HeroConfiguration } from '../../configs/heros/HeroConfigurations.js';
import { heroTwoStyles } from '../Sections/Heros/defaultHeroStyles';
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
  const { addNewElement, setElements, elements, findElementById, setSelectedElement, generateUniqueId } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Set up drag-and-drop functionality with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'hero', 
      configuration,
      structure: configuration,
      children: HeroConfiguration[configuration]?.children || []
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const heroConfig = structureConfigurations[item.configuration];
        if (heroConfig) {
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            // Check for existing hero in a single pass
            const sectionElement = findElementById(targetSectionId, elements);
            const hasExistingHero = sectionElement?.children?.some(childId => {
              const child = findElementById(childId, elements);
              return child?.type === 'hero' && child?.configuration === item.configuration;
            });

            if (!hasExistingHero) {
              // Create hero with base styles
              const baseStyles = item.configuration === 'heroTwo'
                ? heroTwoStyles.heroSection
                : (heroConfig.styles || {});

              // Generate all IDs first
              const timestamp = Date.now();
              const newHeroId = `hero-${timestamp}-${Math.random().toString(36).substr(2, 4)}`;
              const leftContainerId = `${newHeroId}-left`;
              const rightContainerId = `${newHeroId}-right`;

              // Get configured children from HeroConfiguration
              const configuredChildren = HeroConfiguration[item.configuration]?.children || [];
              
              // Separate children into left and right containers
              const leftChildren = configuredChildren.filter(child => 
                child.type !== 'image' && child.type !== 'span'
              );
              const rightChildren = configuredChildren.filter(child => 
                child.type === 'image'
              );

              // Create all elements in a single batch
              const newElements = [];

              // Create left container children with proper configuration inheritance
              const leftChildIds = leftChildren.map(child => {
                const childId = `${leftContainerId}-${child.type}-${timestamp}-${Math.random().toString(36).substr(2, 4)}`;
                newElements.push({
                  id: childId,
                  type: child.type,
                  content: child.content || '',
                  styles: {
                    ...(child.styles || {}),
                    position: 'relative',
                    boxSizing: 'border-box'
                  },
                  parentId: leftContainerId,
                  isConfigured: true,
                  configuration: child.configuration || null,
                  structure: child.structure || null,
                  settings: child.settings || {},
                  label: child.label || ''
                });
                return childId;
              });

              // Create right container children with proper configuration inheritance
              const rightChildIds = rightChildren.map(child => {
                const childId = `${rightContainerId}-${child.type}-${timestamp}-${Math.random().toString(36).substr(2, 4)}`;
                newElements.push({
                  id: childId,
                  type: child.type,
                  content: child.content || '',
                  styles: {
                    ...(child.styles || {}),
                    position: 'relative',
                    boxSizing: 'border-box'
                  },
                  parentId: rightContainerId,
                  isConfigured: true,
                  configuration: child.configuration || null,
                  structure: child.structure || null,
                  settings: child.settings || {},
                  label: child.label || ''
                });
                return childId;
              });

              // Create the complete hero structure
              const heroStructure = [
                // Main hero element
                {
                  id: newHeroId,
                  type: 'hero',
                  configuration: item.configuration,
                  structure: item.configuration,
                  styles: { ...baseStyles },
                  isConfigured: true,
                  children: [leftContainerId, rightContainerId],
                  parentId: targetSectionId,
                  label: heroConfig.label || ''
                },
                // Left container
                {
                  id: leftContainerId,
                  type: 'div',
                  styles: {
                    ...(heroConfig.styles?.leftContainer || {}),
                    position: 'relative',
                    boxSizing: 'border-box'
                  },
                  children: leftChildIds,
                  parentId: newHeroId,
                  isConfigured: true,
                  configuration: null,
                  structure: null
                },
                // Right container
                {
                  id: rightContainerId,
                  type: 'div',
                  styles: {
                    ...(heroConfig.styles?.rightContainer || {}),
                    position: 'relative',
                    boxSizing: 'border-box'
                  },
                  children: rightChildIds,
                  parentId: newHeroId,
                  isConfigured: true,
                  configuration: null,
                  structure: null
                },
                // All child elements
                ...newElements
              ];

              // Update elements in a single batch
              setElements(prev => {
                // Remove any existing elements with the same IDs
                const filteredElements = prev.filter(el => 
                  !heroStructure.some(newEl => newEl.id === el.id)
                );

                // Update parent section's children
                const updatedElements = filteredElements.map(el => {
                  if (el.id === targetSectionId) {
                    return {
                      ...el,
                      children: [...el.children, newHeroId]
                    };
                  }
                  return el;
                });

                return [...updatedElements, ...heroStructure];
              });

              // Batch state updates
              requestAnimationFrame(() => {
                setSelectedElement({ 
                  id: newHeroId, 
                  type: 'hero', 
                  configuration: item.configuration 
                });
              });
            }
          }
        }
      }
    },
  }), [configuration, isEditing, elements, findElementById, addNewElement, setSelectedElement]);

  // Handle drop events within the hero section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentSection = findElementById(id, elements);
    if (!currentSection) {
      console.warn('Hero section not found');
      return;
    }

    if (item.type === 'heroSection') {
      console.warn('Cannot add a hero section inside another hero section');
      return;
    }

    // Check for duplicates in a single pass
    const hasDuplicate = currentSection.children?.some(childId => {
      const child = findElementById(childId, elements);
      return child?.type === item.type && 
             (item.type === 'heading' || item.type === 'subheading' || item.type === 'button') &&
             child?.content === item.content;
    });

    if (hasDuplicate) {
      console.warn(`A ${item.type} with this content already exists in the hero section`);
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

  // Memoize hero element and children with improved caching
  const heroElement = useMemo(() => findElementById(id, elements), [id, elements, findElementById]);
  
  const configChildren = useMemo(() => 
    structureConfigurations[configuration]?.children || [], 
    [configuration]
  );

  const resolvedChildren = useMemo(() => {
    if (!heroElement?.children?.length) return [];
    return heroElement.children
      .map(childId => findElementById(childId, elements))
      .filter(Boolean);
  }, [heroElement?.children, elements, findElementById]);

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