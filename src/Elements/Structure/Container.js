import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const Container = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } =
    useContext(EditableContext);
  const containerElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children = [] } = containerElement;
  const containerRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: containerRef,
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
    setSelectedElement({ id, type: 'container', styles });
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
        display: 'block',
        position: 'relative',
        padding: styles.padding || '10px',
        margin: styles.margin || '10px auto',
        maxWidth: styles.maxWidth || '1200px',
      }}
    >
      {children.length === 0 ? (
        <div
          className="empty-placeholder"
          style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', fontFamily:'Montserrat' }}
        >
          Empty Container – Drop items here
        </div>
      ) : (
        children.map((childId) =>
          renderElement(
            elements.find((el) => el.id === childId),
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            selectedElement
          )
        )
      )}
    </div>
  );
};

export default Container;
