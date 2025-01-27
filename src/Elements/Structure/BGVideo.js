import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const BGVideo = ({ id, handleOpenMediaPanel }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const videoElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = videoElement || {};
  const containerRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: containerRef,
    onDropItem: (item, parentId) => {
      // Add a new child element into this bg-video container
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
    // Only select if the user clicked on the BGVideo container itself
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      setSelectedElement({ id, type: 'bgVideo', styles });
    }
  };

  return (
    <div
      id={id}
      ref={(node) => {
        containerRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        position: 'relative',
        padding: styles.padding || '10px',
        margin: styles.margin || '10px 0',
        // You might also want a default minHeight so you can see the video
        minHeight: styles.minHeight || '200px',
      }}
    >
      {/* Actual background video, if a video URL is provided */}
      {styles.backgroundUrl && (
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
            zIndex: -1, // behind the children
          }}
        />
      )}

      {/* Render child elements inside this container */}
      {children.map((childId) => {
        const childElement = elements.find((el) => el.id === childId);
        return renderElement(
          { handleOpenMediaPanel },
          childElement,
          elements,
          selectedElement
        );
      })}
    </div>
  );
};

export default BGVideo;
