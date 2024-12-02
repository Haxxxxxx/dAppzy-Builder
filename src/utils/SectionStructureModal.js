import React from 'react';

const SectionStructureModal = ({ onClose, onSelectStructure }) => {
  
  const handleStructureSelect = (structure) => {
    console.log('Selected structure:', structure); // Debug log
    onSelectStructure(structure);
    onClose();
  };

  return (
    <div className="quick-add-modal">
      <div >
        <h2>Select Section Structure</h2>
        <button onClick={() => handleStructureSelect('title-text')}>Title & Text</button>
        <button onClick={() => handleStructureSelect('title-image')}>Title & Image</button>
        <button onClick={() => handleStructureSelect('two-columns')}>Two Columns</button>
      </div>
    </div>
  );
};

export default SectionStructureModal;
