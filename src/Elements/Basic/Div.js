import React, { useContext, useRef } from 'react';
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
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);

  let divElement = elements.find((el) => el.id === id);
  const contextStyles = (divElement && divElement.styles) || {};
  const contextChildren = (divElement && divElement.children) || [];

  const styles = { ...passedStyles, ...contextStyles };
  const childrenToRender = passedChildren !== undefined ? passedChildren : contextChildren;
  const divRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: divRef,
    onDropItem: (item) => {
      let currentDivElement = elements.find((el) => el.id === id);
      if (!currentDivElement) {
        const newDivElement = { id, type: 'div', styles: passedStyles, children: [], parentId };
        setElements((prev) => [...prev, newDivElement]);
        currentDivElement = newDivElement;
      }
      if (onDropItem) {
        onDropItem(item, id);
      } else {
        const newId = addNewElement(item.type, item.level || 1, null, id);
        setElements((prev) =>
          prev.map((el) => (el.id === id ? { ...el, children: [...el.children, newId] } : el))
        );
      }
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!divElement) {
      const newDivElement = { id, type: 'div', styles: passedStyles, children: [], parentId };
      setElements((prev) => [...prev, newDivElement]);
      setSelectedElement(newDivElement);
      divElement = newDivElement;
    } else {
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

  return (
    <div
      id={id}
      ref={(node) => {
        divRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
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
        (Array.isArray(childrenToRender) && childrenToRender.length === 0)) ? (
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
          {isOverCurrent
            ? 'Drop here – element will be dropped here and nowhere else'
            : 'Empty Div – Drop items here'}
        </div>
      ) : Array.isArray(childrenToRender) ? (
        childrenToRender.map((child) => {
          if (React.isValidElement(child)) {
            return child;
          } else {
            const childEl = elements.find((el) => el === child || el.id === child);
            return renderElement({ handleOpenMediaPanel }, childEl, elements, selectedElement);
          }
        })
      ) : (
        childrenToRender
      )}
    </div>
  );
};

export default Div;
