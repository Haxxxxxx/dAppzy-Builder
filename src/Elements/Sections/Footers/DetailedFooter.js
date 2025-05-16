import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { DetailedFooterStyles } from './defaultFooterStyles';
import { Image, Button, Heading, Paragraph, Section, Div, Link, Span } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { FooterConfigurations } from '../../../configs/footers/FooterConfigurations';

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const DetailedFooter = forwardRef(({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}, ref) => {
  const footerRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  const footerElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  useEffect(() => {
    if (defaultInjectedRef.current || !footerElement) return;

    // First, ensure the footer has the default styles
    const mergedFooterStyles = merge({}, DetailedFooterStyles.footerSection, footerElement?.styles);
    updateStyles(footerElement.id, mergedFooterStyles);

    const contentContainer = findElementById(`${uniqueId}-content`, elements);
    const footerConfig = FooterConfigurations[footerElement?.configuration || 'detailedFooter'] || {};
    const defaultContent = footerConfig.children || [];

    // Create a batch of updates
    const updates = [];

    // Add content container if it doesn't exist
    if (!contentContainer) {
      updates.push({
        id: `${uniqueId}-content`,
        type: 'div',
        styles: DetailedFooterStyles.footerContent,
        children: [],
        parentId: uniqueId,
      });
    }

    // Only inject content if we have default content and the container is empty
    if (defaultContent.length > 0 && (!contentContainer || contentContainer.children.length === 0)) {
      const processChild = (child, parentId) => {
        const newId = `${parentId}-${Math.random().toString(36).substr(2, 9)}`;
        const processedChild = {
          id: newId,
          type: child.type,
          content: child.content,
          styles: merge(
            child.type === 'span' ? DetailedFooterStyles.footerText :
            child.type === 'button' ? DetailedFooterStyles.footerButton :
            child.type === 'linkblock' ? DetailedFooterStyles.footerLink :
            child.type === 'heading' ? DetailedFooterStyles.footerHeading :
            child.type === 'div' ? DetailedFooterStyles.footerContent :
            {},
            child.styles || {}
          ),
          parentId: parentId,
          children: []
        };

        if (child.children && child.children.length > 0) {
          processedChild.children = child.children.map(grandChild => 
            processChild(grandChild, newId)
          );
        }

        return processedChild;
      };

      const newChildren = defaultContent.map(child => processChild(child, `${uniqueId}-content`));
      updates.push(...newChildren);

      // Update content container with new children
      if (contentContainer) {
        updates.push({
          ...contentContainer,
          children: newChildren.map(child => child.id)
        });
      } else {
        updates[0].children = newChildren.map(child => child.id);
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
  }, [footerElement, elements, findElementById, uniqueId, updateStyles, setElements]);

  const handleFooterDrop = (droppedItem, parentId = uniqueId) => {
    // Simple drop handler that just adds the element
    addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem: (item) => handleFooterDrop(item, uniqueId),
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

  // Get the content container element
  const contentContainer = findElementById(`${uniqueId}-content`, elements);

  // Merge styles for container
  const contentContainerStyles = merge({}, DetailedFooterStyles.footerContent, contentContainer?.styles || {});

  // Merge styles for footer section
  const mergedFooterStyles = merge({}, DetailedFooterStyles.footerSection, footerElement?.styles || {});

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedFooterStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        footerRef.current = node;
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
        onDropItem={(item) => handleFooterDrop(item, `${uniqueId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
      >
        {renderContainerChildren(`${uniqueId}-content`)}
      </Div>
    </SectionWithRef>
  );
});

DetailedFooter.displayName = 'DetailedFooter';

export default DetailedFooter;
