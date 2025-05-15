import React, { useRef, useMemo, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { ctaTwoStyles } from './defaultCtaStyles';
import { Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { mergeStyles } from '../../../utils/htmlRenderUtils/containerHelpers';
import { CtaConfigurations } from '../../../configs/ctasections/CtaConfigurations';

const CTATwo = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
  configuration,
}) => {
  const ctaRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  const [isCompact, setIsCompact] = React.useState(false);

  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  const ctaElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  useEffect(() => {
    if (defaultInjectedRef.current || !ctaElement) return;

    // First, ensure the CTA has the default styles
    const mergedCtaStyles = mergeStyles(ctaTwoStyles.cta, ctaElement?.styles);
    updateStyles(ctaElement.id, mergedCtaStyles);

    const textContainer = findElementById(`${uniqueId}-text`, elements);
    const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
    const defaultContent = ctaElement?.configuration ? 
      CtaConfigurations[ctaElement.configuration].children : [];

    // Create a batch of updates
    const updates = [];

    // Add containers if they don't exist
    if (!textContainer) {
      updates.push({
        id: `${uniqueId}-text`,
        type: 'div',
        styles: ctaTwoStyles.ctaContent,
        children: [],
        parentId: uniqueId,
      });
    }
    if (!buttonsContainer) {
      updates.push({
        id: `${uniqueId}-buttons`,
        type: 'div',
        styles: ctaTwoStyles.buttonContainer,
        children: [],
        parentId: uniqueId,
      });
    }

    // Only inject content if we have default content and the containers are empty
    if (defaultContent.length > 0 && 
        (!textContainer || textContainer.children.length === 0) &&
        (!buttonsContainer || buttonsContainer.children.length === 0)) {
      
      const newChildren = defaultContent.map(child => {
        const newId = `${uniqueId}-${child.type}-${Math.random().toString(36).substr(2, 9)}`;
        const parentId = child.type === 'button' ? `${uniqueId}-buttons` : `${uniqueId}-text`;
        
        return {
          id: newId,
          type: child.type,
          content: child.content,
          styles: mergeStyles(
            child.type === 'title' ? ctaTwoStyles.ctaTitle :
            child.type === 'paragraph' ? ctaTwoStyles.ctaDescription :
            child.type === 'button' ? ctaTwoStyles.primaryButton :
            {},
            child.styles || {}
          ),
          parentId
        };
      });

      // Add all new children to updates
      updates.push(...newChildren);

      // Update containers with their respective children
      const textChildren = newChildren
        .filter(child => child.parentId === `${uniqueId}-text`)
        .map(child => child.id);
      const buttonChildren = newChildren
        .filter(child => child.parentId === `${uniqueId}-buttons`)
        .map(child => child.id);

      if (textContainer) {
        updates.push({
          ...textContainer,
          children: textChildren
        });
      } else {
        updates[0].children = textChildren;
      }

      if (buttonsContainer) {
        updates.push({
          ...buttonsContainer,
          children: buttonChildren
        });
      } else {
        updates[1].children = buttonChildren;
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
  }, [ctaElement, elements, findElementById, uniqueId, updateStyles, setElements]);

  // Responsive toggle
  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  const handleCTADrop = (droppedItem, parentId = uniqueId) => {
    addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: ctaRef,
    onDropItem: (item) => handleCTADrop(item, uniqueId),
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

  // Get the container elements
  const textContainer = findElementById(`${uniqueId}-text`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);

  // Merge styles for containers
  const textContainerStyles = mergeStyles(ctaTwoStyles.ctaContent, textContainer?.styles || {});
  const buttonsContainerStyles = mergeStyles(ctaTwoStyles.buttonContainer, buttonsContainer?.styles || {});

  // Merge styles for CTA section
  const mergedCtaStyles = mergeStyles(ctaTwoStyles.cta, ctaElement?.styles || {});

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedCtaStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        ctaRef.current = node;
        drop(node);
      }}
    >
      <Div
        id={`${uniqueId}-text`}
        parentId={`${uniqueId}-text`}
        styles={textContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleCTADrop(item, `${uniqueId}-text`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-text`)}
      >
        {renderContainerChildren(`${uniqueId}-text`)}
      </Div>
      <Div
        id={`${uniqueId}-buttons`}
        parentId={`${uniqueId}-buttons`}
        styles={buttonsContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleCTADrop(item, `${uniqueId}-buttons`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
      >
        {renderContainerChildren(`${uniqueId}-buttons`)}
      </Div>
    </Section>
  );
};

export default CTATwo;
