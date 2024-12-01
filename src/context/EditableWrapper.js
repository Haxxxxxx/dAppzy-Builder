import React, { useContext } from 'react';
import { EditableContext } from './EditableContext';

const EditableWrapper = ({ id, children, type, defaultContent, parentId }) => {
  const { handleRemoveElement, addNewElement, setElements } = useContext(EditableContext);

  const addChildElement = () => {
    const newId = addNewElement(type, 1, null, parentId, { content: defaultContent });
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId
          ? { ...el, children: [...new Set([...el.children, newId])] }
          : el
      )
    );
  };

  return (
    <div style={{ position: 'relative', margin: '8px 0' }}>
      {children}

      {/* Add and Remove Buttons */}
      <button
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
        }}
        onClick={() => handleRemoveElement(id)}
      >
        ✕
      </button>

      {type && (
        <button
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: '#61dafb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={addChildElement}
        >
          Add {type}
        </button>
      )}
    </div>
  );
};

export default EditableWrapper;
