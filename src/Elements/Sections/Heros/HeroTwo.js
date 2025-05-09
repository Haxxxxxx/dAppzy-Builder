import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop.js';
import { heroTwoStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { HeroConfiguration } from '../../../configs/heros/HeroConfigurations';

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const HeroTwo = forwardRef(({
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
    if (defaultInjectedRef.current) return;

    // First, ensure the hero has the default styles
    const mergedHeroStyles = merge({}, heroTwoStyles.heroSection, heroElement?.styles);
    updateStyles(heroElement.id, mergedHeroStyles);

    const contentContainer = findElementById(`${uniqueId}-content`, elements);

    if (!contentContainer) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-content`,
          type: 'div',
          styles: heroTwoStyles.heroLeftContent,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }

    const defaultContent = heroElement?.configuration ? 
      HeroConfiguration[heroElement.configuration].children : [];

    if (defaultContent.length > 0) {
      const currentContentContainer = findElementById(`${uniqueId}-content`, elements);

      const containerIsEmpty = 
        currentContentContainer && 
        currentContentContainer.children.length === 0;

      if (containerIsEmpty) {
        defaultContent.forEach((child) => {
          const newId = addNewElement(child.type, 1, null, `${uniqueId}-content`);
          setElements((prev) =>
            prev.map((el) =>
              el.id === newId ? { 
                ...el, 
                content: child.content,
                styles: merge(
                  child.type === 'heading' ? heroTwoStyles.heroTitle :
                  child.type === 'paragraph' ? heroTwoStyles.heroDescription :
                  child.type === 'button' ? heroTwoStyles.primaryButton :
                  {},
                  child.styles || {}
                )
              } : el
            )
          );
          setElements((prev) =>
            prev.map((el) =>
              el.id === `${uniqueId}-content`
                ? { ...el, children: [...el.children, newId] }
                : el
            )
          );
        });
        defaultInjectedRef.current = true;
      }
    }
  }, [children, heroElement, elements, findElementById, uniqueId, addNewElement, setElements, updateStyles]);

  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
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
    if (element) {
      setSelectedElement(element);
    } else {
      setSelectedElement({ id: divId, type: 'div', styles: {} });
    }
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

  // Get the content container element
  const contentContainer = findElementById(`${uniqueId}-content`, elements);

  // Merge styles for container
  const contentContainerStyles = merge({}, heroTwoStyles.heroLeftContent, {
    backgroundColor: 'transparent'
  }, contentContainer?.styles || {});

  // Merge styles for hero section
  const mergedHeroStyles = merge({}, heroTwoStyles.heroSection, heroElement?.styles || {});

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
        id={`${uniqueId}-content`}
        parentId={`${uniqueId}-content`}
        styles={contentContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
      >
        {renderContainerChildren(`${uniqueId}-content`)}
      </Div>
    </SectionWithRef>
  );
});

export default HeroTwo;
