// src/components/withSelectable.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const withSelectable = (WrappedComponent) => {
  return (props) => {
    const { id } = props;
    const {
      selectedElement,
      setSelectedElement,
      selectedStyle,
      handleRemoveElement,
      updateStyles,
    } = useContext(EditableContext);

    const isSelected = selectedElement?.id === id;

    const handleSelect = (e) => {
      e.stopPropagation();
      setSelectedElement({ id, type: props.type, styles: props.styles });
    };

    const handleRemove = (e) => {
      e.stopPropagation();
      handleRemoveElement(id); // <--- triggers removal in local storage too
    };

    const handleStyleChange = (styleKey, value) => {
      updateStyles(id, { [styleKey]: value });
    };

    return (
      <>
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '0',
              zIndex: 1000,
              pointerEvents: 'none',
              backgroundColor: '#4D70FF',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '5px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1500px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={id}
            >
              {id}
            </span>
            <span
              className="material-symbols-outlined"
              onClick={handleRemove}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1rem',
                marginLeft: '8px',
              }}
              title="Remove element"
            >
              delete
            </span>
          </div>
        )}
        <WrappedComponent
          {...props}
          onClick={handleSelect}
          id={id}
          style={{
            ...(props.style || {}),
            position: isSelected ? 'relative' : 'static',
            ...(isSelected ? selectedStyle : {}),
            cursor: 'text',
            boxSizing: 'border-box',
          }}
        />
      </>
    );
  };
};

export default withSelectable;
