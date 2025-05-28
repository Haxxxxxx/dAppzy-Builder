// src/Sections/ContentSections/SectionOne.jsx
import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { defaultSectionStyles } from './defaultSectionStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { mergeStyles } from '../../../utils/htmlRenderUtils/containerHelpers';

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const SectionOne = forwardRef(({
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

  useEffect(() => {
    if (defaultInjectedRef.current || !sectionElement) return;

    // First, ensure the section has the default styles
    const mergedSectionStyles = mergeStyles(defaultSectionStyles.section, sectionElement?.styles);
    updateStyles(sectionElement.id, mergedSectionStyles);

    const contentContainer = findElementById(`${uniqueId}-content`, elements);
    const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
    const imageContainer = findElementById(`${uniqueId}-image`, elements);
    const defaultContent = sectionElement?.configuration ? 
      structureConfigurations[sectionElement.configuration].children : [];

    // Create a batch of updates
    const updates = [];
    const existingIds = new Set(elements.map(el => el.id));

    // Add containers if they don't exist
    if (!contentContainer && !existingIds.has(`${uniqueId}-content`)) {
      updates.push({
        id: `${uniqueId}-content`,
        type: 'div',
        styles: defaultSectionStyles.contentWrapper,
        children: [],
        parentId: uniqueId,
        part: 'content',
        layout: 'content',
        configuration: 'sectionOne'
      });
    }
    if (!buttonsContainer && !existingIds.has(`${uniqueId}-buttons`)) {
      updates.push({
        id: `${uniqueId}-buttons`,
        type: 'div',
        styles: defaultSectionStyles.buttonContainer,
        children: [],
        parentId: uniqueId,
        part: 'buttons',
        layout: 'buttons',
        configuration: 'sectionOne'
      });
    }
    if (!imageContainer && !existingIds.has(`${uniqueId}-image`)) {
      updates.push({
        id: `${uniqueId}-image`,
        type: 'div',
        styles: defaultSectionStyles.imageContainer,
        children: [],
        parentId: uniqueId,
        part: 'image',
        layout: 'image',
        configuration: 'sectionOne'
      });
    }

    // Only inject content if we have default content and the containers are empty
    if (defaultContent.length > 0 && 
        (!contentContainer || contentContainer.children.length === 0) &&
        (!buttonsContainer || buttonsContainer.children.length === 0) &&
        (!imageContainer || imageContainer.children.length === 0)) {
      
      const newChildren = defaultContent.map(child => {
        const newId = `${uniqueId}-${child.type}-${Math.random().toString(36).substr(2, 9)}`;
        let parentId;
        if (child.type === 'image') {
          parentId = `${uniqueId}-image`;
        } else if (child.type === 'button') {
          parentId = `${uniqueId}-buttons`;
        } else {
          parentId = `${uniqueId}-content`;
        }
        
        return {
          id: newId,
          type: child.type,
          content: child.content,
          styles: mergeStyles(
            child.type === 'heading' ? defaultSectionStyles.heading :
            child.type === 'paragraph' ? defaultSectionStyles.paragraph :
            child.type === 'button' ? defaultSectionStyles.primaryButton :
            child.type === 'image' ? defaultSectionStyles.image :
            {},
            child.styles || {}
          ),
          parentId,
          isConfigured: true
        };
      });

      // Add all new children to updates
      updates.push(...newChildren);

      // Update containers with their respective children
      const contentChildren = newChildren
        .filter(child => child.parentId === `${uniqueId}-content`)
        .map(child => child.id);
      const buttonChildren = newChildren
        .filter(child => child.parentId === `${uniqueId}-buttons`)
        .map(child => child.id);
      const imageChildren = newChildren
        .filter(child => child.parentId === `${uniqueId}-image`)
        .map(child => child.id);

      if (contentContainer) {
        updates.push({
          ...contentContainer,
          children: contentChildren
        });
      } else {
        updates[0].children = contentChildren;
      }

      if (buttonsContainer) {
        updates.push({
          ...buttonsContainer,
          children: buttonChildren
        });
      } else {
        updates[1].children = buttonChildren;
      }

      if (imageContainer) {
        updates.push({
          ...imageContainer,
          children: imageChildren
        });
      } else {
        updates[2].children = imageChildren;
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
  }, [sectionElement, elements, findElementById, uniqueId, updateStyles, setElements]);

  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
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
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
  const imageContainer = findElementById(`${uniqueId}-image`, elements);

  // Merge styles for containers
  const contentContainerStyles = mergeStyles(defaultSectionStyles.contentWrapper, contentContainer?.styles || {});
  const buttonsContainerStyles = mergeStyles(defaultSectionStyles.buttonContainer, buttonsContainer?.styles || {});
  const imageContainerStyles = mergeStyles(defaultSectionStyles.imageContainer, imageContainer?.styles || {});

  // Merge styles for section
  const mergedSectionStyles = mergeStyles(defaultSectionStyles.section, sectionElement?.styles || {});

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedSectionStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
    >
      <Div
        id={`${uniqueId}-content`}
        parentId={`${uniqueId}-content`}
        styles={contentContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
      >
        {renderContainerChildren(`${uniqueId}-content`)}
      </Div>
      <Div
        id={`${uniqueId}-buttons`}
        parentId={`${uniqueId}-buttons`}
        styles={buttonsContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
      >
        {renderContainerChildren(`${uniqueId}-buttons`)}
      </Div>
      <Div
        id={`${uniqueId}-image`}
        parentId={`${uniqueId}-image`}
        styles={imageContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-image`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-image`)}
      >
        {renderContainerChildren(`${uniqueId}-image`)}
      </Div>
    </SectionWithRef>
  );
});

export default SectionOne;
