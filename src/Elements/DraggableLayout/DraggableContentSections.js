import React, { useContext, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SectionOne from '../Sections/ContentSections/SectionOne';
import SectionTwo from '../Sections/ContentSections/SectionTwo';
import SectionThree from '../Sections/ContentSections/SectionThree';
import SectionFour from '../Sections/ContentSections/SectionFour';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { mergeStyles } from '../../utils/htmlRenderUtils/containerHelpers';
import { defaultSectionStyles } from '../Sections/ContentSections/defaultSectionStyles';
import { PLACEHOLDER_IMAGES } from '../../configs/assetUrls';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import { CONTENT_SECTION, DIV, HEADING, PARAGRAPH, BUTTON, IMAGE, SECTION } from '../../constants/elementTypes';
import { hasDuplicateElement, DROP_REJECTION_REASONS } from '../../utils/dndUtils';
import { useToast } from '../../context/ToastContext';

/**
 * DraggableContentSections component for rendering and managing content sections.
 * Supports drag and drop functionality and different section configurations.
 */

// Generic renderer for section configs that don't have a dedicated component
// (sectionFive, sectionSix, sectionSeven, sectionEight, etc.)
const GenericSectionRenderer = ({
  uniqueId,
  handleSelect,
  handleOpenMediaPanel,
  sectionElement,
  elements,
  findElementById,
  setSelectedElement,
  setElements,
}) => {
  if (!sectionElement || !sectionElement.children) return null;

  const renderChildTree = (childId) => {
    const child = findElementById(childId, elements);
    if (!child) return null;

    // If this child has its own children (container), render them recursively
    if (child.children && child.children.length > 0) {
      return (
        <div
          key={childId}
          id={childId}
          style={child.styles || {}}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement({ id: child.id, type: child.type || DIV, styles: child.styles || {}, ...child });
          }}
        >
          {child.children.map(nestedId => renderChildTree(nestedId))}
        </div>
      );
    }

    // Leaf element — use renderElement
    return renderElement(
      child,
      elements,
      null,
      setSelectedElement,
      setElements,
      null,
      undefined,
      null,
      false,
      handleOpenMediaPanel
    );
  };

  const sectionStyles = sectionElement.styles || {};

  return (
    <div
      id={uniqueId}
      style={{
        ...sectionStyles,
        width: '100%',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {sectionElement.children.map(childId => renderChildTree(childId))}
    </div>
  );
};

const DraggableContentSections = ({
  id,
  configuration,
  isEditing,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
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
  const { showToast } = useToast();

  const defaultInjectedRef = useRef(false);

  // Initialize the Content Section structure with containers
  // Only inject default structure for sectionOne — other sections handle their own structure
  // via ContentList.js handleDrop or their dedicated section components
  useEffect(() => {
    if (!id || defaultInjectedRef.current) return;
    if (configuration !== 'sectionOne') {
      defaultInjectedRef.current = true;
      return;
    }

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
        type: DIV,
        part: 'content',
        layout: 'content',
        styles: mergeStyles(defaultSectionStyles.contentWrapper, configStyles.content || {}),
        children: [
          {
            id: `${id}-heading-${generateUniqueId('heading')}`,
            type: HEADING,
            content: 'Bibendum amet at molestie mattis.',
            styles: mergeStyles(defaultSectionStyles.heading, configStyles.heading || {}),
            parentId: `${id}-content`,
            configuration: configuration
          },
          {
            id: `${id}-paragraph-${generateUniqueId('paragraph')}`,
            type: PARAGRAPH,
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
        type: DIV,
        part: 'buttons',
        layout: 'buttons',
        styles: mergeStyles(defaultSectionStyles.buttonContainer, configStyles.buttons || {}),
        children: [
          {
            id: `${id}-button-${generateUniqueId('button')}`,
            type: BUTTON,
            content: 'Primary Action',
            styles: mergeStyles(defaultSectionStyles.button, configStyles.button || {}),
            parentId: `${id}-buttons`,
            configuration: configuration
          },
          {
            id: `${id}-button-${generateUniqueId('button')}`,
            type: BUTTON,
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
        type: DIV,
        part: 'image',
        layout: 'image',
        styles: mergeStyles(defaultSectionStyles.imageContainer, configStyles.image || {}),
        children: [
          {
            id: `${id}-image-${generateUniqueId('image')}`,
            type: IMAGE,
            content: PLACEHOLDER_IMAGES.builder,
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

  // Setup drag behavior
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: {
      id,
      type: CONTENT_SECTION,
      configuration,
      structure: configuration,
      styles: structureConfigurations[configuration]?.styles || {},
      children: structureConfigurations[configuration]?.children || [],
      label: structureConfigurations[configuration]?.label || '',
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
            ?.find(el => el?.type === SECTION && el?.configuration === item.configuration);

          if (!existingSection) {
            // Generate unique ID for the section
            const newSectionId = generateUniqueId('section');
            
            // Get configuration styles
            const config = structureConfigurations[item.configuration] || {};
            const configStyles = config.styles || {};

            // Create the new section with standardized configuration
            const newSection = {
              id: newSectionId,
              type: SECTION,
              configuration: item.configuration,
              structure: item.configuration,
              styles: mergeStyles(defaultSectionStyles.section, configStyles.section || {}),
              children: [],
              label: config.label || '',
              settings: {}
            };

            // Create default containers with their content
            const containers = [
              {
                id: `${newSectionId}-content`,
                type: DIV,
                part: 'content',
                layout: 'content',
                styles: mergeStyles(defaultSectionStyles.contentWrapper, configStyles.content || {}),
                children: [
                  {
                    id: `${newSectionId}-heading-${generateUniqueId('heading')}`,
                    type: HEADING,
                    content: 'Bibendum amet at molestie mattis.',
                    styles: mergeStyles(defaultSectionStyles.heading, configStyles.heading || {}),
                    parentId: `${newSectionId}-content`,
                    configuration: item.configuration
                  },
                  {
                    id: `${newSectionId}-paragraph-${generateUniqueId('paragraph')}`,
                    type: PARAGRAPH,
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
                type: DIV,
                part: 'buttons',
                layout: 'buttons',
                styles: mergeStyles(defaultSectionStyles.buttonContainer, configStyles.buttons || {}),
                children: [
                  {
                    id: `${newSectionId}-button-${generateUniqueId('button')}`,
                    type: BUTTON,
                    content: 'Primary Action',
                    styles: mergeStyles(defaultSectionStyles.button, configStyles.button || {}),
                    parentId: `${newSectionId}-buttons`,
                    configuration: item.configuration
                  },
                  {
                    id: `${newSectionId}-button-${generateUniqueId('button')}`,
                    type: BUTTON,
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
                type: DIV,
                part: 'image',
                layout: 'image',
                styles: mergeStyles(defaultSectionStyles.imageContainer, configStyles.image || {}),
                children: [
                  {
                    id: `${newSectionId}-image-${generateUniqueId('image')}`,
                    type: IMAGE,
                    content: PLACEHOLDER_IMAGES.builder,
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

            setSelectedElement({ id: newSectionId, type: SECTION, configuration: item.configuration });
          }
        }
      }
    },
  }), [configuration, isEditing, elements]);

  // Handle drop events within the content section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    // Get the current content section element
    const currentSection = findElementById(id, elements);
    if (!currentSection) {
      return;
    }

    // Check if we're trying to add a content section inside another content section
    if (item.type === CONTENT_SECTION) {
      showToast(DROP_REJECTION_REASONS.SELF_DROP, 'info');
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
      showToast(DROP_REJECTION_REASONS.INVALID_TYPE, 'info');
      return;
    }

    // Find the container
    const container = currentSection.children
      ?.map(childId => findElementById(childId, elements))
      ?.find(el => el?.part === containerType);

    if (!container) {
      return;
    }

    // Check for duplicate elements within the container
    const existingElements = container.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    if (hasDuplicateElement(existingElements, item)) {
      showToast(DROP_REJECTION_REASONS.DUPLICATE, 'info');
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

  // Component map for configuration → React component
  const SECTION_COMPONENTS = {
    sectionOne: SectionOne,
    sectionTwo: SectionTwo,
    sectionThree: SectionThree,
    sectionFour: SectionFour,
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    const element = findElementById(id, elements);
    setSelectedElement(element || { id, type: SECTION, styles: {} });
  };

  const sharedProps = {
    handleSelect,
    uniqueId: id,
    onDropItem,
    handleOpenMediaPanel,
  };

  const SectionComponent = SECTION_COMPONENTS[configuration];

  if (SectionComponent) {
    return <SectionComponent {...sharedProps} />;
  }

  // Generic section rendering for sectionFive–sectionEight
  return (
    <GenericSectionRenderer
      {...sharedProps}
      sectionElement={sectionElement}
      elements={elements}
      findElementById={findElementById}
      setSelectedElement={setSelectedElement}
      setElements={setElements}
    />
  );
};

export default DraggableContentSections;
