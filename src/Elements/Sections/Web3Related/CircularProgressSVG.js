import React from 'react';

const CircularProgressSVG = ({ progress, size = 150, strokeWidth = 10 }) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Convert 0–100% progress into stroke offset.
  const offset = circumference - (progress / 100) * circumference;

  // Calculate the black dot position at the end of the arc.
  const angleDeg = progress * 3.6; // no -90 offset here, because we rotate the <svg> instead
  const angleRad = (Math.PI / 180) * angleDeg;
  const dotRadius = strokeWidth / 2;
  const dotX = center + radius * Math.cos(angleRad);
  const dotY = center + radius * Math.sin(angleRad);

  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'rotate(-90deg)', // Start at the top
      }}
    >
      <defs>
        {/* Linear gradient for the progress stroke */}
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EAC050" />
          <stop offset="48.5%" stopColor="#7E1C48" />
          <stop offset="100%" stopColor="#1A587C" />
        </linearGradient>
      </defs>

      {/* Grey stroke for the unfilled portion */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#ccc"
        strokeWidth={strokeWidth}
      />

      {/* Gradient progress arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />

      {/* Black dot at the end of the arc */}
      <circle
        cx={dotX}
        cy={dotY}
        r={dotRadius}
        fill="black"
      />
    </svg>
  );
};

export default CircularProgressSVG;
