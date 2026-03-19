import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const FileUpload = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Drop files here or click to upload', styles = {} } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'fileUpload' });
  };

  const borderColor = styles.borderColor || '#d0d0d0';
  const activeColor = styles.activeColor || '#5C4EFA';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        border: `2px dashed ${borderColor}`,
        borderRadius: styles.borderRadius || '8px',
        padding: styles.padding || '32px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: styles.backgroundColor || '#fafafa',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
        width: styles.width || '100%',
        fontFamily: styles.fontFamily || 'inherit',
        ...styles,
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📁</div>
      <div style={{
        fontSize: styles.fontSize || '14px',
        color: styles.color || '#666',
        marginBottom: '8px',
      }}>
        {content}
      </div>
      <div style={{
        fontSize: '12px',
        color: activeColor,
        fontWeight: '500',
      }}>
        Browse Files
      </div>
    </div>
  );
};

export default FileUpload;
