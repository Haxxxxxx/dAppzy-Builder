import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { Section, Div, Heading, Paragraph, Button, Span } from '../../SelectableElements';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { defaultSectionStyles } from './defaultSectionStyles';

const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const getStyleFromKey = (styles, key) => {
  if (!key) return {};
  if (typeof key === 'string') return styles[key] || {};
  if (typeof key === 'object' && key.key) return styles[key.key] || {};
  return {};
};

const SectionFour = forwardRef(({ handleSelect, uniqueId, handleOpenMediaPanel }, ref) => {
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

  // Get config and styles from SectionConfiguration.js
  const config = structureConfigurations.sectionFour || {};
  const configStyles = config.styles || {};
  const childrenConfig = config.children || [];

  useEffect(() => {
    if (!sectionElement || defaultInjectedRef.current) return;

    // Set section styles
    updateStyles(sectionElement.id, merge({}, configStyles.section));

    const contentId = `${uniqueId}-content`;
    const gridId = `${uniqueId}-grid`;
    const bottomButtonId = `${uniqueId}-bottom-button`;
    let newElements = [];
    let contentChildIds = [];
    let gridChildIds = [];

    // Create content container
    if (!findElementById(contentId, elements)) {
      const content = {
        id: contentId,
        type: 'div',
        styles: merge({}, getStyleFromKey(configStyles, 'content')),
        children: [],
        parentId: uniqueId,
      };
      newElements.push(content);

      // Add heading and paragraph to content
      const contentConfig = childrenConfig[0];
      if (contentConfig && contentConfig.children) {
        contentConfig.children.forEach(child => {
          const newId = addNewElement(child.type, 1, null, contentId);
          const baseStyle =
            child.type === 'heading' ? defaultSectionStyles.heading :
            child.type === 'paragraph' ? defaultSectionStyles.paragraph : {};
          const sectionStyle = getStyleFromKey(configStyles, child.styles?.key || '');
          
          setElements(prev => prev.map(el => {
            if (el.id === newId) {
              return {
                ...el,
                content: child.content,
                styles: merge({}, baseStyle, sectionStyle, child.styles || {})
              };
            }
            return el;
          }));
          contentChildIds.push(newId);
        });
      }
    }

    // Create grid container
    if (!findElementById(gridId, elements)) {
      const grid = {
        id: gridId,
        type: 'div',
        styles: merge({}, getStyleFromKey(configStyles, 'featuresContainer')),
        children: [],
        parentId: uniqueId,
      };
      newElements.push(grid);

      // Add pricing cards
      const gridConfig = childrenConfig[1];
      if (gridConfig && gridConfig.children) {
        gridConfig.children.forEach(card => {
          const cardId = addNewElement('div', 1, null, gridId);
          let cardChildIds = [];

          // Add card children (title, price, features, button)
          card.children.forEach(cardChild => {
            const newId = addNewElement(cardChild.type, 1, null, cardId);
            const baseStyle =
              cardChild.type === 'heading' ? defaultSectionStyles.heading :
              cardChild.type === 'paragraph' ? defaultSectionStyles.paragraph :
              cardChild.type === 'button' ? defaultSectionStyles.primaryButton : {};
            const sectionStyle = getStyleFromKey(configStyles, cardChild.styles?.key || '');

            setElements(prev => prev.map(el => {
              if (el.id === newId) {
                return {
                  ...el,
                  content: cardChild.content,
                  styles: merge({}, baseStyle, sectionStyle, cardChild.styles || {})
                };
              }
              return el;
            }));
            cardChildIds.push(newId);
          });

          // Update card with its children and styles
          setElements(prev => prev.map(el => {
            if (el.id === cardId) {
              return {
                ...el,
                children: cardChildIds,
                styles: merge({}, getStyleFromKey(configStyles, 'featureItem'), card.styles || {}),
                parentId: gridId
              };
            }
            return el;
          }));
          gridChildIds.push(cardId);
        });
      }
    }

    // Create bottom button
    if (!findElementById(bottomButtonId, elements)) {
      const bottomButtonConfig = childrenConfig[2];
      if (bottomButtonConfig) {
        const buttonId = addNewElement('button', 1, null, uniqueId);
        setElements(prev => prev.map(el => {
          if (el.id === buttonId) {
            return {
              ...el,
              content: bottomButtonConfig.content,
              styles: merge({}, defaultSectionStyles.primaryButton, getStyleFromKey(configStyles, 'bottomButton'), bottomButtonConfig.styles || {})
            };
          }
          return el;
        }));
      }
    }

    // Batch add all new elements
    if (newElements.length > 0) {
      setElements(prev => [...prev, ...newElements]);
    }

    // Update content container with its children
    if (contentChildIds.length > 0) {
      setElements(prev => prev.map(el => el.id === contentId ? { ...el, children: contentChildIds } : el));
    }

    // Update grid container with its children
    if (gridChildIds.length > 0) {
      setElements(prev => prev.map(el => el.id === gridId ? { ...el, children: gridChildIds } : el));
    }

    // Set section children
    setElements(prev => prev.map(el => el.id === uniqueId ? { ...el, children: [contentId, gridId, bottomButtonId] } : el));

    defaultInjectedRef.current = true;
  }, [sectionElement, uniqueId, elements, findElementById, setElements, addNewElement, updateStyles, config, configStyles]);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: (item) => addNewElement(item.type, item.level || 1, null, uniqueId),
  });

  // Helper to render children recursively
  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;
    return container.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;
      // Render feature info lines as Span
      if (child.type === 'div' && child.content && child.styles && (child.styles.key === 'featureListItem' || child.styles.key === 'featureListItem')) {
        return (
          <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />
        );
      }
      if (child.type === 'div' && child.content) {
        // Render as a leaf node with content
        return (
          <Div key={child.id} id={child.id} styles={child.styles}>
            {child.content}
          </Div>
        );
      }
      switch (child.type) {
        case 'div':
          return (
            <Div key={child.id} id={child.id} styles={child.styles}>
              {renderContainerChildren(child.id)}
            </Div>
          );
        case 'span':
          return <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'heading':
          return <Heading key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'paragraph':
          return <Paragraph key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'button':
          return <Button key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        default:
          return null;
      }
    });
  };

  // Get container elements
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const gridContainer = findElementById(`${uniqueId}-grid`, elements);
  const bottomButton = findElementById(`${uniqueId}-bottom-button`, elements);

  // Merge styles for section
  const mergedSectionStyles = merge({}, configStyles.section, sectionElement?.styles || {});

  // Get wrapper styles
  const wrapperStyles = merge({}, getStyleFromKey(configStyles, 'wrapper'));
  
  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedSectionStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
      }}
      ref={(node) => {
        sectionRef.current = node;
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
      <div style={wrapperStyles}>
        {contentContainer && (
          <Div id={contentContainer.id} styles={contentContainer.styles}>
            {renderContainerChildren(contentContainer.id)}
        </Div>
      )}
        {gridContainer && (
          <Div id={gridContainer.id} styles={gridContainer.styles}>
            {renderContainerChildren(gridContainer.id)}
        </Div>
      )}
        {bottomButton && (
          <Button id={bottomButton.id} content={bottomButton.content} styles={bottomButton.styles} />
      )}
      </div>
    </SectionWithRef>
  );
});

export default SectionFour;
