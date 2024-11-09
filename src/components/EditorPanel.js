import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import StyleEditor from '../Editors/TypographyEditor';
import BorderEditor from '../Editors/BorderEditor';
import SizeEditor from '../Editors/SizeEditor';
import SpacingEditor from '../Editors/SpacingEditor';
import DisplayEditor from '../Editors/DisplayEditor';
import EffectEditor from '../Editors/EffectEditor';
import ButtonEditor from '../Editors/ButtonEditor';
import SectionDivEditor from '../Editors/SectionDivEditor';

const EditorPanel = () => {
  const { selectedElement, elements, updateStyles, setElements } = useContext(EditableContext);

  console.log('Selected Element in EditorPanel:', selectedElement); // Debugging log
  console.log('Current elements state:', elements); // Debugging log

  if (!selectedElement) {
    return <p>Select an element to edit its properties.</p>;
  }


  const element = elements.find(el => el.id === selectedElement.id);

  if (!element) {
    console.log('Selected element not found in elements array:', selectedElement);
    return <p>Selected element not found. Please select a different element.</p>;
  }

  console.log('Looking for ID:', selectedElement.id);
  console.log('Elements in state:', elements.map(el => el.id));
  elements.forEach(el => {
    if (el.id === selectedElement.id) {
      console.log('Match found for:', el);
    } else {
      console.log(`No match for element ID: ${el.id}`);
    }
  });


  // Display specific editor for div and section elements
  if (element.type === 'div' || element.type === 'section') {
    return (
      <div>
        <h3>Edit Section/Div Properties</h3>
        <SectionDivEditor element={element} updateStyles={updateStyles} setElements={setElements} />
      </div>
    );
  }

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

      {/* Style Editors */}
      <StyleEditor />
      <BorderEditor />
      <SizeEditor />
      <SpacingEditor />
      <DisplayEditor />
      <EffectEditor />
      <ButtonEditor />
    </div>
  );
};

export default EditorPanel;
