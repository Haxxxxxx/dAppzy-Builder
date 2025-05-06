import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const Section = ({
  id,
  parentId = null,
  handleOpenMediaPanel,
  styles: passedStyles = {},
  children: passedChildren,
  onDropItem,
  onClick: extraOnClick,
}) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);

  let sectionElement = elements.find((el) => el.id === id);
  const contextStyles = (sectionElement && sectionElement.styles) || {};
  const contextChildren = (sectionElement && sectionElement.children) || [];

  const styles = { ...contextStyles, ...passedStyles };
  const childrenToRender = passedChildren !== undefined ? passedChildren : contextChildren;
  const sectionRef = useRef(null);

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
        // Create new element and update section's children with its new id
        const newId = addNewElement(item.type, item.level || 1, null, id);
        setElements((prev) =>
          prev.map((el) =>
            el.id === id ? { ...el, children: [...el.children, newId] } : el
          )
        );
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
        margin: styles.margin || '0',
        backgroundColor: isOverCurrent ? 'rgba(0, 0, 0, 0.1)' : styles.backgroundColor || 'transparent',
      }}
    >
      {backgroundContent}
      {(!childrenToRender ||
        (Array.isArray(childrenToRender) && childrenToRender.length === 0)) ? (
        <div className="empty-placeholder" style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', fontFamily:'Montserrat' }}>
          Empty Section – Drop items here
        </div>
      ) : Array.isArray(childrenToRender) ? (
        childrenToRender.map((child, index) => {
          if (React.isValidElement(child)) {
            return child;
          } else {
            const childEl = elements.find((el) => el === child || el.id === child);
            return renderElement(
              childEl,
              elements,
              null,
              setSelectedElement,
              setElements,
              null,
              selectedElement,
              handleOpenMediaPanel
            );
          }
        })
      ) : (
        childrenToRender
      )}
    </section>
  );
};

export default Section;
