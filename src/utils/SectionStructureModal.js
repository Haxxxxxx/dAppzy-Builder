import React from 'react';

const SectionStructureModal = ({ onClose, onSelectStructure }) => {
  const handleStructureSelect = (structure) => {
    console.log('Selected structure:', structure); // Debug log
    onSelectStructure(structure);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Select Section Structure</h2>
        <button onClick={() => handleStructureSelect('title-text')}>Title & Text</button>
        <button onClick={() => handleStructureSelect('title-image')}>Title & Image</button>
        <button onClick={() => handleStructureSelect('two-columns')}>Two Columns</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default SectionStructureModal;
