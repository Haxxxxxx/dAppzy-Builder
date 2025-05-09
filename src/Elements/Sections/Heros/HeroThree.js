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
    // Only proceed if we haven't injected content yet
    if (defaultInjectedRef.current) return;

    // First, ensure the hero has the default styles
    const mergedHeroStyles = merge({}, CustomTemplateHeroStyles.heroSection, heroElement?.styles);
    updateStyles(heroElement.id, mergedHeroStyles);

    const leftContainer = findElementById(`${uniqueId}-left`, elements);
    const rightContainer = findElementById(`${uniqueId}-right`, elements);

    // Create containers if they don't exist
    if (!leftContainer) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-left`,
          type: 'div',
          styles: CustomTemplateHeroStyles.heroContent,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }
    if (!rightContainer) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-right`,
          type: 'div',
          styles: CustomTemplateHeroStyles.heroImageContainer,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }

    // Get the default content from the hero configuration
    const defaultContent = heroElement?.configuration ? 
      structureConfigurations[heroElement.configuration].children : [];

    // Only inject content if we have default content and the containers are empty
    if (defaultContent.length > 0) {
      const currentLeftContainer = findElementById(`${uniqueId}-left`, elements);
      const currentRightContainer = findElementById(`${uniqueId}-right`, elements);

      // Check if the containers are empty
      const containersAreEmpty = 
        currentLeftContainer && 
        currentRightContainer && 
        currentLeftContainer.children.length === 0 && 
        currentRightContainer.children.length === 0;

      if (containersAreEmpty) {
        defaultContent.forEach((child) => {
          if (child.type === 'image') {
            const newId = addNewElement(child.type, 1, null, `${uniqueId}-right`);
            setElements((prev) =>
              prev.map((el) =>
                el.id === newId ? { 
                  ...el, 
                  content: child.content,
                  styles: merge(CustomTemplateHeroStyles.heroImage, child.styles || {})
                } : el
              )
            );
            setElements((prev) =>
              prev.map((el) =>
                el.id === `${uniqueId}-right`
                  ? { ...el, children: [...el.children, newId] }
                  : el
              )
            );
          } else {
            const newId = addNewElement(child.type, 1, null, `${uniqueId}-left`);
            setElements((prev) =>
              prev.map((el) =>
                el.id === newId ? { 
                  ...el, 
                  content: child.content,
                  styles: merge(
                    child.type === 'span' ? CustomTemplateHeroStyles.caption :
                    child.type === 'heading' ? CustomTemplateHeroStyles.heroTitle :
                    child.type === 'paragraph' ? CustomTemplateHeroStyles.heroDescription :
                    child.type === 'button' ? CustomTemplateHeroStyles.primaryButton :
                    {},
                    child.styles || {}
                  )
                } : el
              )
            );
            setElements((prev) =>
              prev.map((el) =>
                el.id === `${uniqueId}-left`
                  ? { ...el, children: [...el.children, newId] }
                  : el
              )
            );
          }
        });
        defaultInjectedRef.current = true;
      }
    }
  }, [children, heroElement, elements, findElementById, uniqueId, addNewElement, setElements, updateStyles]);

  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
    const newId = addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId ? { ...el, children: [...el.children, newId] } : el
      )
    );
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

    let buttonCount = 0;
    let buttons = [];

    const childrenElements = container.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      const childContent =
        child.type === 'span' ? (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...CustomTemplateHeroStyles.caption, ...(child.styles || {}) }}
          />
        ) : child.type === 'heading' ? (
          <Heading
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...CustomTemplateHeroStyles.heroTitle, ...(child.styles || {}) }}
          />
        ) : child.type === 'paragraph' ? (
          <Paragraph
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...CustomTemplateHeroStyles.heroDescription, ...(child.styles || {}) }}
          />
        ) : child.type === 'button' ? (
          <Button
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...(buttonCount === 0
                ? CustomTemplateHeroStyles.primaryButton
                : CustomTemplateHeroStyles.secondaryButton),
              ...(child.styles || {}),
            }}
          />
        ) : child.type === 'image' ? (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{ ...CustomTemplateHeroStyles.heroImage, ...(child.styles || {}) }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={(item) => handleHeroDrop(item, child.id)}
          />
        ) : (
          renderElement(
            child,
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            undefined,
            handleOpenMediaPanel
          )
        );

      if (child.type === 'button') {
        buttonCount++;
      }

      return childContent;
    });

    return childrenElements;
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
