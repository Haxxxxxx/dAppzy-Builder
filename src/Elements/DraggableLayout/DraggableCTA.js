import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { CTA, BUTTON, HEADING, PARAGRAPH } from '../../constants/elementTypes';
import { hasDuplicateElement } from '../../utils/dndUtils';

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
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement, generateUniqueId } = useContext(EditableContext);

  // Set up drag-and-drop functionality with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: CTA,
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
              ?.find(el => el?.type === CTA && el?.configuration === item.configuration);

            if (!existingCTA) {
              // Only create a new CTA if one doesn't exist in the section
              addNewElement(CTA, 1, null, targetSectionId, {
                ...ctaConfig,
                configuration: item.configuration,
                structure: item.configuration
              });
            }
          }
        }
        setSelectedElement({ id: item.id, type: CTA, configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements]);

  // Handle drop events within the CTA section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    // Get the current CTA section element
    const currentSection = findElementById(id, elements);
    if (!currentSection) {
      return;
    }

    // Check if we're trying to add a CTA section inside another CTA section
    if (item.type === CTA) {
      return;
    }

    // Check for duplicate elements
    const existingElements = currentSection.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    // For specific elements, check for duplicates
    if (item.type === BUTTON || item.type === HEADING || item.type === PARAGRAPH) {
      if (hasDuplicateElement(existingElements, item)) {
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

  // Handle element selection
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: CTA, styles: ctaElement?.styles });
  };

  // Component map for configuration → React component
  const CTA_COMPONENTS = {
    ctaOne: CTAOne,
    ctaTwo: CTATwo,
    ctaThree: CTAOne, // same layout as ctaOne
  };

  const CTAComponent = CTA_COMPONENTS[configuration];
  if (!CTAComponent) return null;

  return (
    <CTAComponent
      uniqueId={id}
      contentListWidth={contentListWidth}
      children={childrenToRender}
      onDropItem={onDropItem}
      handlePanelToggle={handlePanelToggle}
      handleOpenMediaPanel={handleOpenMediaPanel}
      handleSelect={handleSelect}
    />
  );
};

export default DraggableCTA;
