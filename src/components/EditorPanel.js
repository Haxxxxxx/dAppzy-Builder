// src/components/EditorPanel.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import StyleEditor from '../Editors/TypographyEditor';
import BorderEditor from '../Editors/BorderEditor';
import SizeEditor from '../Editors/SizeEditor';
import SpacingEditor from '../Editors/SpacingEditor';
import DisplayEditor from '../Editors/DisplayEditor';

const EditorPanel = () => {
  const { selectedElement } = useContext(EditableContext);

  // Check if an element is selected; if not, show a message
  if (!selectedElement) {
    return <p>Select an element to edit its properties.</p>;
  }

  return (
    <div>
      <h3>Edit Properties</h3>
      <StyleEditor />
      <BorderEditor />
      <SizeEditor />
      <SpacingEditor />
      <DisplayEditor />
    </div>
  );
};

export default EditorPanel;
