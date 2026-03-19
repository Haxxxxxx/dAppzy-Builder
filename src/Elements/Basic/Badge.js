import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Badge = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Badge', styles = {} } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'badge' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      updateContent(id, e.target.innerText.trim() || 'Badge');
    }
  };

  return (
    <span
      id={id}
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{
        display: 'inline-block',
        padding: styles.padding || '4px 12px',
        fontSize: styles.fontSize || '12px',
        fontWeight: styles.fontWeight || '600',
        fontFamily: styles.fontFamily || 'Montserrat',
        color: styles.color || '#fff',
        backgroundColor: styles.backgroundColor || '#5c4efa',
        borderRadius: styles.borderRadius || '999px',
        lineHeight: '1.4',
        cursor: 'text',
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {content}
    </span>
  );
};

export default Badge;
