import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { CustomTemplateHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { HeroConfiguration } from '../../../configs/heros/HeroConfigurations';

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const HeroThree = forwardRef(({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}, ref) => {
  const heroRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  const leftContainerId = `${uniqueId}-left`;
  const rightContainerId = `${uniqueId}-right`;
  const buttonContainerId = `${uniqueId}-button-container`;

  useEffect(() => {
    if (!heroElement || defaultInjectedRef.current) return;

    // First, ensure the hero has the default styles
    const mergedHeroStyles = merge({}, CustomTemplateHeroStyles.heroSection, heroElement.styles);
    updateStyles(heroElement.id, mergedHeroStyles);

    // Create left container if it doesn't exist
    if (!findElementById(leftContainerId, elements)) {
      const leftContainer = {
        id: leftContainerId,
          type: 'div',
          styles: CustomTemplateHeroStyles.heroContent,
          children: [],
          parentId: uniqueId,
      };
      setElements(prev => [...prev, leftContainer]);

      // Create button container
      const buttonContainer = {
        id: buttonContainerId,
          type: 'div',
        styles: {
          ...CustomTemplateHeroStyles.buttonContainer,
          display: 'flex',
          gap: '1rem',
          marginTop: '2rem'
        },
          children: [],
        parentId: leftContainerId,
      };
      setElements(prev => [...prev, buttonContainer]);

      // Add default content to left container from configuration
      const defaultContent = HeroConfiguration.heroThree.children;
      const contentElements = defaultContent.filter(child => 
        child.type !== 'image' && child.type !== 'span' && child.type !== 'button'
      );
      const buttonElements = defaultContent.filter(child => child.type === 'button');

      // Create all content elements first
      const contentIds = contentElements.map(child => {
        const newId = addNewElement(child.type, 1, null, leftContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
        return {
              ...el,
                  content: child.content,
                  styles: merge(
                    child.type === 'heading' ? CustomTemplateHeroStyles.heroTitle :
                    child.type === 'paragraph' ? CustomTemplateHeroStyles.heroDescription :
                    {},
                    child.styles || {}
              )
            };
          }
          return el;
        }));
        return newId;
      });

      // Create all button elements
      const buttonIds = buttonElements.map(child => {
        const newId = addNewElement(child.type, 1, null, buttonContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            return {
              ...el,
              content: child.content,
              styles: merge(
                child.settings?.isPrimary ? 
                  CustomTemplateHeroStyles.primaryButton : 
                  CustomTemplateHeroStyles.secondaryButton,
                child.styles || {}
              ),
              settings: child.settings
            };
          }
          return el;
        }));
        return newId;
      });

      // Update button container with all button IDs
      setElements(prev => prev.map(el => {
        if (el.id === buttonContainerId) {
          return {
            ...el,
            children: buttonIds
          };
        }
        return el;
      }));

      // Update left container with all content and button container IDs
      setElements(prev => prev.map(el => {
        if (el.id === leftContainerId) {
          return {
            ...el,
            children: [...contentIds, buttonContainerId]
          };
        }
        return el;
      }));
    }

    // Create right container if it doesn't exist
    if (!findElementById(rightContainerId, elements)) {
      const rightContainer = {
        id: rightContainerId,
        type: 'div',
        styles: CustomTemplateHeroStyles.heroImageContainer,
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, rightContainer]);

      // Add default image to right container from configuration
      const imageContent = HeroConfiguration.heroThree.children.find(child => child.type === 'image');
      if (imageContent) {
        const imageId = addNewElement('image', 1, null, rightContainerId);
        // Update image element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === imageId) {
            return {
              ...el,
              content: imageContent.content,
              styles: merge(CustomTemplateHeroStyles.heroImage, imageContent.styles || {})
            };
          }
          return el;
        }));
        // Update right container with image ID
        setElements(prev => prev.map(el => {
          if (el.id === rightContainerId) {
            return {
              ...el,
              children: [imageId]
            };
          }
          return el;
        }));
      }
    }

    // Update hero's children to only include the containers
    setElements(prev => prev.map(el => {
      if (el.id === uniqueId) {
        return {
          ...el,
          children: [leftContainerId, rightContainerId],
          configuration: 'heroThree',
          structure: 'heroThree'
        };
      }
      return el;
    }));

        defaultInjectedRef.current = true;
  }, [heroElement, uniqueId, elements, findElementById, setElements, addNewElement, updateStyles]);

  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
    // Simple drop handler that just adds the element
    addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem: (item) => handleHeroDrop(item, uniqueId),
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
    draggedId,
  } = useReorderDrop(findElementById, elements, setElements);

  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    return container.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;
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

  // Get the container elements
  const leftContainer = findElementById(leftContainerId, elements);
  const rightContainer = findElementById(rightContainerId, elements);

  // Merge styles for containers
  const leftContainerStyles = merge({}, CustomTemplateHeroStyles.heroContent, leftContainer?.styles || {});
  const rightContainerStyles = merge({}, CustomTemplateHeroStyles.heroImageContainer, rightContainer?.styles || {});

  // Merge styles for hero section
  const mergedHeroStyles = merge({}, CustomTemplateHeroStyles.heroSection, heroElement?.styles || {});

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {})
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
      }}
      ref={(node) => {
        heroRef.current = node;
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
      <Div
        id={leftContainerId}
        parentId={leftContainerId}
        styles={leftContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, leftContainerId)}
        onClick={(e) => handleInnerDivClick(e, leftContainerId)}
      >
        {renderContainerChildren(leftContainerId)}
      </Div>
      <Div
        id={rightContainerId}
        parentId={rightContainerId}
        styles={rightContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, rightContainerId)}
        onClick={(e) => handleInnerDivClick(e, rightContainerId)}
      >
        {renderContainerChildren(rightContainerId)}
      </Div>
    </SectionWithRef>
  );
});

export default HeroThree;