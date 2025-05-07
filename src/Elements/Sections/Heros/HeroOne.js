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

const HeroOne = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
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

    // Create left container if it doesn't exist
    if (!findElementById(leftContainerId, elements)) {
      const leftContainer = {
        id: leftContainerId,
        type: 'div',
        styles: defaultHeroStyles.heroLeftContent,
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, leftContainer]);

      // Add default content to left container from configuration
      const defaultContent = HeroConfiguration.heroOne.children;
      const contentElements = defaultContent.filter(child => 
        child.type !== 'image' && child.type !== 'span'
      );

      // Create all content elements first
      const contentIds = contentElements.map(child => {
        const newId = addNewElement(child.type, 1, null, leftContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            return {
              ...el,
              content: child.content,
              styles: child.type === 'heading' ? defaultHeroStyles.heroTitle :
                     child.type === 'paragraph' ? defaultHeroStyles.heroDescription :
                     child.type === 'button' ? defaultHeroStyles.primaryButton :
                     {}
            };
          }
          return el;
        }));
        return newId;
      });

      // Update left container with all content IDs
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

    // Create right container if it doesn't exist
    if (!findElementById(rightContainerId, elements)) {
      const rightContainer = {
        id: rightContainerId,
        type: 'div',
        styles: defaultHeroStyles.heroRightContent,
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, rightContainer]);

      // Add default image to right container from configuration
      const imageContent = HeroConfiguration.heroOne.children.find(child => child.type === 'image');
      if (imageContent) {
        const imageId = addNewElement('image', 1, null, rightContainerId);
        // Update image element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === imageId) {
            return {
              ...el,
              content: imageContent.content,
              styles: defaultHeroStyles.heroImage
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
          children: [leftContainerId, rightContainerId]
        };
      }
      return el;
    }));

    defaultInjectedRef.current = true;
  }, [heroElement, uniqueId, elements, findElementById, setElements, addNewElement, updateStyles]);

  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
    if (droppedItem.id) {
      return;
    }

    const newId = addNewElement(
      droppedItem.type,
      droppedItem.level || 1,
      null,
      parentId
    );
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId
          ? { ...el, children: [...el.children, newId] }
          : el
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

  // Filter out any direct children that are already in containers
  const containerIds = [leftContainerId, rightContainerId];
  const filteredChildren = heroElement?.children?.filter(childId => !containerIds.includes(childId)) || [];

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
      }}
    >
      <div
        style={leftContainerStyles}
        onClick={(e) => handleInnerDivClick(e, leftContainerId)}
      >
        {renderContainerChildren(leftContainerId)}
      </div>
      <div
        style={rightContainerStyles}
        onClick={(e) => handleInnerDivClick(e, rightContainerId)}
      >
        {renderContainerChildren(rightContainerId)}
      </div>
      {filteredChildren.map(childId => {
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
      })}
    </SectionWithRef>
  );
};

export default HeroOne;
