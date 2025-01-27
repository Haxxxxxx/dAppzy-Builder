import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const Div = ({ id, handleOpenMediaPanel }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = divElement || {};
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
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      setSelectedElement({ id, type: 'div', styles });
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
    <>
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
        {children.map((childId) =>
          renderElement(
            { handleOpenMediaPanel },
            elements.find((el) => el.id === childId),
            elements,
            selectedElement
          )
        )}
      </div>
    </>
  );
};

export default Div;
