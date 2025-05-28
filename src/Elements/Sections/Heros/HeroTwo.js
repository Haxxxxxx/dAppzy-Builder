import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
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

    // First, ensure the hero has the default styles
    const mergedHeroStyles = merge({}, heroTwoStyles.heroSection, heroElement.styles);
    updateStyles(heroElement.id, mergedHeroStyles);

    // Check if content container already exists
    const contentContainer = findElementById(contentContainerId, elements);

    // Only create container if it doesn't exist
    if (!contentContainer) {
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
        isConfigured: true
      };
      setElements(prev => [...prev, contentContainer]);
    }

    // Get default content from configuration
    const defaultContent = HeroConfiguration.heroTwo.children;
    const contentElements = defaultContent.filter(child => 
      child.type !== 'span'
    );

    // Only create content if container is empty
    if (contentContainer && (!contentContainer.children || contentContainer.children.length === 0)) {
      const contentIds = contentElements.map(child => {
        const newId = addNewElement(child.type, 1, null, contentContainerId, {
          content: child.content,
          styles: merge(
            child.type === 'heading' ? heroTwoStyles.heroTitle :
            child.type === 'paragraph' ? heroTwoStyles.heroDescription :
            child.type === 'button' ? heroTwoStyles.primaryButton :
            child.type === 'image' ? heroTwoStyles.heroImage :
            {},
            child.styles || {}
          ),
          isConfigured: true,
          configuration: child.configuration || null,
          structure: child.structure || null
        });
        return newId;
      });

      // Update content container with content IDs
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
          isConfigured: true
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
