import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const ListItem = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, addNewElement, setElements } = useContext(EditableContext);
  // Default to 'Editable Item' if content is empty.
  const element = elements.find((el) => el.id === id);
  const { content = 'Editable Item', parentId } = element || {};
  const isSelected = selectedElement?.id === id;
  const itemRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'list-item', parentId });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      updateContent(id, e.target.innerText.trim() || 'Editable Item');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!parentId) {
        console.error(`Parent ID for element ${id} not found.`);
        return;
      }
      const newId = addNewElement('list-item', 1, null, parentId);
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId ? { ...el, children: [...el.children, newId] } : el
        )
      );
      setSelectedElement({ id: newId, type: 'list-item' });
    }
  };

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.focus();
    }
  }, [isSelected]);

  return (
    <li
      ref={itemRef}
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        cursor: 'text',
        padding: '4px',
        outline: isSelected ? '1px dashed blue' : 'none', 
        fontFamily:'Montserrat'
      }}
    >
      {content}
    </li>
  );
};


const List = ({ id }) => {
  const { elements, setSelectedElement } = useContext(EditableContext);
  const listElement = elements.find((el) => el.id === id);

  const { listType = 'ul', listStyleType, start, reversed } = listElement?.configuration || {};

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'list' });
  };

  const tagName = listType === 'ol' ? 'ol' : 'ul';
  const children = listElement?.children || [];

  const placeholderItem = (
    <li
      style={{
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#888',
        padding: '8px',
      }}
    >
      Empty List – Drop items here
    </li>
  );

  return React.createElement(
    tagName,
    {
      id,
      onClick: handleSelect,
      style: {
        listStyleType: listType === 'ol' ? (listStyleType || 'decimal') : (listStyleType || 'disc'),
      },
      start: listType === 'ol' ? start : undefined,
      reversed: listType === 'ol' ? reversed : undefined,
    },
    children.length === 0 ? placeholderItem : children.map((childId) => <ListItem key={childId} id={childId} />)
  );
};

export { List, ListItem };
