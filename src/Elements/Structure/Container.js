import React, { useContext, useRef, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import useReorderDrop from '../../utils/useReorderDrop';
import DropInsertionLine from '../../components/DropInsertionLine';
import '../Basic/css/EmptyState.css';
import { divConfigurations } from '../../utils/UnifiedDropZone';

const Container = ({ id, handleOpenMediaPanel }) => {
  const { selectedElement, setSelectedElement, elements, setElements, addNewElement, findElementById } =
    useContext(EditableContext);
  const containerElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children = [] } = containerElement;
  const containerRef = useRef(null);
  const [showDivOptions, setShowDivOptions] = useState(false);

  // Reorder drag & drop within this container
  const {
    isDragging: isReorderDragging,
    draggedId: reorderDraggedId,
    dropIndicatorIndex,
    dropIndicatorContainerId,
    onDragStart: reorderDragStart,
    onDragOver: reorderDragOver,
    onDrop: reorderDrop,
    onDragEnd: reorderDragEnd,
    onDragLeave: reorderDragLeave,
  } = useReorderDrop(findElementById, elements, setElements);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: containerRef,
    onDropItem: (item) => {
      if (item.flexConfig) {
        handleDivSelect(item.flexConfig);
      } else {
        addNewElement(item.type, item.level || 1, null, id, item.children ? item : null);
      }
    },
  });

  // Use drag layer to check if the currently dragged item is new.
  const { item, isDragging } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
  }));

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(containerElement.id ? containerElement : { id, type: 'container', styles, children });
  };

  const handleAddElement = (e) => {
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleDivSelect = (config) => {
    // Helper to create an element and its children
    const createElementInMemory = (config, parentId) => {
      const currentId = addNewElement(
        config.parentType || config.type,
        1,
        null,
        parentId,
        {
          styles: {
            flex: 1,
            gap: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: config.direction,
            position: 'relative',
            boxSizing: 'border-box'
          }
        }
      );

      if (config.children && config.children.length > 0) {
        config.children.forEach(child => {
          const childConfig = {
            ...child,
            parentType: child.type,
            direction: child.type === 'vflexLayout' ? 'column' : 'row'
          };
          createElementInMemory(childConfig, currentId);
        });
      }

      return currentId;
    };

    // Create the structure starting from the container's children
    config.children.forEach(child => {
      const childConfig = {
        ...child,
        parentType: child.type,
        direction: child.type === 'vflexLayout' ? 'column' : 'row'
      };
      createElementInMemory(childConfig, id);
    });

    setShowDivOptions(false);
  };

  // Whether to show the insertion indicator for this container
  const showIndicator = isReorderDragging && dropIndicatorContainerId === id;

  return (
    <div
      id={id}
      ref={(node) => {
        containerRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      onDragOver={(e) => reorderDragOver(e, id, null, false, containerRef)}
      onDrop={(e) => { reorderDrop(e, id); e.stopPropagation(); }}
      onDragLeave={reorderDragLeave}
      className={isOverCurrent ? 'container-drop-hover' : ''}
      style={{
        ...styles,
        ...(children.length === 0
          ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }
          : { display: styles.display || 'block' }),
        position: 'relative',
        padding: styles.padding || '10px',
        margin: styles.margin || '0 auto',
        maxWidth: styles.maxWidth || '1200px',
        boxSizing: 'border-box',
      }}
    >
      {children.length === 0 ? (
        <div className="empty-state-container">
          <span className="empty-state-badge">Container</span>
          {showDivOptions ? (
            <div className="layout-options-grid">
              {divConfigurations.map((config) => (
                <div
                  key={config.id}
                  className="layout-option"
                  onClick={(e) => { e.stopPropagation(); handleDivSelect(config); }}
                >
                  {config.preview}
                  <span className="layout-option-label">{config.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <button
              className="add-element-btn"
              onClick={handleAddElement}
            >
              <span className="plus-icon">+</span>
              Add Layout
            </button>
          )}
        </div>
      ) : (
        children.map((childId, idx) => {
          const childEl = elements.find((el) => el.id === childId);
          const rendered = renderElement(
            childEl,
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            selectedElement,
            null,
            true,
            handleOpenMediaPanel
          );

          return (
            <React.Fragment key={childId || idx}>
              {showIndicator && dropIndicatorIndex === idx && (
                <DropInsertionLine />
              )}
              <div
                draggable={!!childId && !isDragging}
                onDragStart={childId && !isDragging ? (e) => reorderDragStart(e, childId, id) : undefined}
                onDragEnd={reorderDragEnd}
                style={{
                  cursor: childId && !isDragging ? 'grab' : 'default',
                  opacity: reorderDraggedId === childId ? 0.4 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {rendered}
              </div>
            </React.Fragment>
          );
        })
      )}
      {/* Indicator at end position */}
      {showIndicator && dropIndicatorIndex === children.length && (
        <DropInsertionLine />
      )}

      {/* Overlay drop zone for new elements — only when hovering this specific container */}
      {isDragging && !item?.id && isOverCurrent && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(77, 112, 255, 0.1)',
            border: '2px dashed var(--purple, #5C4EFA)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <span style={{
            background: 'var(--purple, #5C4EFA)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Drop here to add
          </span>
        </div>
      )}
    </div>
  );
};

export default Container;
