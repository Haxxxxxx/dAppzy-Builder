import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const Div = ({ id, parentId = null, handleOpenMediaPanel, styles: passedStyles = {}, children: passedChildren }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  let divElement = elements.find((el) => el.id === id);
  const contextStyles = (divElement && divElement.styles) || {};
  const contextChildren = (divElement && divElement.children) || [];
  
  // Merge passed styles (used in layout) with context styles; passedStyles take precedence.
  const styles = { ...passedStyles, ...contextStyles };

  // If children are passed as React nodes, use them; otherwise, fall back to contextChildren.
  const childrenToRender = passedChildren !== undefined ? passedChildren : contextChildren;

  const divRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: divRef,
    onDropItem: (item, parentId) => {
      const newId = addNewElement(item.type, item.level || 1, null, parentId);
      setElements((prev) =>
        prev.map((el) =>
          el.id === parentId
            ? { ...el, children: [...new Set([...el.children, newId])] }
            : el
        )
      );
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!divElement) {
      // Create a new element with the parentId if provided.
      const newDivElement = { id, type: 'div', styles: passedStyles, children: [], parentId };
      setElements((prev) => [...prev, newDivElement]);
      setSelectedElement(newDivElement);
      divElement = newDivElement; // update our local reference
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
      }}
    >
      {backgroundStyle}
      {Array.isArray(childrenToRender)
        ? childrenToRender.map((child) => {
            // If passed children are React nodes, render them directly.
            // Otherwise, assume they are IDs from context.
            if (React.isValidElement(child)) {
              return child;
            } else {
              const childEl = elements.find((el) => el === child || el.id === child);
              return renderElement({ handleOpenMediaPanel }, childEl, elements, selectedElement);
            }
          })
        : childrenToRender}
    </div>
  );
};

export default Div;
