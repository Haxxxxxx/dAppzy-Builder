import React, { useContext, useMemo, useRef, forwardRef } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';

import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { Section, Div, Heading, Paragraph, Image, Anchor } from '../../SelectableElements';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { defaultSectionStyles } from './defaultSectionStyles';
import DropInsertionLine from '../../../components/DropInsertionLine';

const SectionThree = forwardRef(({ handleSelect, uniqueId, handleOpenMediaPanel }, ref) => {
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
  const config = structureConfigurations.sectionThree || {};
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
  const leftContainer = findElementById(`${uniqueId}-left`, elements);
  const rightContainer = findElementById(`${uniqueId}-right`, elements);

  // Merge styles for section
  const mergedSectionStyles = { ...configStyles.section, ...(sectionElement?.styles || {}) };

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
      {leftContainer && (
        <Div
          id={leftContainer.id}
          styles={leftContainer.styles}
          onDragOver={(e) => onDragOver(e, leftContainer.id)}
          onDrop={(e) => onDrop(e, leftContainer.id)}
          onDragLeave={onDragLeave}
        >
          {renderContainerChildren(leftContainer.id)}
          </Div>
        )}
      {rightContainer && (
        <Div
          id={rightContainer.id}
          styles={rightContainer.styles}
          onDragOver={(e) => onDragOver(e, rightContainer.id)}
          onDrop={(e) => onDrop(e, rightContainer.id)}
          onDragLeave={onDragLeave}
        >
          {renderContainerChildren(rightContainer.id)}
          </Div>
        )}
    </Section>
  );
});

export default SectionThree;
