import React from 'react';

const HeroSelectionModal = ({ isOpen, onClose, onHeroSelect }) => {
  if (!isOpen) return null;

  const heroOptions = [
    { type: 'heroOne', label: 'Hero Section One' },
    { type: 'heroTwo', label: 'Hero Section Two' },
    { type: 'heroThree', label: 'Hero Section Three' },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Select a Hero Section</h3>
        <ul>
          {heroOptions.map((hero) => (
            <li key={hero.type} onClick={() => onHeroSelect(hero.type)}>
              {hero.label}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default HeroSelectionModal;
