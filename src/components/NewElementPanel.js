// src/components/NewElementPanel.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const NewElementPanel = () => {
  const { addNewElement } = useContext(EditableContext);

  return (
    <div>
      <h3>Create New Element</h3>
      <button onClick={() => addNewElement('paragraph')}>Add Paragraph</button>
      <button onClick={() => addNewElement('heading', 1)}>Add Heading 1</button>
      <button onClick={() => addNewElement('heading', 2)}>Add Heading 2</button>
      <button onClick={() => addNewElement('heading', 3)}>Add Heading 3</button>
      {/* Add more buttons for other heading levels if needed */}
    </div>
  );
};

export default NewElementPanel;
