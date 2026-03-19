import React, { useContext, useRef, forwardRef, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import useReorderDrop from '../../utils/useReorderDrop';
import DropInsertionLine from '../../components/DropInsertionLine';
import '../Basic/css/EmptyState.css';
import { divConfigurations } from '../../utils/UnifiedDropZone';
import { VFLEX_LAYOUT } from '../../constants/elementTypes';

const Section = forwardRef(({
  id,
  parentId = null,
  handleOpenMediaPanel,
  styles: passedStyles = {},
  children: passedChildren,
  onDropItem,
  onClick: extraOnClick,
}, ref) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements, findElementById } = useContext(EditableContext);
  const [showDivOptions, setShowDivOptions] = useState(false);

  let sectionElement = elements.find((el) => el.id === id);
  const contextStyles = (sectionElement && sectionElement.styles) || {};
  const contextChildren = (sectionElement && sectionElement.children) || [];

  const styles = { ...passedStyles, ...contextStyles };
  const childrenToRender = passedChildren !== undefined ? passedChildren : contextChildren;
  const sectionRef = useRef(null);

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

  // Use drag layer to check if the currently dragged item is new (react-dnd).
  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: sectionRef,
    onDropItem: (item) => {
      let currentSection = elements.find((el) => el.id === id);
      if (!currentSection) {
        const newSectionElement = { id, type: 'section', styles: passedStyles, children: [], parentId };
        setElements((prev) => [...prev, newSectionElement]);
        currentSection = newSectionElement;
      }
      if (onDropItem) {
        onDropItem(item, id);
      } else {
        // addNewElement with parentId already updates the parent's children array
        addNewElement(item.type, item.level || 1, null, id, item.children ? item : null);
      }
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!sectionElement) {
      const newSectionElement = { id, type: 'section', styles: passedStyles, children: [], parentId };
      setElements((prev) => [...prev, newSectionElement]);
      setSelectedElement(newSectionElement);
      sectionElement = newSectionElement;
    } else {
      setSelectedElement(sectionElement);
    }
    if (typeof extraOnClick === 'function') {
      extraOnClick(e);
    }
  };

  const handleAddElement = (e) => {
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleDivSelect = (config) => {
    // Create flex elements recursively
    const createFlexElement = (config, parentId = null) => {
      const id = addNewElement(config.parentType || config.type, 1, 0, parentId, {
        styles: { gap: '12px', padding: '12px', display: 'flex', flexDirection: config.direction }
      });
      if (config.children && config.children.length > 0) {
        config.children.forEach(child => {
          if (child.children) {
            createFlexElement({ ...child, parentType: child.type, direction: child.type === VFLEX_LAYOUT ? 'column' : 'row' }, id);
          } else {
            addNewElement(child.type, 1, 0, id, {
              styles: { flex: 1, gap: '8px', padding: '8px', display: 'flex', flexDirection: child.type === VFLEX_LAYOUT ? 'column' : 'row' }
            });
          }
        });
      }
      return id;
    };

    createFlexElement(config, id);
    setShowDivOptions(false);
  };

  const backgroundContent =
    styles.backgroundType === 'video' && styles.backgroundUrl ? (
      <video
        src={styles.backgroundUrl}
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
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
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        }}
      />
    ) : null;

  // Whether to show the insertion indicator for this container
  const showIndicator = isReorderDragging && dropIndicatorContainerId === id;
  const isEmpty = !childrenToRender || (Array.isArray(childrenToRender) && childrenToRender.length === 0);

  return (
    <section
      id={id}
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
      onClick={handleSelect}
      onDragOver={(e) => reorderDragOver(e, id, null, false, sectionRef)}
      onDrop={(e) => { reorderDrop(e, id); e.stopPropagation(); }}
      onDragLeave={reorderDragLeave}
      className={isOverCurrent ? 'container-drop-hover' : ''}
      style={{
        ...styles,
        ...(isEmpty ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } : {}),
        position: 'relative',
        padding: styles.padding || '10px',
        margin: styles.margin || '0',
        boxSizing: 'border-box',
      }}
    >
      {backgroundContent}
      {(!childrenToRender ||
        (Array.isArray(childrenToRender) && childrenToRender.length === 0)) ? (
        <div className="empty-state-container">
          <span className="empty-state-badge">Section</span>
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
      ) : Array.isArray(childrenToRender) ? (
        childrenToRender.map((child, idx) => {
          const childEl = React.isValidElement(child) ? null : elements.find((el) => el === child || el.id === child);
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

          // Pre-rendered React elements passed by a parent component (e.g. HeroOne passing Div nodes)
          // are not in the element store, so skip the draggable wrapper — the parent owns reordering.
          if (!childEl && React.isValidElement(child)) {
            return (
              <React.Fragment key={childId || idx}>
                {rendered}
              </React.Fragment>
            );
          }

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
    </section>
  );
});

Section.displayName = 'Section';

export default Section;
