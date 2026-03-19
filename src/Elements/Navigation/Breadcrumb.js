import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Breadcrumb = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content, styles = {} } = element || {};
  const isSelected = selectedElement?.id === id;

  const defaultItems = ['Home', 'Products', 'Current Page'];
  let items;
  try {
    items = typeof content === 'string' ? JSON.parse(content) : (content || defaultItems);
  } catch {
    items = defaultItems;
  }

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'breadcrumb' });
  };

  const handleItemBlur = (e, index) => {
    if (!isSelected) return;
    const updated = [...items];
    updated[index] = e.target.innerText.trim() || `Item ${index + 1}`;
    updateContent(id, JSON.stringify(updated));
  };

  const separator = styles.separator || '/';
  const activeColor = styles.activeColor || '#5C4EFA';

  return (
    <nav
      id={id}
      onClick={handleSelect}
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: styles.gap || '8px',
        fontSize: styles.fontSize || '14px',
        fontFamily: styles.fontFamily || 'inherit',
        padding: styles.padding || '8px 0',
        ...styles,
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleItemBlur(e, i)}
            style={{
              color: i === items.length - 1 ? (styles.color || '#333') : (styles.linkColor || '#666'),
              fontWeight: i === items.length - 1 ? '600' : '400',
              cursor: i < items.length - 1 ? 'pointer' : 'default',
              outline: 'none',
              textDecoration: 'none',
            }}
          >
            {item}
          </span>
          {i < items.length - 1 && (
            <span style={{ color: styles.separatorColor || '#999', userSelect: 'none' }}>
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
