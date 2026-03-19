import React from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const DEFAULT_CONTENT = {
  value: 4,
  maxStars: 5,
  interactive: false,
  color: '#FFD700',
};

const Rating = ({ id }) => {
  const { data: rawData, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'rating');

  const data = rawData || DEFAULT_CONTENT;
  const { value, maxStars, interactive, color } = { ...DEFAULT_CONTENT, ...data };

  const handleStarClick = (starIndex) => {
    if (!interactive || !isSelected) return;
    const newValue = starIndex + 1;
    updateData({ ...data, value: newValue });
  };

  const stars = [];
  for (let i = 0; i < maxStars; i++) {
    const isFilled = i < value;
    stars.push(
      <span
        key={i}
        onClick={(e) => {
          e.stopPropagation();
          handleStarClick(i);
        }}
        style={{
          color: isFilled ? color : '#ccc',
          cursor: interactive && isSelected ? 'pointer' : 'default',
          transition: 'color 0.15s ease',
          userSelect: 'none',
        }}
        role={interactive ? 'button' : undefined}
        aria-label={`${i + 1} star${i > 0 ? 's' : ''}`}
      >
        {isFilled ? '\u2605' : '\u2606'}
      </span>
    );
  }

  return (
    <span
      id={id}
      onClick={handleSelect}
      style={{
        display: 'inline-flex',
        gap: styles.gap || '4px',
        fontSize: styles.fontSize || '24px',
        lineHeight: 1,
        cursor: 'pointer',
        ...styles,
      }}
    >
      {stars}
    </span>
  );
};

export default Rating;
