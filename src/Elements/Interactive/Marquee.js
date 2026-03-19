import React, { useRef, useEffect, useState } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const DEFAULT_CONTENT = {
  items: ['Welcome to our site', 'Check out new features', 'Limited time offer'],
  speed: 30,
  direction: 'left',
  pauseOnHover: true,
};

const Marquee = ({ id }) => {
  const { data: rawData, styles, isSelected, handleSelect } = useInteractiveElement(id, 'marquee');
  const innerRef = useRef(null);

  const data = rawData || DEFAULT_CONTENT;

  const items = data.items || DEFAULT_CONTENT.items;
  const speed = data.speed || 30;
  const direction = data.direction || 'left';
  const pauseOnHover = data.pauseOnHover !== false;
  const separator = styles.separator || ' \u2022 ';

  // Build the text content for one cycle
  const renderItems = () =>
    items.map((item, i) => (
      <span key={i} style={{ whiteSpace: 'nowrap' }}>
        {item}
        {i < items.length - 1 && (
          <span style={{ margin: '0 12px', opacity: 0.5 }}>{separator}</span>
        )}
      </span>
    ));

  // Calculate animation duration based on content width
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    if (innerRef.current) {
      // Measure half the inner width (since content is duplicated)
      const halfWidth = innerRef.current.scrollWidth / 2;
      // duration = distance / speed (px per second)
      const calculatedDuration = halfWidth / speed;
      setDuration(Math.max(calculatedDuration, 2));
    }
  }, [items, speed, styles.fontSize]);

  const animationName = `marquee-scroll-${id?.replace(/[^a-zA-Z0-9]/g, '') || 'default'}`;
  const isReverse = direction === 'right';

  const keyframes = `
    @keyframes ${animationName} {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;

  return (
    <div id={id} onClick={handleSelect} style={{ outline: isSelected ? '2px solid #5C4EFA' : undefined }}>
      <style>{keyframes}</style>
      <div
        style={{
          overflow: 'hidden',
          width: styles.width || '100%',
          backgroundColor: styles.backgroundColor || 'transparent',
          padding: styles.padding || '12px 0',
          fontSize: styles.fontSize || '16px',
          color: styles.color || '#333',
          fontFamily: styles.fontFamily || 'inherit',
          fontWeight: styles.fontWeight || 'normal',
          ...styles,
        }}
      >
        <div
          ref={innerRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            animation: isSelected
              ? 'none'
              : `${animationName} ${duration}s linear infinite`,
            animationDirection: isReverse ? 'reverse' : 'normal',
          }}
          onMouseEnter={(e) => {
            if (pauseOnHover && !isSelected) {
              e.currentTarget.style.animationPlayState = 'paused';
            }
          }}
          onMouseLeave={(e) => {
            if (pauseOnHover && !isSelected) {
              e.currentTarget.style.animationPlayState = 'running';
            }
          }}
        >
          {/* Original content */}
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {renderItems()}
            <span style={{ margin: '0 12px', opacity: 0.5 }}>{separator}</span>
          </span>
          {/* Duplicated content for seamless loop */}
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {renderItems()}
            <span style={{ margin: '0 12px', opacity: 0.5 }}>{separator}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;
