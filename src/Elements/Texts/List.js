// src/components/EditableList.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const ListItem = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, addNewElement, setElements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = '', parentId } = element || {};
  const isSelected = selectedElement?.id === id;
  const itemRef = useRef(null);

  useEffect(() => {
    if (!element) {
      console.error(`Element with id ${id} not found in elements.`);
    }
  }, [element, id]);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'list-item' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      updateContent(id, e.target.innerText);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default newline behavior

      if (!parentId) {
        console.error(`Parent ID for element ${id} not found.`);
        return;
      }

      const parentElement = elements.find((el) => el.id === parentId);
      if (!parentElement) {
        console.error(`Parent element with id ${parentId} not found.`);
        return;
      }

      const currentIndex = parentElement.children.findIndex((childId) => childId === id);
      if (currentIndex === -1) {
        console.error(`Element ${id} not found in parent ${parentId} children.`);
        return;
      }

      // Add a new list item
      const newId = addNewElement('list-item', 1, null, parentId);

      // Insert the new element into the parent at the correct position
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? {
                ...el,
                children: [
                  ...el.children.slice(0, currentIndex + 1),
                  newId,
                  ...el.children.slice(currentIndex + 1),
                ],
              }
            : el
        )
      );

      // Automatically select the newly added item
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
      {content || 'Editable Item'}
    </li>
  );
};

const List = ({ id, type = 'ul' }) => {
  const { elements, setSelectedElement, addNewElement, setElements } = useContext(EditableContext);
  const listElement = elements.find((el) => el.id === id);

  useEffect(() => {
    if (listElement && listElement.children.length === 0) {
      // Automatically add a new list item if none exists
      const newItemId = addNewElement('list-item', 1, null, id);
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === id ? { ...el, children: [...el.children, newItemId] } : el
        )
      );
      setSelectedElement({ id: newItemId, type: 'list-item' });
    }
  }, [listElement, id, addNewElement, setElements, setSelectedElement]);

  const { children = [] } = listElement || {};

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type });
  };

  return React.createElement(
    type,
    {
      id,
      onClick: handleSelect,
      style: {
        padding: '8px',
        border: '1px solid #ccc',
        margin: '8px 0',
        listStyleType: type === 'ul' ? 'disc' : 'decimal',
      },
    },
    children.map((childId) => {
      const childElement = elements.find((el) => el.id === childId);
      return childElement ? <ListItem key={childId} id={childId} /> : null;
    })
  );
};

export { List, ListItem };
