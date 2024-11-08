import React from 'react';

const QuickAddElementModal = ({ onClose, onAddElement }) => {
  const handleElementSelect = (type) => {
    console.log('Selected element:', type); // Debug log
    onAddElement(type); // Call the callback to add the selected element
    onClose(); // Close the modal
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Quick Add Elements</h2>
        <button onClick={() => handleElementSelect('paragraph')}>Paragraph</button>
        <button onClick={() => handleElementSelect('heading')}>Heading</button>
        <button onClick={() => handleElementSelect('button')}>Button</button>
        <button onClick={() => handleElementSelect('input')}>Input</button>
        <button onClick={() => handleElementSelect('image')}>Image</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default QuickAddElementModal;
