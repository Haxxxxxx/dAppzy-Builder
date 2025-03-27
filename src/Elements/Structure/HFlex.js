import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const HFlexLayout = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const hFlexElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children = [] } = hFlexElement;
  const hFlexRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: hFlexRef,
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
    setSelectedElement({ id, type: 'hflex', styles });
  };

  return (
    <div
      id={id}
      ref={(node) => {
        hFlexRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: styles.justifyContent || 'flex-start',
        alignItems: styles.alignItems || 'center',
        padding: styles.padding || '10px',
      }}
    >
      {children.length === 0 ? (
        <div
          className="empty-placeholder"
          style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', width: '100%', fontFamily:'Montserrat' }}
        >
          Empty Horizontal Flex Layout – Drop items here
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

export default HFlexLayout;
