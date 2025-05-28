import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { defaultHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { HeroConfiguration } from '../../../configs/heros/HeroConfigurations';

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const HeroOne = forwardRef(({
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

  // Initialize the hero structure with left and right containers
  useEffect(() => {
    if (!heroElement || defaultInjectedRef.current) return;

    // First, ensure the hero has the default styles
    const mergedHeroStyles = merge({}, defaultHeroStyles.heroSection, heroElement.styles);
    updateStyles(heroElement.id, mergedHeroStyles);

    const leftContainerId = `${uniqueId}-left`;
    const rightContainerId = `${uniqueId}-right`;

    // Check if containers already exist
    const leftContainer = findElementById(leftContainerId, elements);
    const rightContainer = findElementById(rightContainerId, elements);

    // Only create containers if they don't exist
    if (!leftContainer) {
      const leftContainer = {
        id: leftContainerId,
        type: 'div',
        styles: defaultHeroStyles.heroLeftContent,
        children: [],
        parentId: uniqueId,
        isConfigured: true
      };
      setElements(prev => [...prev, leftContainer]);
    }

    if (!rightContainer) {
      const rightContainer = {
        id: rightContainerId,
        type: 'div',
        styles: defaultHeroStyles.heroRightContent,
        children: [],
        parentId: uniqueId,
        isConfigured: true
      };
      setElements(prev => [...prev, rightContainer]);
    }

    // Get default content from configuration
    const defaultContent = HeroConfiguration.heroOne.children;
    const contentElements = defaultContent.filter(child => 
      child.type !== 'image' && child.type !== 'span'
    );
    const imageContent = defaultContent.find(child => child.type === 'image');

    // Only create content if containers are empty
    if (leftContainer && (!leftContainer.children || leftContainer.children.length === 0)) {
      const contentIds = contentElements.map(child => {
        const newId = addNewElement(child.type, 1, null, leftContainerId, {
          content: child.content,
          styles: merge(
            child.type === 'heading' ? defaultHeroStyles.heroTitle :
            child.type === 'paragraph' ? defaultHeroStyles.heroDescription :
            child.type === 'button' ? defaultHeroStyles.primaryButton :
            {},
            child.styles || {}
          ),
          isConfigured: true,
          configuration: child.configuration || null,
          structure: child.structure || null
        });
        return newId;
      });

      // Update left container with content IDs
      setElements(prev => prev.map(el => {
        if (el.id === leftContainerId) {
          return {
            ...el,
            children: contentIds
          };
        }
        return el;
      }));
    }

    if (rightContainer && (!rightContainer.children || rightContainer.children.length === 0) && imageContent) {
      const imageId = addNewElement('image', 1, null, rightContainerId, {
        content: imageContent.content,
        styles: merge(defaultHeroStyles.heroImage, imageContent.styles || {}),
        isConfigured: true,
        configuration: imageContent.configuration || null,
        structure: imageContent.structure || null
      });

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

    // Update hero's children to only include the containers
    setElements(prev => prev.map(el => {
      if (el.id === uniqueId) {
        return {
          ...el,
          children: [leftContainerId, rightContainerId],
          configuration: 'heroOne',
          isConfigured: true
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

  const leftContainerId = `${uniqueId}-left`;
  const rightContainerId = `${uniqueId}-right`;

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

  // Get the left and right container elements
  const leftContainer = findElementById(leftContainerId, elements);
  const rightContainer = findElementById(rightContainerId, elements);

  // Merge styles for containers
  const leftContainerStyles = merge({}, defaultHeroStyles.heroLeftContent, leftContainer?.styles || {});
  const rightContainerStyles = merge({}, defaultHeroStyles.heroRightContent, rightContainer?.styles || {});

  // Merge styles for hero section
  const mergedHeroStyles = merge({}, defaultHeroStyles.heroSection, heroElement?.styles || {});

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
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

export default HeroOne;
