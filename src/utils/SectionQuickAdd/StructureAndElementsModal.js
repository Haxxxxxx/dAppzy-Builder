import React, { useState } from 'react';
import SectionStructureModal from '../SectionStructureModal';
import QuickAddElementModal from '../QuickAddElementModal';
import './StructureAndElementsModal.css';

const StructureAndElementsModal = ({ isOpen, onClose, onSelectStructure, onAddElement }) => {
  const [activeTab, setActiveTab] = useState('elements'); // Default to the "Elements" tab

  if (!isOpen) {
    return null; // Don't render if the modal is not open
  }

  return (
    <div className="structure-elements-modal">
      <div className="modal-content">
        {/* Close Button */}
        <button className="modal-close-button" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className="modal-header">
          <button
            onClick={() => setActiveTab('elements')}
            className={activeTab === 'elements' ? 'active' : ''}
          >
            Elements
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={activeTab === 'structure' ? 'active' : ''}
          >
            Structure
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {activeTab === 'elements' && (
            <QuickAddElementModal onAddElement={onAddElement} onClose={onClose} />
          )}
          {activeTab === 'structure' && (
            <SectionStructureModal onClose={onClose} onSelectStructure={onSelectStructure} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StructureAndElementsModal;
