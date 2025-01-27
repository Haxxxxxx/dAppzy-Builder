// src/components/EditableList.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const ListItem = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, addNewElement, setElements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Editable Item', parentId } = element || {};
  const isSelected = selectedElement?.id === id;
  const itemRef = useRef(null);
  console.log(element);
  useEffect(() => {
    if (!element) {
      console.error(`Element with id ${id} not found in elements.`);
    }
  }, [element, id]);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'list-item', parentId: element.parentId });
    console.log(selectedElement);
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
  
      const newId = addNewElement('list-item', 1, null, parentId); // Pass `parentId`
  
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? {
                ...el,
                children: [...el.children, newId],
              }
            : el
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
      }}
    >
      {content}
    </li>
  );
};

const List = ({ id }) => {
  const { elements, setSelectedElement } = useContext(EditableContext);
  const listElement = elements.find((el) => el.id === id);

  // Default to 'ul' if not set
  const {
    listType = 'ul',    // 'ul' or 'ol'
    listStyleType,
    start,
    reversed,
  } = listElement?.configuration || {};

  const handleSelect = (e) => {
    e.stopPropagation();
    // always: type: 'list'
    setSelectedElement({ id, type: 'list' });
  };

  // Decide the actual HTML tag
  const tagName = listType === 'ol' ? 'ol' : 'ul';

  // Create the element (<ul> or <ol>)
  return React.createElement(
    tagName,
    {
      id,
      onClick: handleSelect,
      style: {
        // If it's <ul>, you might do "disc" as default
        // If it's <ol>, "decimal" as default
        listStyleType: listType === 'ol' ? (listStyleType || 'decimal') : (listStyleType || 'disc'),
      },
      // <ol>-only props:
      start: listType === 'ol' ? start : undefined,
      reversed: listType === 'ol' ? reversed : undefined,
    },
    listElement?.children?.map((childId) => {
      const childElement = elements.find((el) => el.id === childId);
      return childElement ? <ListItem key={childId} id={childId} /> : null;
    })
  );
};

export { List, ListItem };