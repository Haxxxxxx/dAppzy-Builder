import React, { useContext, useMemo, useRef, forwardRef } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';

import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { defaultHeroStyles } from './defaultHeroStyles';
import { Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import DropInsertionLine from '../../../components/DropInsertionLine';

const HeroOne = forwardRef(({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}, ref) => {
  const heroRef = useRef(null);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    addNewElement,
  } = useContext(EditableContext);

  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
    // Simple drop handler that just adds the element
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

  const leftContainerId = `${uniqueId}-left`;
  const rightContainerId = `${uniqueId}-right`;

  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    const showIndicator = isReorderDragging && dropIndicatorContainerId === containerId;

    return (
      <>
        {container.children.map((childId, idx) => {
          const child = findElementById(childId, elements);
          if (!child) return null;
          return (
            <React.Fragment key={childId}>
              {showIndicator && dropIndicatorIndex === idx && <DropInsertionLine />}
              <div
                draggable={!isDndDragging}
                onDragStart={!isDndDragging ? (e) => onDragStart(e, childId, containerId) : undefined}
                onDragEnd={onDragEnd}
                style={{
                  cursor: !isDndDragging ? 'grab' : 'default',
                  opacity: draggedId === childId ? 0.4 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {renderElement(
                  child, elements, null, setSelectedElement, setElements,
                  null, undefined, null, false, handleOpenMediaPanel
                )}
              </div>
            </React.Fragment>
          );
        })}
        {showIndicator && dropIndicatorIndex === container.children.length && <DropInsertionLine />}
      </>
    );
  };

  // Get the left and right container elements
  const leftContainer = findElementById(leftContainerId, elements);
  const rightContainer = findElementById(rightContainerId, elements);

  // Merge styles for containers
  const leftContainerStyles = { ...defaultHeroStyles.heroLeftContent, ...(leftContainer?.styles || {}) };
  const rightContainerStyles = { ...defaultHeroStyles.heroRightContent, ...(rightContainer?.styles || {}) };

  // Merge styles for hero section
  const mergedHeroStyles = { ...defaultHeroStyles.heroSection, ...(heroElement?.styles || {}) };

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        ...(isOverCurrent ? { outline: '2px dashed var(--purple, #5C4EFA)' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
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
        id={leftContainerId}
        parentId={leftContainerId}
        styles={leftContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, leftContainerId)}
        onClick={(e) => handleInnerDivClick(e, leftContainerId)}
        onDragOver={(e) => onDragOver(e, leftContainerId)}
        onDrop={(e) => onDrop(e, leftContainerId)}
        onDragLeave={onDragLeave}
      >
        {renderContainerChildren(leftContainerId)}
      </Div>
      <Div
        id={rightContainerId}
        parentId={rightContainerId}
        styles={rightContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, rightContainerId)}
        onClick={(e) => handleInnerDivClick(e, rightContainerId)}
        onDragOver={(e) => onDragOver(e, rightContainerId)}
        onDrop={(e) => onDrop(e, rightContainerId)}
        onDragLeave={onDragLeave}
      >
        {renderContainerChildren(rightContainerId)}
      </Div>
    </Section>
  );
});

export default HeroOne;
