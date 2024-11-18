// src/Elements/Interact/Anchor.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Anchor = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Click here', href = '#' } = element || {};
  const isSelected = selectedElement?.id === id;
  const anchorRef = useRef(null);

  useEffect(() => {
    if (!element) console.error(`Element with id ${id} not found.`);
  }, [element, id]);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'anchor' });
  };

  const handleBlur = (e) => {
    if (isSelected) updateContent(id, e.target.innerText);
  };

  useEffect(() => {
    if (isSelected && anchorRef.current) anchorRef.current.focus();
  }, [isSelected]);

  return (
    <a
      ref={anchorRef}
      href={href}
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{ cursor: 'pointer', color: '#007BFF', textDecoration: 'underline' }}
    >
      {content}
    </a>
  );
};

export default Anchor;
