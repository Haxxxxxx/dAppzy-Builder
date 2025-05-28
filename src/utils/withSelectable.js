import React, { useContext, forwardRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const withSelectable = (WrappedComponent) => {
  const WithSelectable = forwardRef((props, ref) => {
    const { id, type } = props;
    const {
      selectedElement,
      setSelectedElement,
      handleRemoveElement,
    } = useContext(EditableContext);

    const isSelected = selectedElement?.id === id;

    const handleSelect = (e) => {
      e.stopPropagation();
      setSelectedElement({ id, type });
    };

    const handleRemove = (e) => {
      e.stopPropagation();
      handleRemoveElement(id);
    };

    // When selected, force a blue outline border.
    const forcedSelectedStyle = isSelected
      ? { outline: '2px solid var(--purple, #5C4EFA)', borderInline: '0.5px solid var(--purple, #5C4EFA)' }
      : {};

    return (
      <div
        onClick={handleSelect}
        style={{
          position: 'relative',
          ...forcedSelectedStyle,
          boxSizing: 'border-box',
        }}
      >
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              zIndex: 1000,
              pointerEvents: 'none',
              backgroundColor: 'var(--purple)',
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
              marginTop: '-25px',
              zIndex: 1000,
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
        <WrappedComponent {...props} ref={ref} />
      </div>
    );
  });

  WithSelectable.displayName = `WithSelectable(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithSelectable;
};

export default withSelectable;
