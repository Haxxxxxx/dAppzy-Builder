// src/components/EditorPanel.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import StyleEditor from '../Editors/TypographyEditor';
import BorderEditor from '../Editors/BorderEditor';
import SizeEditor from '../Editors/SizeEditor';
import SpacingEditor from '../Editors/SpacingEditor';
import DisplayEditor from '../Editors/DisplayEditor';
import EffectEditor from '../Editors/EffectEditor';
import ButtonEditor from '../Editors/ButtonEditor';

const EditorPanel = () => {
  const { selectedElement, elements, updateStyles, setElements } = useContext(EditableContext);

  if (!selectedElement) {
    return <p>Select an element to edit its properties.</p>;
  }

  // Find the selected element in the array
  const element = elements.find(el => el.id === selectedElement.id);

  // Safely check if element exists before proceeding
  if (!element) {
    return <p>Selected element not found. Please select a different element.</p>;
  }

  // Update heading level
  const handleLevelChange = (e) => {
    const newLevel = parseInt(e.target.value, 10);
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === selectedElement.id
          ? { ...el, level: newLevel }
          : el
      )
    );
  };

  const handleClearAll = () => {
    setElements([]); // Clear all elements by setting elements to an empty array
  };

  return (
    <div>
      <h3>Edit Properties</h3>
      {elements.length > 0 && (
        <button onClick={handleClearAll} style={{ marginTop: '16px', padding: '8px', cursor: 'pointer' }}>
          Clear All Elements
        </button>
      )}

      {/* Heading Level Selector - Only show if selected element is a heading */}
      {element.type === 'heading' && (
        <div>
          <label>Heading Level:</label>
          <select value={element.level} onChange={handleLevelChange}>
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
            <option value={5}>H5</option>
            <option value={6}>H6</option>
          </select>
        </div>
      )}

      {/* Style Editors */}
      <StyleEditor />
      <BorderEditor />
      <SizeEditor />
      <SpacingEditor />
      <DisplayEditor />
      <EffectEditor/>
      <ButtonEditor/>
    </div>
  );
};

export default EditorPanel;
