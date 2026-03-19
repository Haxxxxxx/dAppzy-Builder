import React, { useContext, useRef, useState, useCallback } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import useReorderDrop from '../../utils/useReorderDrop';
import { divConfigurations } from '../../utils/UnifiedDropZone';
import DropInsertionLine from '../../components/DropInsertionLine';
import './css/EmptyState.css';

const Div = ({
  id,
  parentId = null,
  handleOpenMediaPanel,
  styles: passedStyles = {},
  children: passedChildren,
  onDropItem,
  onDragOver: propDragOver,
  onDrop: propDrop,
  onDragLeave: propDragLeave,
  onClick: propOnClick,
}) => {
  const { selectedElement, setSelectedElement, elements, setElements, addNewElement, findElementById } = useContext(EditableContext);
  const [showDivOptions, setShowDivOptions] = useState(false);
  let divElement = elements.find((el) => el.id === id);
  const contextStyles = (divElement && divElement.styles) || {};
  const contextChildren = (divElement && divElement.children) || [];
  const childrenToRender = passedChildren !== undefined ? passedChildren : contextChildren;
  const styles = { ...passedStyles, ...contextStyles };
  const divRef = useRef(null);

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

  // Set up drop target.
  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: divRef,
    onDropItem: (item) => {
      if (onDropItem) {
        onDropItem(item, id);
      } else if (item.flexConfig) {
        // Handle flex configuration drops
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
    if (divElement) {
      setSelectedElement(divElement);
    }
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

  const backgroundStyle =
    styles.backgroundType === 'video' && styles.backgroundUrl ? (
      <video
        src={styles.backgroundUrl}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: styles.backgroundSize || 'cover',
          objectPosition: styles.backgroundPosition || 'center',
          zIndex: -1,
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    ) : styles.backgroundType === 'image' && styles.backgroundUrl ? (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${styles.backgroundUrl})`,
          backgroundSize: styles.backgroundSize || 'cover',
          backgroundPosition: styles.backgroundPosition || 'center',
          backgroundRepeat: styles.backgroundRepeat || 'no-repeat',
          filter: styles.backgroundFilter || 'none',
          opacity: styles.backgroundOpacity || 1,
          zIndex: -1,
        }}
      />
    ) : null;

  // Filter out any drop placeholders from children.
  const nonPlaceholderChildren =
    Array.isArray(childrenToRender) &&
    childrenToRender.filter(child =>
      !(child && child.props && child.props.className && child.props.className.includes('drop-placeholder'))
    );

  const handleAddElement = (e) => {
    e.stopPropagation();
    setShowDivOptions(true);
  };

  // Whether to show the insertion indicator for this container
  const showIndicator = isReorderDragging && dropIndicatorContainerId === id;
  const isEmpty = !childrenToRender || (Array.isArray(childrenToRender) && nonPlaceholderChildren.length === 0);

  return (
    <div
      id={id}
      ref={(node) => {
        divRef.current = node;
        drop(node);
      }}
      onClick={propOnClick || handleSelect}
      onDragOver={propDragOver || ((e) => reorderDragOver(e, id, null, false, divRef))}
      onDrop={propDrop || ((e) => { reorderDrop(e, id); e.stopPropagation(); })}
      onDragLeave={propDragLeave || reorderDragLeave}
      className={isOverCurrent ? 'container-drop-hover' : ''}
      style={{
        ...styles,
        ...(isEmpty ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } : {}),
        padding: styles.padding || '10px',
        margin: styles.margin || '0',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {backgroundStyle}
      {(!childrenToRender ||
        (Array.isArray(childrenToRender) && nonPlaceholderChildren.length === 0)) ? (
        <div className="empty-state-container">
          <span className="empty-state-badge">Div</span>
          {showDivOptions ? (
            <div className="layout-options-grid">
              {divConfigurations.map((config) => (
                <div
                  key={config.id}
                  className="layout-option"
                  onClick={(e) => { e.stopPropagation(); handleDivSelect(config); }}
                >
                  {config.preview}
                  <div className="layout-option-label">{config.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <button className="add-element-btn" onClick={handleAddElement}>
                <span className="plus-icon">+</span>
                <span>Add Layout</span>
              </button>
              <div className="empty-state-hint">or drag and drop elements here</div>
            </>
          )}
        </div>
      ) : Array.isArray(childrenToRender) ? (
        childrenToRender.map((child, idx) => {
          const childEl = React.isValidElement(child) ? null : elements.find(el => el === child || el.id === child);
          const childId = childEl?.id || (React.isValidElement(child) ? child.key : null);
          const rendered = React.isValidElement(child)
            ? child
            : renderElement(
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
      ) : (
        childrenToRender
      )}
      {/* Indicator at end position */}
      {showIndicator && dropIndicatorIndex === (Array.isArray(childrenToRender) ? childrenToRender.length : 0) && (
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

export default Div;
