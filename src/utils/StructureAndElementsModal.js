import React, { useState } from 'react';
import SectionStructureModal from './SectionStructureModal';
import QuickAddElementModal from './QuickAddElementModal';

const StructureAndElementsModal = ({ isOpen, onClose, onSelectStructure, onAddElement }) => {
  const [activeTab, setActiveTab] = useState('elements'); // Default to the "Elements" tab

  if (!isOpen) {
    return null; // Don't render if the modal is not open
  }

  return (
    <div className="modal">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <button
            onClick={() => setActiveTab('elements')}
            style={activeTab === 'elements' ? { fontWeight: 'bold' } : {}}
          >
            Elements
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            style={activeTab === 'structure' ? { fontWeight: 'bold' } : {}}
          >
            Structure
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'elements' && (
            <QuickAddElementModal onAddElement={onAddElement} onClose={onClose} />
          )}
          {activeTab === 'structure' && (
            <SectionStructureModal onClose={onClose} onSelectStructure={onSelectStructure} />
          )}
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="modal-close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default StructureAndElementsModal;
