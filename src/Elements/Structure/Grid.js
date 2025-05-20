import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import '../Basic/css/EmptyState.css';

const GridLayout = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } =
    useContext(EditableContext);
  const gridElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children = [] } = gridElement;
  const gridRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: gridRef,
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
    setSelectedElement({ id, type: 'gridLayout', styles });
  };

  const handleAddElement = (e) => {
    e.stopPropagation();
    // Deselect the current element
    setSelectedElement(null);
    
    // Switch back to elements view
    const switchToElementsEvent = new CustomEvent('switchToElementsView');
    window.dispatchEvent(switchToElementsEvent);
    
    // Trigger element panel opening
    const openPanelEvent = new CustomEvent('openElementPanel', {
      detail: { parentId: id }
    });
    window.dispatchEvent(openPanelEvent);
  };

  return (
    <div
      id={id}
      ref={(node) => {
        gridRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        display: 'grid',
        gridTemplateColumns: styles.gridTemplateColumns || 'repeat(4, 1fr)',
        gridGap: styles.gridGap || '1.5rem',
        padding: styles.padding || '10px',
        width: '100%',
        position: 'relative'
      }}
    >
      {children.length === 0 ? (
        <div
          className="empty-state-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100px',
            background: isOverCurrent ? '#f0f0f0' : 'transparent',
            gridColumn: '1 / -1'
          }}
        >
          <button
            className="add-element-button"
            onClick={handleAddElement}
          >
            <span className="plus-icon">+</span>
          </button>
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

export default GridLayout;
