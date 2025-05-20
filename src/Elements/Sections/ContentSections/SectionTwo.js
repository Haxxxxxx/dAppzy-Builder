import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { sectionTwoStyles } from './defaultSectionStyles';
import { Heading, Paragraph, Button, Image, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const SectionTwo = forwardRef(({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}, ref) => {
  const sectionRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  const sectionElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Initialize the section structure with containers
  useEffect(() => {
    if (!sectionElement || defaultInjectedRef.current) return;

    // Get configuration from structureConfigurations
    const config = structureConfigurations.sectionTwo || {};
    const configStyles = config.styles || {};

    // First, ensure the section has the default styles
    const mergedSectionStyles = merge({}, sectionTwoStyles.section, configStyles.section || {});
    updateStyles(sectionElement.id, mergedSectionStyles);

    const labelContainerId = `${uniqueId}-label`;
    const contentContainerId = `${uniqueId}-content`;
    const buttonsContainerId = `${uniqueId}-buttons`;
    const imageContainerId = `${uniqueId}-image`;
    const cardsContainerId = `${uniqueId}-cards`;

    // Create label container if it doesn't exist
    if (!findElementById(labelContainerId, elements)) {
      const labelContainer = {
        id: labelContainerId,
        type: 'div',
        styles: merge({}, 
      sectionTwoStyles.labelContainer,
          configStyles.label || {}
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, labelContainer]);

      // Add label content if it exists
      const labelElement = config.children?.find(child => child.type === 'span');
      if (labelElement) {
        const labelId = addNewElement('span', 1, null, labelContainerId);
        setElements(prev => prev.map(el => {
          if (el.id === labelId) {
            return {
              ...el,
              content: labelElement.content,
              styles: merge({}, sectionTwoStyles.label, labelElement.styles || {})
            };
          }
          return el;
        }));
        setElements(prev => prev.map(el => {
          if (el.id === labelContainerId) {
            return {
              ...el,
              children: [labelId]
            };
          }
          return el;
        }));
      }
    }

    // Create content container if it doesn't exist
    if (!findElementById(contentContainerId, elements)) {
      const contentContainer = {
        id: contentContainerId,
        type: 'div',
        styles: merge({}, 
      sectionTwoStyles.contentWrapper,
          configStyles.content || {}
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, contentContainer]);

      // Add default content to content container from configuration
      const defaultContent = config.children || [];

      // Filter content elements (heading and paragraph)
      const contentElements = defaultContent.filter(child => 
        ['heading', 'paragraph'].includes(child.type)
      );

      // Create all content elements first
      const contentIds = contentElements.map(child => {
        const newId = addNewElement(child.type, 1, null, contentContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            return {
              ...el,
              content: child.content,
              styles: merge(
                child.type === 'heading' ? sectionTwoStyles.heading :
                child.type === 'paragraph' ? sectionTwoStyles.paragraph :
                {},
                child.styles || {}
              )
            };
          }
          return el;
        }));
        return newId;
      });

      // Update content container with all content IDs
      setElements(prev => prev.map(el => {
        if (el.id === contentContainerId) {
          return {
            ...el,
            children: contentIds
          };
        }
        return el;
      }));
    }

    // Create buttons container if it doesn't exist
    if (!findElementById(buttonsContainerId, elements)) {
      const buttonsContainer = {
        id: buttonsContainerId,
        type: 'div',
        styles: merge({}, 
      sectionTwoStyles.buttonContainer,
          configStyles.buttons || {}
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, buttonsContainer]);

      // Add default buttons from configuration
      const defaultContent = config.children || [];

      // Filter button elements
      const buttonElements = defaultContent.filter(child => 
        child.type === 'button'
      );

      // Create all button elements
      const buttonIds = buttonElements.map(child => {
        const newId = addNewElement('button', 1, null, buttonsContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            const buttonStyle = child.content === 'Primary Action' ? 
              sectionTwoStyles.primaryButton : 
              sectionTwoStyles.secondaryButton;
            return {
              ...el,
              content: child.content,
              styles: merge(
                buttonStyle || {},
                child.styles || {}
              )
            };
          }
          return el;
        }));
        return newId;
      });

      // Update buttons container with all button IDs
      setElements(prev => prev.map(el => {
        if (el.id === buttonsContainerId) {
          return {
            ...el,
            children: buttonIds
          };
        }
        return el;
      }));
    }

    // Create image container if it doesn't exist
    if (!findElementById(imageContainerId, elements)) {
      const imageContainer = {
        id: imageContainerId,
        type: 'div',
        styles: merge({}, 
          sectionTwoStyles.imageContainer,
          configStyles.image || {}
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, imageContainer]);

      // Add default image from configuration
      const defaultContent = config.children || [];
      const imageElement = defaultContent.find(child => child.type === 'image');
      if (imageElement) {
        const imageId = addNewElement('image', 1, null, imageContainerId);
        // Update image element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === imageId) {
            return {
              ...el,
              content: imageElement.content,
              styles: merge({},
                sectionTwoStyles.image,
                configStyles.image?.img || {},
                imageElement.styles || {}
              )
            };
          }
          return el;
        }));
        // Update image container with image ID
        setElements(prev => prev.map(el => {
          if (el.id === imageContainerId) {
            return {
              ...el,
              children: [imageId]
            };
          }
          return el;
        }));
      }
    }

    // Create cards container if it doesn't exist
    if (!findElementById(cardsContainerId, elements)) {
      const cardsContainer = {
        id: cardsContainerId,
        type: 'gridLayout',
        styles: merge({}, 
          configStyles.cardsContainer || {},
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, cardsContainer]);

      // Find the grid layout element in the configuration
      const gridElement = config.children?.find(child => child.type === 'gridLayout');
      if (gridElement) {
        // Create card elements
        const cardIds = gridElement.children?.map(cardConfig => {
          const cardId = addNewElement('div', 1, null, cardsContainerId);
          
          // Set card styles
          setElements(prev => prev.map(el => {
            if (el.id === cardId) {
              return {
                ...el,
                styles: merge({}, 
                  configStyles.card || {},
                  cardConfig.styles || {},
                )
              };
            }
            return el;
          }));

          // Create heading and paragraph for each card
          const cardElements = cardConfig.children?.map(cardElement => {
            const elementId = addNewElement(cardElement.type, 1, null, cardId);
            setElements(prev => prev.map(el => {
              if (el.id === elementId) {
                return {
                  ...el,
                  content: cardElement.content,
                  styles: merge(
                    cardElement.type === 'heading' ? configStyles.cardHeading :
                    cardElement.type === 'paragraph' ? configStyles.cardParagraph :
                    {},
                    cardElement.styles || {}
                  )
                };
              }
              return el;
            }));
            return elementId;
          });

          // Update card with its children
          setElements(prev => prev.map(el => {
            if (el.id === cardId) {
              return {
                ...el,
                children: cardElements
              };
            }
            return el;
          }));

          return cardId;
        });

        // Update cards container with card IDs
        setElements(prev => prev.map(el => {
          if (el.id === cardsContainerId) {
            return {
              ...el,
              children: cardIds
            };
          }
          return el;
        }));
      }
    }

    // Update section's children to include all containers
    setElements(prev => prev.map(el => {
      if (el.id === uniqueId) {
        return {
          ...el,
          children: [labelContainerId, contentContainerId, buttonsContainerId, imageContainerId, cardsContainerId],
          configuration: 'sectionTwo'
        };
      }
      return el;
    }));

    defaultInjectedRef.current = true;
  }, [sectionElement, uniqueId, elements, findElementById, setElements, addNewElement, updateStyles]);

  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
    // Simple drop handler that just adds the element
    addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: (item) => handleSectionDrop(item, uniqueId),
  });

  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };

  const {
    activeDrop,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  } = useReorderDrop(findElementById, elements, setElements);

  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    return container.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      // Get configuration from structureConfigurations
      const config = structureConfigurations.sectionTwo || {};
      const configStyles = config.styles || {};

      // For image elements, ensure proper style merging
      if (child.type === 'image') {
        const imageStyles = merge({},
          sectionTwoStyles.image,
          configStyles.image?.img || {},
          child.styles || {}
        );

        return renderElement(
          {
            ...child,
            styles: imageStyles
          },
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            undefined,
            handleOpenMediaPanel
          );
      }

      return renderElement(
        child,
        elements,
        null,
        setSelectedElement,
        setElements,
        null,
        undefined,
        handleOpenMediaPanel
      );
    });
  };

  // Get container elements
  const labelContainer = findElementById(`${uniqueId}-label`, elements);
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
  const imageContainer = findElementById(`${uniqueId}-image`, elements);
  const cardsContainer = findElementById(`${uniqueId}-cards`, elements);

  // Get configuration from structureConfigurations
  const config = structureConfigurations.sectionTwo || {};
  const configStyles = config.styles || {};

  // Merge styles for containers
  const labelStyles = merge({}, 
    sectionTwoStyles.labelContainer,
    configStyles.label || {},
    labelContainer?.styles || {}
  );

  const contentStyles = merge({}, 
    sectionTwoStyles.contentWrapper,
    configStyles.content || {},
    contentContainer?.styles || {}
  );

  const buttonsStyles = merge({}, 
    sectionTwoStyles.buttonContainer,
    configStyles.buttons || {},
    buttonsContainer?.styles || {}
  );


  const cardsStyles = merge({}, 
    
    configStyles.cards || {},
    cardsContainer?.styles || {}
  );

  // Merge styles for section
  const mergedSectionStyles = merge({}, 
    sectionTwoStyles.section,
    configStyles.section || {},
    sectionElement?.styles || {}
  );

  // Get wrapper styles from configuration
  const wrapperStyles = merge({},
    configStyles.wrapper || {}
  );

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedSectionStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
      }}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
    >
      <div style={wrapperStyles}>
        {labelContainer && (
          <Div
            id={`${uniqueId}-label`}
            parentId={`${uniqueId}-label`}
            styles={labelStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-label`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-label`)}
          >
            {renderContainerChildren(`${uniqueId}-label`)}
          </Div>
        )}
        {contentContainer && (
          <Div
            id={`${uniqueId}-content`}
            parentId={`${uniqueId}-content`}
            styles={contentStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
          >
            {renderContainerChildren(`${uniqueId}-content`)}
          </Div>
        )}
        {buttonsContainer && (
          <Div
            id={`${uniqueId}-buttons`}
            parentId={`${uniqueId}-buttons`}
            styles={buttonsStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
          >
            {renderContainerChildren(`${uniqueId}-buttons`)}
          </Div>
        )}
        
        {cardsContainer && (
          <Div
            id={`${uniqueId}-cards`}
            parentId={`${uniqueId}-cards`}
            styles={cardsStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-cards`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-cards`)}
          >
            {renderContainerChildren(`${uniqueId}-cards`)}
          </Div>
        )}
      </div>
    </SectionWithRef>
  );
});

export default SectionTwo;
