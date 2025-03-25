import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const Section = ({ id, style: extraStyles = {}, onClick: extraOnClick, children }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const sectionElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children: childrenIds = [] } = sectionElement;
  const sectionRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: sectionRef,
    onDropItem: (item, parentId) => {
      const newId = addNewElement(item.type, item.level || 1, null, parentId);
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? { ...el, children: [...new Set([...el.children, newId])] }
            : el
        )
      );
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'section', styles });
    if (typeof extraOnClick === 'function') {
      extraOnClick(e);
    }
  };

  // Background rendering for video or image if provided in styles
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

  return (
    <section
      id={id}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        position: 'relative',
        padding: styles.padding || '10px',
        margin: styles.margin || '10px 0',
        backgroundColor: isOverCurrent
          ? 'rgba(0, 0, 0, 0.1)'
          : styles.backgroundColor || 'transparent',
        ...extraStyles,
      }}
    >
      {backgroundContent}
      {/* Render children from global state if none are passed directly */}
      {children || childrenIds.map((childId) =>
        renderElement(
          elements.find((el) => el.id === childId),
          elements,
          null, // Assuming contentListWidth is not needed here
          setSelectedElement,
          setElements,
          null, // handlePanelToggle is not defined here
          selectedElement
        )
      )}
    </section>
  );
};

export default Section;
