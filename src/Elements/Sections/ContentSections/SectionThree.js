import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { Section, Div, Heading, Paragraph, Image, Anchor } from '../../SelectableElements';
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

const SectionThree = forwardRef(({ handleSelect, uniqueId, handleOpenMediaPanel }, ref) => {
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
  const config = structureConfigurations.sectionThree || {};
  const configStyles = config.styles || {};
  const childrenConfig = config.children || [];

  useEffect(() => {
    if (!sectionElement || defaultInjectedRef.current) return;
    // Set section styles
    updateStyles(sectionElement.id, merge({}, configStyles.section));
    const leftId = `${uniqueId}-left`;
    const rightId = `${uniqueId}-right`;
    let newElements = [];
    let leftChildIds = [];
    let rightCardIds = [];
    // LEFT CONTAINER
    if (!findElementById(leftId, elements)) {
      const left = {
        id: leftId,
        type: 'div',
        styles: merge({}, getStyleFromKey(configStyles, 'left')),
        children: [],
        parentId: uniqueId,
      };
      newElements.push(left);
      // Add heading and paragraph
      const leftConfig = childrenConfig[0];
      if (leftConfig && leftConfig.children) {
        leftConfig.children.forEach(child => {
          const newId = addNewElement(child.type, 1, null, leftId);
          // Merge styles: defaultSectionStyles -> section config -> inline
          const baseStyle =
            child.type === 'heading' ? defaultSectionStyles.heading :
            child.type === 'paragraph' ? defaultSectionStyles.paragraph : {};
          const sectionStyle = getStyleFromKey(configStyles, child.type === 'heading' ? 'heading' : child.type === 'paragraph' ? 'paragraph' : '');
          setElements(prev => prev.map(el => {
            if (el.id === newId) {
              return {
                ...el,
                content: child.content,
                styles: merge({}, baseStyle, sectionStyle, child.styles || {}),
                href: child.href
              };
            }
            return el;
          }));
          leftChildIds.push(newId);
        });
      }
    }
    // RIGHT CONTAINER
    if (!findElementById(rightId, elements)) {
      const right = {
        id: rightId,
        type: 'div',
        styles: merge({}, getStyleFromKey(configStyles, 'right')),
        children: [],
        parentId: uniqueId,
      };
      newElements.push(right);
      // Add testimonial cards
      const rightConfig = childrenConfig[1];
      if (rightConfig && rightConfig.children) {
        rightConfig.children.forEach(card => {
          const cardId = addNewElement('div', 1, null, rightId);
          let cardChildIds = [];
          // Add card children (image, heading, paragraph, anchor)
          card.children.forEach(cardChild => {
            const newId = addNewElement(cardChild.type, 1, null, cardId);
            // Merge styles: defaultSectionStyles -> section config -> inline
            const baseStyle =
              cardChild.type === 'image' ? defaultSectionStyles.image :
              cardChild.type === 'heading' ? defaultSectionStyles.heading :
              cardChild.type === 'paragraph' ? defaultSectionStyles.paragraph : {};
            const sectionStyle = getStyleFromKey(configStyles,
              cardChild.type === 'image' ? 'testimonialIcon' :
              cardChild.type === 'heading' ? 'testimonialName' :
              cardChild.type === 'paragraph' ? 'testimonialText' :
              cardChild.type === 'anchor' ? 'testimonialLink' : ''
            );
            setElements(prev => prev.map(el => {
              if (el.id === newId) {
                return {
                  ...el,
                  content: cardChild.content,
                  href: cardChild.href,
                  styles: merge({}, baseStyle, sectionStyle, cardChild.styles || {})
                };
              }
              return el;
            }));
            cardChildIds.push(newId);
          });
          setElements(prev => prev.map(el => el.id === cardId ? { ...el, children: cardChildIds, styles: merge({}, getStyleFromKey(configStyles, 'testimonialCard'), card.styles || {}), parentId: rightId } : el));
          rightCardIds.push(cardId);
        });
      }
    }
    // Batch add all new elements
    if (newElements.length > 0) {
      setElements(prev => [...prev, ...newElements]);
    }
    // Update left and right containers with their children
    if (leftChildIds.length > 0) {
      setElements(prev => prev.map(el => el.id === leftId ? { ...el, children: leftChildIds } : el));
    }
    if (rightCardIds.length > 0) {
      setElements(prev => prev.map(el => el.id === rightId ? { ...el, children: rightCardIds } : el));
    }
    // Set section children
    setElements(prev => prev.map(el => el.id === uniqueId ? { ...el, children: [leftId, rightId] } : el));
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
      switch (child.type) {
        case 'div':
          return (
            <Div key={child.id} id={child.id} styles={child.styles}>
              {renderContainerChildren(child.id)}
            </Div>
          );
        case 'heading':
          return <Heading key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'paragraph':
          return <Paragraph key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'image':
          return <Image key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'anchor':
          return <Anchor key={child.id} id={child.id} content={child.content} href={child.href} styles={child.styles} />;
        default:
          return null;
      }
    });
  };

  // Get container elements
  const leftContainer = findElementById(`${uniqueId}-left`, elements);
  const rightContainer = findElementById(`${uniqueId}-right`, elements);

  // Merge styles for section
  const mergedSectionStyles = merge({}, configStyles.section, sectionElement?.styles || {});

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
      {leftContainer && (
        <Div id={leftContainer.id} styles={leftContainer.styles}>
          {renderContainerChildren(leftContainer.id)}
          </Div>
        )}
      {rightContainer && (
        <Div id={rightContainer.id} styles={rightContainer.styles}>
          {renderContainerChildren(rightContainer.id)}
          </Div>
        )}
    </SectionWithRef>
  );
});

export default SectionThree;
