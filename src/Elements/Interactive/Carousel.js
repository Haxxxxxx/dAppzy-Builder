import React, { useState } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const Carousel = ({ id }) => {
  const { data, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'carousel');

  const defaultSlides = [
    { text: 'Slide 1 — Add your content here' },
    { text: 'Slide 2 — Add your content here' },
    { text: 'Slide 3 — Add your content here' },
  ];

  const slides = Array.isArray(data) ? data : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index) => {
    if (index < 0) setCurrentIndex(slides.length - 1);
    else if (index >= slides.length) setCurrentIndex(0);
    else setCurrentIndex(index);
  };

  const handleSlideBlur = (e) => {
    if (!isSelected) return;
    const updated = [...slides];
    updated[currentIndex] = { ...updated[currentIndex], text: e.target.innerText.trim() || '' };
    updateData(updated);
  };

  const activeColor = styles.activeColor || '#5C4EFA';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        position: 'relative',
        width: styles.width || '100%',
        overflow: 'hidden',
        borderRadius: styles.borderRadius || '8px',
        backgroundColor: styles.backgroundColor || '#f0f0f0',
        fontFamily: styles.fontFamily || 'inherit',
        ...styles,
      }}
    >
      {/* Slide */}
      <div
        style={{
          minHeight: styles.slideHeight || '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: styles.slidePadding || '40px 60px',
        }}
      >
        <div
          contentEditable={isSelected}
          suppressContentEditableWarning={true}
          onBlur={handleSlideBlur}
          style={{
            fontSize: styles.fontSize || '18px',
            color: styles.color || '#333',
            textAlign: 'center',
            outline: 'none',
            width: '100%',
          }}
        >
          {slides[currentIndex]?.text || ''}
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }}
        style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
        style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ›
      </button>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 0' }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i); }}
            style={{
              width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer',
              backgroundColor: i === currentIndex ? activeColor : '#ccc',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
