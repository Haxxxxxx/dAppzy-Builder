// src/utils/withSelectable.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const withSelectable = (WrappedComponent) => {
  return (props) => {
    const { id } = props;
    const { selectedElement, setSelectedElement, selectedStyle, handleRemoveElement } =
      useContext(EditableContext);
    const isSelected = selectedElement?.id === id;

    const handleSelect = (e) => {
      e.stopPropagation(); // Prevent bubbling to parent elements
      setSelectedElement({ id, type: props.type, styles: props.styles });
    };

    const handleRemove = (e) => {
      e.stopPropagation(); // Prevent triggering the select event
      handleRemoveElement(id);
    };

    return (
      <div
        id={id}
        onClick={handleSelect}
        style={{
          width: 'auto',
          position: 'relative',
          boxSizing: 'border-box', // Ensure the element size stays consistent
          cursor:'text',
          ...props.styles,
          ...(isSelected ? selectedStyle : {}),
        }}
      >
        {/* Display the ID and delete button */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '-30px', // Position above the element
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#4D70FF',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '5px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 1000,
              maxWidth: '200px', // Max width of the label
              whiteSpace: 'nowrap', // Prevent wrapping
              overflow: 'hidden', // Hide overflow
              textOverflow: 'ellipsis', // Add ellipsis for overflow text
            }}
          >
            <span
              style={{
                flex: 1, // Allow ID to take up as much space as possible
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={id} // Tooltip for full ID
            >
              {id}
            </span>
            <span
              className="material-symbols-outlined"
              onClick={handleRemove}
              style={{
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1rem',
                pointerEvents: 'all', // Ensure the icon is clickable
                marginLeft: '8px',
              }}
              title="Remove element"
            >
              delete
            </span>
          </div>
        )}

       
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withSelectable;
