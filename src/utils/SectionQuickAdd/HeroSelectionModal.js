import React from 'react';

const HeroSelectionModal = ({ isOpen, onClose, onHeroSelect }) => {
  if (!isOpen) return null;

  const heroOptions = [
    { type: 'heroOne', label: 'Hero Section One' },
    { type: 'heroTwo', label: 'Hero Section Two' },
    { type: 'heroThree', label: 'Hero Section Three' },
  ];

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'absolute',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClose} // Close modal when clicking outside content
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '300px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          display:'flex',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click propagation
      >
        <ul style={{ listStyleType: 'none', padding: 0,display:'flex'}}>
          {heroOptions.map((hero) => (
            <li
              key={hero.type}
              onClick={() => onHeroSelect(hero.type)}
              style={{
                padding: '10px',
                margin: '5px 0',
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '4px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                display:'flex',

              }}
            >
              {hero.label}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            cursor: 'pointer',
            background:'transparent'
          }}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default HeroSelectionModal;
