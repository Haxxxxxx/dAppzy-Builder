import React, { useContext, useMemo, useRef, forwardRef } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { heroTwoStyles } from './defaultHeroStyles';
import { Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import DropInsertionLine from '../../../components/DropInsertionLine';

const HeroTwo = forwardRef(({
  handleSelect,
  uniqueId,
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

  const contentContainerId = `${uniqueId}-content`;

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
    <Section
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#6B7280',
        color: '#fff',
        ...(isOverCurrent ? { outline: '2px dashed var(--purple, #5C4EFA)' } : {}),
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
        onDragOver={(e) => onDragOver(e, contentContainerId)}
        onDrop={(e) => onDrop(e, contentContainerId)}
        onDragLeave={onDragLeave}
      >
        {renderContainerChildren(contentContainerId)}
      </Div>
    </Section>
  );
});

export default HeroTwo;
