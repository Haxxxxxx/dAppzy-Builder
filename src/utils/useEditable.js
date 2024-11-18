// src/hooks/useEditable.js
import { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const useEditable = (id, type) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const elementData = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = elementData;
  const ref = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type, styles });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText || e.target.value);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && ref.current) {
      ref.current.focus();
    }
  }, [selectedElement, id]);

  return {
    ref,
    content,
    styles,
    selected: selectedElement?.id === id,
    handleSelect,
    handleBlur,
  };
};

export default useEditable;
