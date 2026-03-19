import React from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const SearchBar = ({ id }) => {
  const { element, styles, handleSelect } = useInteractiveElement(id, 'searchBar');
  const content = element?.content || 'Search...';

  const activeColor = styles.activeColor || '#5C4EFA';
  const borderColor = styles.borderColor || '#d0d0d0';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${borderColor}`,
        borderRadius: styles.borderRadius || '8px',
        backgroundColor: styles.backgroundColor || '#fff',
        overflow: 'hidden',
        width: styles.width || '300px',
        fontFamily: styles.fontFamily || 'inherit',
        ...styles,
      }}
    >
      {/* Search icon */}
      <div style={{
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        color: '#999',
        fontSize: '16px',
        flexShrink: 0,
      }}>
        🔍
      </div>

      {/* Input */}
      <input
        type="text"
        placeholder={content}
        readOnly
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          padding: styles.inputPadding || '10px 14px 10px 0',
          fontSize: styles.fontSize || '14px',
          color: styles.color || '#333',
          backgroundColor: 'transparent',
          fontFamily: 'inherit',
        }}
      />

      {/* Optional button */}
      {styles.showButton !== false && (
        <button
          style={{
            backgroundColor: activeColor,
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            flexShrink: 0,
          }}
        >
          Search
        </button>
      )}
    </div>
  );
};

export default SearchBar;
