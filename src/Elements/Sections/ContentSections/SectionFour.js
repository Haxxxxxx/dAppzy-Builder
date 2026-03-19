import React, { useContext, useMemo, useRef, forwardRef } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';

import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { Section, Div, Heading, Paragraph, Button, Span } from '../../SelectableElements';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { defaultSectionStyles } from './defaultSectionStyles';
import DropInsertionLine from '../../../components/DropInsertionLine';

const getStyleFromKey = (styles, key) => {
  if (!key) return {};
  if (typeof key === 'string') return styles[key] || {};
  if (typeof key === 'object' && key.key) return styles[key.key] || {};
  return {};
};

const SectionFour = forwardRef(({ handleSelect, uniqueId, handleOpenMediaPanel }, ref) => {
  const sectionRef = useRef(null);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    addNewElement,
  } = useContext(EditableContext);

  const sectionElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Get config and styles from SectionConfiguration.js
  const config = structureConfigurations.sectionFour || {};
  const configStyles = config.styles || {};

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: (item) => addNewElement(item.type, item.level || 1, null, uniqueId),
  });

  const isDndDragging = useDndIsDragging();

  const {
    activeDrop,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDragLeave,
    draggedId,
    isDragging: isReorderDragging,
    dropIndicatorIndex,
    dropIndicatorContainerId,
  } = useReorderDrop(findElementById, elements, setElements);

  // Helper to render children recursively
  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    const showIndicator = isReorderDragging && dropIndicatorContainerId === containerId;

    return (
      <>
        {container.children.map((childId, idx) => {
          const child = findElementById(childId, elements);
          if (!child) return null;

          const renderChild = () => {
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
          };

          return (
            <React.Fragment key={childId}>
              {showIndicator && dropIndicatorIndex === idx && <DropInsertionLine />}
              <div
                draggable={!isDndDragging}
                onDragStart={(e) => onDragStart(e, childId, containerId)}
                onDragEnd={onDragEnd}
                style={{
                  cursor: isDndDragging ? 'default' : 'grab',
                  opacity: draggedId === childId ? 0.4 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {renderChild()}
              </div>
            </React.Fragment>
          );
        })}
        {showIndicator && dropIndicatorIndex === container.children.length && <DropInsertionLine />}
      </>
    );
  };

  // Get container elements
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const gridContainer = findElementById(`${uniqueId}-grid`, elements);
  const bottomButton = findElementById(`${uniqueId}-bottom-button`, elements);

  // Merge styles for section
  const mergedSectionStyles = { ...configStyles.section, ...(sectionElement?.styles || {}) };

  // Get wrapper styles
  const wrapperStyles = { ...getStyleFromKey(configStyles, 'wrapper') };
  
  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedSectionStyles,
        ...(isOverCurrent ? { outline: '2px dashed var(--purple, #5C4EFA)' } : {}),
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
          <Div
            id={contentContainer.id}
            styles={contentContainer.styles}
            onDragOver={(e) => onDragOver(e, contentContainer.id)}
            onDrop={(e) => onDrop(e, contentContainer.id)}
            onDragLeave={onDragLeave}
          >
            {renderContainerChildren(contentContainer.id)}
        </Div>
      )}
        {gridContainer && (
          <Div
            id={gridContainer.id}
            styles={gridContainer.styles}
            onDragOver={(e) => onDragOver(e, gridContainer.id)}
            onDrop={(e) => onDrop(e, gridContainer.id)}
            onDragLeave={onDragLeave}
          >
            {renderContainerChildren(gridContainer.id)}
        </Div>
      )}
        {bottomButton && (
          <Button id={bottomButton.id} content={bottomButton.content} styles={bottomButton.styles} />
      )}
      </div>
    </Section>
  );
});

export default SectionFour;
