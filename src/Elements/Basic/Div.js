import React, { useContext, useRef } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const Div = ({
  id,
  parentId = null,
  handleOpenMediaPanel,
  styles: passedStyles = {},
  children: passedChildren,
  onDropItem,
}) => {
  const { selectedElement, setSelectedElement, elements, addNewElement } = useContext(EditableContext);
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

  const backgroundStyle =
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

  // Filter out any drop placeholders from children.
  const nonPlaceholderChildren =
    Array.isArray(childrenToRender) &&
    childrenToRender.filter(child =>
      !(child && child.props && child.props.className && child.props.className.includes('drop-placeholder'))
    );

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
          className="empty-placeholder"
          style={{
            color: '#888',
            fontStyle: 'italic',
            textAlign: 'center',
            fontFamily: 'Montserrat',
            padding: '10px',
            background: isOverCurrent ? '#f0f0f0' : 'transparent',
          }}
        >
          {isOverCurrent ? 'Drop here – element will be dropped here and nowhere else' : 'Empty Div – Drop items here'}
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

      {/* Overlay drop zone for new elements: show only if a new item (no id) is being dragged */}
      {isDragging && item && !item.id && (
        <div
          style={{
            ...styles,
            padding: styles.padding || '10px',
            margin: styles.margin || '10px 0',
            position: 'relative',
            ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onDropItem) {
              onDropItem(item, id);
            }
          }}
        >
          <span style={{ display: 'block', textAlign: 'center', color: '#4D70FF' }}>
            Drop your new element here
          </span>
        </div>
      )}
    </div>
  );
};

export default Div;
