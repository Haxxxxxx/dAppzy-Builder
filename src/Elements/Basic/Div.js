import React, { useContext, useRef, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import { divConfigurations } from '../../utils/UnifiedDropZone';
import './css/EmptyState.css';

const Div = ({
  id,
  parentId = null,
  handleOpenMediaPanel,
  styles: passedStyles = {},
  children: passedChildren,
  onDropItem,
}) => {
  const { selectedElement, setSelectedElement, elements, addNewElement } = useContext(EditableContext);
  const [showDivOptions, setShowDivOptions] = useState(false);
  let divElement = elements.find((el) => el.id === id);
  const contextStyles = (divElement && divElement.styles) || {};
  const contextChildren = (divElement && divElement.children) || [];
  const childrenToRender = passedChildren !== undefined ? passedChildren : contextChildren;
  const styles = { ...passedStyles, ...contextStyles };
  const divRef = useRef(null);

  // Set up drop target.
  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: divRef,
    onDropItem: (item) => {
      console.log('Div drop triggered for id:', id, 'with item:', item);
      if (onDropItem) {
        onDropItem(item, id);
      } else if (item.flexConfig) {
        // Handle flex configuration drops
        handleDivSelect(item.flexConfig);
      } else {
        addNewElement(item.type, item.level || 1, null, id);
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
          console.error('Video background failed to load:', e);
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

  return (
    <div
      id={id}
      ref={(node) => {
        divRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      onDrop={(e) => e.stopPropagation()}
      style={{
        ...styles,
        padding: styles.padding || '10px',
        margin: styles.margin || '10px 0',
        position: 'relative',
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
    >
      {backgroundStyle}
      {(!childrenToRender ||
        (Array.isArray(childrenToRender) && nonPlaceholderChildren.length === 0)) ? (
        <div
          className="empty-state-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100px',
            background: isOverCurrent ? '#f0f0f0' : 'transparent',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {showDivOptions ? (
            <div className="inline-div-options-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', width: '100%', padding: '16px' }}>
              {divConfigurations.map((config) => (
                <div
                  key={config.id}
                  className="inline-div-option"
                  onClick={(e) => { e.stopPropagation(); handleDivSelect(config); }}
                  style={{
                    cursor: 'pointer',
                    background: '#e5e8ea',
                    borderRadius: '6px',
                    padding: '8px',
                    minWidth: '60px',
                    minHeight: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    border: '2px solid #e5e8ea',
                    transition: 'border 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '2px solid #bfc5c9';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '2px solid #e5e8ea';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {config.preview}
                  <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', textAlign: 'center' }}>{config.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <button
                className="add-element-button"
                onClick={handleAddElement}
                style={{
                  background: 'var(--purple)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '40px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <span className="plus-icon">+</span>
                <span>Add Layout</span>
              </button>
              <div style={{ fontSize: '12px', color: '#666' }}>
                or drag and drop elements here
              </div>
            </>
          )}
        </div>
      ) : Array.isArray(childrenToRender) ? (
        childrenToRender.map(child => {
          if (React.isValidElement(child)) {
            return child;
          } else {
            const childEl = elements.find(el => el === child || el.id === child);
            return renderElement({ handleOpenMediaPanel }, childEl, elements, selectedElement);
          }
        })
      ) : (
        childrenToRender
      )}

      {/* Overlay drop zone for new elements */}
      {isDragging && !item?.id && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(77, 112, 255, 0.1)',
            border: '2px dashed #4D70FF',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <span style={{ 
            background: '#4D70FF',
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
