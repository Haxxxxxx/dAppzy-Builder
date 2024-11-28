import React, { useState } from 'react';

const SectionDivEditor = ({ element, updateStyles, setElements }) => {
  const [backgroundColor, setBackgroundColor] = useState(element.styles.backgroundColor || '');
  const [padding, setPadding] = useState(element.styles.padding || '');
  const [margin, setMargin] = useState(element.styles.margin || '');
  const [display, setDisplay] = useState(element.styles.display || 'block');
  const [flexDirection, setFlexDirection] = useState(element.styles.flexDirection || 'row');
  const [justifyContent, setJustifyContent] = useState(element.styles.justifyContent || '');

  const handleBackgroundColorChange = (e) => {
    setBackgroundColor(e.target.value);
    updateStyles(element.id, { backgroundColor: e.target.value });
  };

  const handlePaddingChange = (e) => {
    setPadding(e.target.value);
    updateStyles(element.id, { padding: e.target.value });
  };

  const handleMarginChange = (e) => {
    setMargin(e.target.value);
    updateStyles(element.id, { margin: e.target.value });
  };

  const handleDisplayChange = (e) => {
    setDisplay(e.target.value);
    updateStyles(element.id, { display: e.target.value });
  };

  const handleFlexDirectionChange = (e) => {
    setFlexDirection(e.target.value);
    updateStyles(element.id, { flexDirection: e.target.value });
  };

  const handleJustifyContentChange = (e) => {
    setJustifyContent(e.target.value);
    updateStyles(element.id, { justifyContent: e.target.value });
  };

  const handleAddChildElement = (type) => {
    const newId = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newElement = {
      id: newId,
      type,
      content: `New ${type}`,
      styles: {},
      children: [],
      parentId: element.id,
    };

    setElements((prevElements) => {
      return prevElements.map((el) =>
        el.id === element.id
          ? { ...el, children: [...el.children, newId] }
          : el
      ).concat(newElement);
    });
  };

  return (
    <div className="section-div-editor">

      <div className="editor-field">
        <label>Background Color:</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
        />
      </div>

      <div className="editor-field">
        <label>Padding:</label>
        <input
          type="text"
          value={padding}
          onChange={handlePaddingChange}
          placeholder="e.g., 10px"
        />
      </div>

      <div className="editor-field">
        <label>Margin:</label>
        <input
          type="text"
          value={margin}
          onChange={handleMarginChange}
          placeholder="e.g., 10px"
        />
      </div>

      <div className="editor-field">
        <label>Display:</label>
        <select value={display} onChange={handleDisplayChange}>
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="inline-block">Inline Block</option>
          <option value="none">None</option>
        </select>
      </div>

      {display === 'flex' && (
        <>
          <div className="editor-field">
            <label>Flex Direction:</label>
            <select value={flexDirection} onChange={handleFlexDirectionChange}>
              <option value="row">Row</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column">Column</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div className="editor-field">
            <label>Justify Content:</label>
            <select value={justifyContent} onChange={handleJustifyContentChange}>
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
            </select>
          </div>
        </>
      )}

      <div className="editor-actions">
        <button onClick={() => handleAddChildElement('heading')}>Add Heading</button>
        <button onClick={() => handleAddChildElement('paragraph')}>Add Paragraph</button>
        <button onClick={() => handleAddChildElement('div')}>Add Div</button>
        <button onClick={() => handleAddChildElement('image')}>Add Image</button>
      </div>
    </div>
  );
};

export default SectionDivEditor;
