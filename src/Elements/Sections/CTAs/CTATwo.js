import React, { useRef, useMemo, useContext } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import DropInsertionLine from '../../../components/DropInsertionLine';
import { ctaTwoStyles } from './defaultCtaStyles';
import { Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';

const CTATwo = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const ctaRef = useRef(null);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    addNewElement,
  } = useContext(EditableContext);

  const ctaElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  const handleCTADrop = (droppedItem, parentId = uniqueId) => {
    addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: ctaRef,
    onDropItem: (item) => handleCTADrop(item, uniqueId),
  });

  const isDndDragging = useDndIsDragging();

  const {
    activeDrop,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDragLeave,
    isDragging: isReorderDragging,
    dropIndicatorIndex,
    dropIndicatorContainerId,
    draggedId,
  } = useReorderDrop(findElementById, elements, setElements);

  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };

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
                onDragStart={(e) => onDragStart(e, childId, containerId)}
                onDragEnd={onDragEnd}
                style={{
                  cursor: isDndDragging ? 'default' : 'grab',
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

  // Get the container elements
  const textContainer = findElementById(`${uniqueId}-text`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);

  // Merge styles for containers
  const textContainerStyles = { ...ctaTwoStyles.ctaContent, ...(textContainer?.styles || {}) };
  const buttonsContainerStyles = { ...ctaTwoStyles.buttonContainer, ...(buttonsContainer?.styles || {}) };

  // Merge styles for CTA section
  const mergedCtaStyles = { ...ctaTwoStyles.cta, ...(ctaElement?.styles || {}) };

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedCtaStyles,
        ...(isOverCurrent ? { outline: '2px dashed var(--purple, #5C4EFA)' } : {}),
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
