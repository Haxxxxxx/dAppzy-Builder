import React, { useContext, useMemo, useRef, forwardRef } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';

import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { sectionTwoStyles } from './defaultSectionStyles';
import { Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import DropInsertionLine from '../../../components/DropInsertionLine';

const SectionTwo = forwardRef(({
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
    // Simple drop handler that just adds the element
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

          // Get configuration from structureConfigurations
          const config = structureConfigurations.sectionTwo || {};
          const configStyles = config.styles || {};

          let renderedChild;

          // For image elements, ensure proper style merging
          if (child.type === 'image') {
            const imageStyles = {
              ...sectionTwoStyles.image,
              ...(configStyles.image?.img || {}),
              ...(child.styles || {}),
            };

            renderedChild = renderElement(
              {
                ...child,
                styles: imageStyles
              },
              elements,
              null,
              setSelectedElement,
              setElements,
              null,
              undefined,
              null,
              false,
              handleOpenMediaPanel
            );
          } else {
            renderedChild = renderElement(
              child,
              elements,
              null,
              setSelectedElement,
              setElements,
              null,
              undefined,
              null,
              false,
              handleOpenMediaPanel
            );
          }

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
                {renderedChild}
              </div>
            </React.Fragment>
          );
        })}
        {showIndicator && dropIndicatorIndex === container.children.length && <DropInsertionLine />}
      </>
    );
  };

  // Get container elements
  const labelContainer = findElementById(`${uniqueId}-label`, elements);
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
  const imageContainer = findElementById(`${uniqueId}-image`, elements);
  const cardsContainer = findElementById(`${uniqueId}-cards`, elements);

  // Get configuration from structureConfigurations
  const config = structureConfigurations.sectionTwo || {};
  const configStyles = config.styles || {};

  // Merge styles for containers
  const labelStyles = {
    ...sectionTwoStyles.labelContainer,
    ...(configStyles.label || {}),
    ...(labelContainer?.styles || {}),
  };

  const contentStyles = {
    ...sectionTwoStyles.contentWrapper,
    ...(configStyles.content || {}),
    ...(contentContainer?.styles || {}),
  };

  const buttonsStyles = {
    ...sectionTwoStyles.buttonContainer,
    ...(configStyles.buttons || {}),
    ...(buttonsContainer?.styles || {}),
  };


  const cardsStyles = {
    ...(configStyles.cards || {}),
    ...(cardsContainer?.styles || {}),
  };

  // Merge styles for section
  const mergedSectionStyles = {
    ...sectionTwoStyles.section,
    ...(configStyles.section || {}),
    ...(sectionElement?.styles || {}),
  };

  // Get wrapper styles from configuration
  const wrapperStyles = {
    ...(configStyles.wrapper || {}),
  };

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
        {labelContainer && (
          <Div
            id={`${uniqueId}-label`}
            parentId={`${uniqueId}-label`}
            styles={labelStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-label`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-label`)}
          >
            {renderContainerChildren(`${uniqueId}-label`)}
          </Div>
        )}
        {contentContainer && (
          <Div
            id={`${uniqueId}-content`}
            parentId={`${uniqueId}-content`}
            styles={contentStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
          >
            {renderContainerChildren(`${uniqueId}-content`)}
          </Div>
        )}
        {buttonsContainer && (
          <Div
            id={`${uniqueId}-buttons`}
            parentId={`${uniqueId}-buttons`}
            styles={buttonsStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
          >
            {renderContainerChildren(`${uniqueId}-buttons`)}
          </Div>
        )}
        
        {cardsContainer && (
          <Div
            id={`${uniqueId}-cards`}
            parentId={`${uniqueId}-cards`}
            styles={cardsStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-cards`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-cards`)}
          >
            {renderContainerChildren(`${uniqueId}-cards`)}
          </Div>
        )}
      </div>
    </Section>
  );
});

export default SectionTwo;
