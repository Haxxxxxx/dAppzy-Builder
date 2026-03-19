// src/Sections/ContentSections/SectionOne.jsx
import React, { useContext, useMemo, useRef, forwardRef } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import DropInsertionLine from '../../../components/DropInsertionLine';
import { defaultSectionStyles } from './defaultSectionStyles';
import { Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';

const SectionOne = forwardRef(({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}, ref) => {
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

  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
    addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: (item) => handleSectionDrop(item, uniqueId),
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
    isDragging: isReorderDragging,
    dropIndicatorIndex,
    dropIndicatorContainerId,
    draggedId,
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
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
  const imageContainer = findElementById(`${uniqueId}-image`, elements);

  // Merge styles for containers
  const contentContainerStyles = { ...defaultSectionStyles.contentWrapper, ...(contentContainer?.styles || {}) };
  const buttonsContainerStyles = { ...defaultSectionStyles.buttonContainer, ...(buttonsContainer?.styles || {}) };
  const imageContainerStyles = { ...defaultSectionStyles.imageContainer, ...(imageContainer?.styles || {}) };

  // Merge styles for section
  const mergedSectionStyles = { ...defaultSectionStyles.section, ...(sectionElement?.styles || {}) };

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedSectionStyles,
        ...(isOverCurrent ? { outline: '2px dashed var(--purple, #5C4EFA)' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
    >
      <Div
        id={`${uniqueId}-content`}
        parentId={`${uniqueId}-content`}
        styles={contentContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
      >
        {renderContainerChildren(`${uniqueId}-content`)}
      </Div>
      <Div
        id={`${uniqueId}-buttons`}
        parentId={`${uniqueId}-buttons`}
        styles={buttonsContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
      >
        {renderContainerChildren(`${uniqueId}-buttons`)}
      </Div>
      <Div
        id={`${uniqueId}-image`}
        parentId={`${uniqueId}-image`}
        styles={imageContainerStyles}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-image`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-image`)}
      >
        {renderContainerChildren(`${uniqueId}-image`)}
      </Div>
    </Section>
  );
});

export default SectionOne;
