import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import StyleEditor from '../../Editors/TypographyEditor';
import BorderEditor from '../../Editors/BorderEditor';
import SizeEditor from '../../Editors/SizeEditor';
import SpacingEditor from '../../Editors/SpacingEditor';
import DisplayEditor from '../../Editors/DisplayEditor';
import EffectEditor from '../../Editors/EffectEditor';
import ButtonEditor from '../../Editors/ButtonEditor';
import SectionDivEditor from '../../Editors/SectionDivEditor';

const CollapsiblePanel = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="collapsible-panel">
      <div
        className="panel-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          background: '#f0f0f0',
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      >
        <h4 style={{ margin: 0 }}>{title}</h4>
      </div>
      {isOpen && (
        <div
          className="panel-content"
          style={{
            padding: '16px',
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

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

      <CollapsiblePanel title="Typography">
        <StyleEditor />
      </CollapsiblePanel>
      <CollapsiblePanel title="Borders">
        <BorderEditor />
      </CollapsiblePanel>
      <CollapsiblePanel title="Size">
        <SizeEditor />
      </CollapsiblePanel>
      <CollapsiblePanel title="Spacing">
        <SpacingEditor />
      </CollapsiblePanel>
      <CollapsiblePanel title="Display">
        <DisplayEditor />
      </CollapsiblePanel>
      <CollapsiblePanel title="Effects">
        <EffectEditor />
      </CollapsiblePanel>
      <CollapsiblePanel title="Button">
        <ButtonEditor />
      </CollapsiblePanel>

      {elements.length > 0 && (
        <button
          onClick={() => setElements([])}
          style={{
            marginTop: '16px',
            padding: '8px',
            cursor: 'pointer',
            background: '#d9534f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Clear All Elements
        </button>
      )}

    </div>
  );
};

export default EditorPanel;
