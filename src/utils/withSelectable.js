import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const withSelectable = (WrappedComponent) => {
  return (props) => {
    const { id } = props;
    const {
      selectedElement,
      setSelectedElement,
      handleRemoveElement,
    } = useContext(EditableContext);

    const isSelected = selectedElement?.id === id;

    const handleSelect = (e) => {
      e.stopPropagation();
      // When selected, we set the selected element.
      setSelectedElement({ id, type: props.type });
    };

    const handleRemove = (e) => {
      e.stopPropagation();
      handleRemoveElement(id);
    };

    // When selected, force a blue outline border.
    const forcedSelectedStyle = isSelected
      ? { outline: '2px solid var(----purple, #5C4EFA)'}
      : {};

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
        <div
          onClick={handleSelect}
          style={{
            position: 'relative',
            ...forcedSelectedStyle,
            boxSizing: 'border-box',
          }}
        >
          <WrappedComponent {...props} />
        </div>
      </>
    );
  };
};

export default withSelectable;
