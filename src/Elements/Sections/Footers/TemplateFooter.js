import React, { forwardRef, useEffect, useMemo, useContext, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Section, Div } from '../../SelectableElements';
import { FooterConfigurations } from '../../../configs/footers/FooterConfigurations';
import { Image, Button, Heading, Paragraph, LinkBlock, Span } from '../../SelectableElements';
import { EditableContext } from '../../../context/EditableContext';
import { TemplateFooterStyles } from './defaultFooterStyles';
import merge from 'lodash/merge';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';

const TemplateFooter = forwardRef(({
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handlePanelToggle,
  handleOpenMediaPanel,
  handleSelect
}, ref) => {
  const { 
    findElementById, 
    elements, 
    updateElementProperties, 
    setElements, 
    generateUniqueId,
    addNewElement,
    setSelectedElement 
  } = useContext(EditableContext);
  const defaultInjectedRef = useRef(false);
  const footerRef = useRef(null);
  const contentContainerRef = useRef(null);

  // Find the footer element - memoize to prevent unnecessary recalculations
  const footer = useMemo(() => findElementById(uniqueId, elements), [uniqueId, elements, findElementById]);

  // Get footer configuration - memoize to prevent unnecessary recalculations
  const footerConfig = useMemo(() => {
    if (!footer?.configuration) return null;
    return FooterConfigurations[footer.configuration];
  }, [footer?.configuration]);

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

  // Create default content
  const createDefaultContent = useCallback(() => {
    if (!footerConfig) return;

    const contentContainer = {
      id: `${uniqueId}-content`,
      type: 'div',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      },
      children: [],
      parentId: uniqueId
    };

    const defaultChildren = footerConfig.children.map(child => ({
      id: `${uniqueId}-content-${Math.random().toString(36).substr(2, 9)}`,
      type: child.type,
      content: child.content,
      styles: merge(
        child.type === 'span' ? TemplateFooterStyles.footerText :
        child.type === 'button' ? TemplateFooterStyles.footerButton :
        child.type === 'linkblock' ? TemplateFooterStyles.footerLink :
        child.type === 'heading' ? TemplateFooterStyles.footerTitle :
        child.type === 'paragraph' ? TemplateFooterStyles.footerDescription :
        {},
        child.styles || {}
      ),
      parentId: `${uniqueId}-content`,
      children: []
    }));

    contentContainer.children = defaultChildren.map(child => child.id);
    
    setElements(prev => {
      const existingIds = new Set(prev.map(el => el.id));
      const newElements = [contentContainer, ...defaultChildren].filter(el => !existingIds.has(el.id));
      return [...prev, ...newElements];
    });

    updateElementProperties(uniqueId, {
      children: [contentContainer.id],
      styles: {
        ...footerConfig.styles,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box'
      }
    });

    defaultInjectedRef.current = true;
  }, [footerConfig, uniqueId, setElements, updateElementProperties]);

  // Ensure footer has default styles and content
  useEffect(() => {
    if (defaultInjectedRef.current || !footer || !footerConfig) return;
    createDefaultContent();
  }, [footer, footerConfig, createDefaultContent]);

  // Early return after all hooks are defined
  if (!footer || !footerConfig) return null;

  // Get the content container element
  const contentContainer = findElementById(`${uniqueId}-content`, elements);

  // Merge styles for container
  const contentContainerStyles = merge({}, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  }, contentContainer?.styles || {});

  return (
    <Section
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
      id={uniqueId}
      type="footer"
      configuration={footer.configuration}
      style={{
        ...footer.styles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {})
      }}
      onClick={handleSelect}
      >
      <Div
        ref={contentContainerRef}
        id={`${uniqueId}-content`}
        parentId={`${uniqueId}-content`}
        styles={contentContainerStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleFooterDrop(item, `${uniqueId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
      >
        {contentContainer && renderContainerChildren(`${uniqueId}-content`)}
      </Div>
    </Section>
  );
});

TemplateFooter.displayName = 'TemplateFooter';

export default TemplateFooter;