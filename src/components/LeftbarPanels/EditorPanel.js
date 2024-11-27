import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import StyleEditor from '../../Editors/TypographyEditor';
import BorderEditor from '../../Editors/BorderEditor';
import SizeEditor from '../../Editors/SizeEditor';
import SpacingEditor from '../../Editors/SpacingEditor';
import DisplayEditor from '../../Editors/DisplayEditor';
import EffectEditor from '../../Editors/EffectEditor';
import ButtonEditor from '../../Editors/ButtonEditor';
import SectionDivEditor from '../../Editors/SectionDivEditor';

const EditorPanel = ({ editorRef }) => {
  const { selectedElement, elements, updateStyles, setElements } = useContext(EditableContext);

  if (!selectedElement) {
    return <p>Select an element to edit its properties.</p>;
  }

  const element = elements.find((el) => el.id === selectedElement.id);

  if (!element) {
    return <p>Selected element not found. Please select a different element.</p>;
  }

  if (element.type === 'div' || element.type === 'section') {
    return (
      <div ref={editorRef}>
        <h3>Edit Section/Div Properties</h3>
        <SectionDivEditor element={element} updateStyles={updateStyles} setElements={setElements} />
      </div>
    );
  }

  return (
    <div ref={editorRef}>
      <h3>Edit Properties</h3>
      {elements.length > 0 && (
        <button onClick={() => setElements([])} style={{ marginTop: '16px', padding: '8px', cursor: 'pointer' }}>
          Clear All Elements
        </button>
      )}
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
