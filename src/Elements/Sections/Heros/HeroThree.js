import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop.js';
import { CustomTemplateHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div, Span } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';

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

  useEffect(() => {
    if (defaultInjectedRef.current || !heroElement) return;

    // First, ensure the hero has the default styles
    const mergedHeroStyles = merge({}, CustomTemplateHeroStyles.heroSection, heroElement?.styles);
    updateStyles(heroElement.id, mergedHeroStyles);

    const leftContainer = findElementById(`${uniqueId}-left`, elements);
    const rightContainer = findElementById(`${uniqueId}-right`, elements);
    const defaultContent = heroElement?.configuration ? 
      structureConfigurations[heroElement.configuration].children : [];

    // Create a batch of updates
    const updates = [];

    // Add containers if they don't exist
    if (!leftContainer) {
      updates.push({
          id: `${uniqueId}-left`,
          type: 'div',
          styles: CustomTemplateHeroStyles.heroContent,
          children: [],
          parentId: uniqueId,
      });
    }
    if (!rightContainer) {
      updates.push({
          id: `${uniqueId}-right`,
          type: 'div',
          styles: CustomTemplateHeroStyles.heroImageContainer,
          children: [],
          parentId: uniqueId,
      });
    }

    // Only inject content if we have default content and the containers are empty
    if (defaultContent.length > 0 && 
        (!leftContainer || leftContainer.children.length === 0) && 
        (!rightContainer || rightContainer.children.length === 0)) {
      
      const newChildren = defaultContent.map(child => {
        const newId = `${uniqueId}-${child.type}-${Math.random().toString(36).substr(2, 9)}`;
        const isImage = child.type === 'image';
        const parentId = isImage ? `${uniqueId}-right` : `${uniqueId}-left`;
        
        return {
          id: newId,
          type: child.type,
                  content: child.content,
                  styles: merge(
                    child.type === 'span' ? CustomTemplateHeroStyles.caption :
                    child.type === 'heading' ? CustomTemplateHeroStyles.heroTitle :
                    child.type === 'paragraph' ? CustomTemplateHeroStyles.heroDescription :
                    child.type === 'button' ? CustomTemplateHeroStyles.primaryButton :
            child.type === 'image' ? CustomTemplateHeroStyles.heroImage :
                    {},
                    child.styles || {}
          ),
          parentId
        };
      });

      // Add all new children to updates
      updates.push(...newChildren);

      // Update containers with their respective children
      const leftChildren = newChildren
        .filter(child => child.parentId === `${uniqueId}-left`)
        .map(child => child.id);
      const rightChildren = newChildren
        .filter(child => child.parentId === `${uniqueId}-right`)
        .map(child => child.id);

      if (leftContainer) {
        updates.push({
          ...leftContainer,
          children: leftChildren
        });
      } else {
        updates[0].children = leftChildren;
      }

      if (rightContainer) {
        updates.push({
          ...rightContainer,
          children: rightChildren
        });
      } else {
        updates[1].children = rightChildren;
      }
    }

    // Apply all updates in a single state change
    if (updates.length > 0) {
      setElements(prev => {
        const existingIds = new Set(prev.map(el => el.id));
        const newElements = updates.filter(el => !existingIds.has(el.id));
        return [...prev, ...newElements];
        });
        defaultInjectedRef.current = true;
      }
  }, [heroElement, elements, findElementById, uniqueId, updateStyles, setElements]);

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

  // Get the left and right container elements
  const leftContainer = findElementById(`${uniqueId}-left`, elements);
  const rightContainer = findElementById(`${uniqueId}-right`, elements);

  // Merge styles for containers
  const leftContainerStyles = merge({}, CustomTemplateHeroStyles.heroContent, {
    maxWidth: '40%',
    width: '40%'
  }, leftContainer?.styles || {});
  const rightContainerStyles = merge({}, CustomTemplateHeroStyles.heroImageContainer, {
    maxWidth: '40%',
    width: '40%'
  }, rightContainer?.styles || {});

  // Merge styles for hero section
  const mergedHeroStyles = merge({}, CustomTemplateHeroStyles.heroSection, heroElement?.styles || {});

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
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
        id={`${uniqueId}-left`}
        parentId={`${uniqueId}-left`}
        styles={leftContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-left`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-left`)}
      >
        {renderContainerChildren(`${uniqueId}-left`)}
      </Div>
      <Div
        id={`${uniqueId}-right`}
        parentId={`${uniqueId}-right`}
        styles={rightContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-right`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-right`)}
      >
        {renderContainerChildren(`${uniqueId}-right`)}
      </Div>
    </SectionWithRef>
  );
});

export default HeroThree;
