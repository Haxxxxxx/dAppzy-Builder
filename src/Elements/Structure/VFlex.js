import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';

const VFlexLayout = ({ id }) => {
    const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
    const vFlexElement = elements.find((el) => el.id === id) || {};
    const { styles = {}, children = [] } = vFlexElement;
    const vFlexRef = useRef(null);
  
    const { isOverCurrent, drop } = useElementDrop({
      id,
      elementRef: vFlexRef,
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
      setSelectedElement({ id, type: 'vflex', styles });
    };
  
    return (
      <div
        id={id}
        ref={(node) => {
          vFlexRef.current = node;
          drop(node);
        }}
        onClick={handleSelect}
        style={{
          ...styles,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: styles.justifyContent || 'flex-start',
          alignItems: styles.alignItems || 'stretch',
          padding: styles.padding || '10px',
        }}
      >
        {children.map((childId) =>
          renderElement(
            elements.find((el) => el.id === childId),
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            selectedElement
          )
        )}
      </div>
    );
  };
  
  export default VFlexLayout;
  