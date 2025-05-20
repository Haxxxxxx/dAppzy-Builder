import React, { useContext, useMemo, useRef, useEffect, forwardRef, useCallback } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { heroTwoStyles } from './defaultHeroStyles';
import { Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { HeroConfiguration } from '../../../configs/heros/HeroConfigurations';

const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const HeroTwo = forwardRef(({
  handleSelect,
  uniqueId,
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
    addNewElement,
    updateStyles,
  } = useContext(EditableContext);

  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  const contentContainerId = `${uniqueId}-content`;

  useEffect(() => {
    if (!heroElement || defaultInjectedRef.current) return;

    // Always ensure the hero has the correct base styles
    const mergedHeroStyles = {
      ...heroTwoStyles.heroSection,
      ...heroElement.styles
    };
    if (typeof updateStyles === 'function') {
      updateStyles(heroElement.id, mergedHeroStyles);
    }

    // Create content container if it doesn't exist
    if (!findElementById(contentContainerId, elements)) {
      const contentContainer = {
        id: contentContainerId,
        type: 'div',
        styles: {
          ...heroTwoStyles.heroContent,
          position: 'relative',
          boxSizing: 'border-box'
        },
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, contentContainer]);

      // Add default content to content container from configuration
      const defaultContent = HeroConfiguration.heroTwo.children;
      const contentIds = defaultContent.map(child => {
        const newId = addNewElement(child.type, 1, null, contentContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            const childStyles = {
              ...(child.type === 'heading' ? heroTwoStyles.heroTitle :
                  child.type === 'paragraph' ? heroTwoStyles.heroDescription :
                  child.type === 'button' ? heroTwoStyles.primaryButton :
                  {}),
              ...child.styles,
              position: 'relative',
              boxSizing: 'border-box'
            };
            return {
              ...el,
              content: child.content,
              styles: childStyles
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

    // Update hero's children to only include the content container
    setElements(prev => prev.map(el => {
      if (el.id === uniqueId) {
        return {
          ...el,
          children: [contentContainerId],
          configuration: 'heroTwo',
          structure: 'heroTwo',
        };
      }
      return el;
    }));

    defaultInjectedRef.current = true;
  }, [heroElement, uniqueId, elements, findElementById, setElements, addNewElement, updateStyles]);

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
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };

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
  const contentContainer = findElementById(contentContainerId, elements);
  const contentContainerStyles = {
    ...heroTwoStyles.heroContent,
    ...contentContainer?.styles,
    position: 'relative',
    boxSizing: 'border-box'
  };

  // Merge styles for hero section
  const mergedHeroStyles = {
    ...heroTwoStyles.heroSection,
    ...heroElement?.styles,
    position: 'relative',
    boxSizing: 'border-box'
  };

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#6B7280',
        color: '#fff',
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
        id={contentContainerId}
        parentId={contentContainerId}
        styles={contentContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, contentContainerId)}
        onClick={(e) => handleInnerDivClick(e, contentContainerId)}
      >
        {renderContainerChildren(contentContainerId)}
      </Div>
    </SectionWithRef>
  );
});

export default HeroTwo;
