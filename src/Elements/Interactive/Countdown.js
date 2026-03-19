import React, { useState, useEffect, useCallback } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const DEFAULT_CONTENT = {
  targetDate: '2027-01-01T00:00:00',
  label: 'Launch in',
  showLabels: true,
};

function computeTimeLeft(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

const Countdown = ({ id }) => {
  const { data: rawData, styles, isSelected, handleSelect } = useInteractiveElement(id, 'countdown');

  const data = rawData || DEFAULT_CONTENT;
  const { targetDate, label, showLabels } = { ...DEFAULT_CONTENT, ...data };

  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(computeTimeLeft(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (n) => String(n).padStart(2, '0');

  const boxStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
  };

  const numberStyle = {
    fontSize: styles.fontSize || '2rem',
    fontWeight: styles.fontWeight || 'bold',
    color: styles.color || '#fff',
    lineHeight: 1.2,
  };

  const unitLabelStyle = {
    fontSize: '0.75rem',
    color: styles.labelColor || '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '4px',
  };

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        display: 'flex',
        gap: styles.gap || '16px',
        justifyContent: styles.justifyContent || 'center',
        alignItems: 'center',
        padding: styles.padding || '20px',
        ...styles,
        outline: isSelected ? '2px solid #5C4EFA' : undefined,
      }}
    >
      {label && (
        <span style={{ ...numberStyle, fontSize: '1rem', marginRight: '8px' }}>
          {label}
        </span>
      )}
      {timeLeft.expired ? (
        <span style={numberStyle}>00:00:00:00</span>
      ) : (
        <>
          <div style={boxStyle}>
            <span style={numberStyle}>{pad(timeLeft.days)}</span>
            {showLabels && <span style={unitLabelStyle}>Days</span>}
          </div>
          <span style={{ ...numberStyle, opacity: 0.5 }}>:</span>
          <div style={boxStyle}>
            <span style={numberStyle}>{pad(timeLeft.hours)}</span>
            {showLabels && <span style={unitLabelStyle}>Hours</span>}
          </div>
          <span style={{ ...numberStyle, opacity: 0.5 }}>:</span>
          <div style={boxStyle}>
            <span style={numberStyle}>{pad(timeLeft.minutes)}</span>
            {showLabels && <span style={unitLabelStyle}>Minutes</span>}
          </div>
          <span style={{ ...numberStyle, opacity: 0.5 }}>:</span>
          <div style={boxStyle}>
            <span style={numberStyle}>{pad(timeLeft.seconds)}</span>
            {showLabels && <span style={unitLabelStyle}>Seconds</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default Countdown;
