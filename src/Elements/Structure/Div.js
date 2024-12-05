import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import StructureAndElementsModal from '../../utils/SectionQuickAdd/StructureAndElementsModal';
import useElementDrop from '../../utils/useElementDrop';

const Div = ({ id, handleOpenMediaPanel }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = divElement || {};
  const divRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsModalOpen(true);
    }
  };
  
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
          position:'relative',
          backgroundColor: isOverCurrent ? 'rgba(0, 0, 0, 0.1)' : styles.backgroundColor || 'transparent',
        }}
      >
        {children.map((childId) =>
          renderElement( handleOpenMediaPanel={handleOpenMediaPanel}, elements.find((el) => el.id === childId), elements, selectedElement)
        )}
      </div>
      {isModalOpen && (
        <StructureAndElementsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddElement={(type) => {
            const newId = addNewElement(type, 1, null, id);
            setElements((prev) =>
              prev.map((el) =>
                el.id === id ? { ...el, children: [...new Set([...el.children, newId])] } : el
              )
            );
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Div;
