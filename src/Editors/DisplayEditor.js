import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const DisplayEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [display, setDisplay] = useState('block');
  const [flexDirection, setFlexDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);
        setDisplay(computedStyles.display || 'block');
        setFlexDirection(computedStyles.flexDirection || 'row');
        setJustifyContent(computedStyles.justifyContent || 'flex-start');
        setAlignItems(computedStyles.alignItems || 'stretch');
      }
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleDisplayChange = (e) => {
    const newDisplay = e.target.value;
    setDisplay(newDisplay);
    updateStyles(selectedElement.id, { display: newDisplay });
  };

  const handleFlexDirectionChange = (e) => {
    const newDirection = e.target.value;
    setFlexDirection(newDirection);
    updateStyles(selectedElement.id, { flexDirection: newDirection });
  };

  const handleJustifyContentChange = (e) => {
    const newJustify = e.target.value;
    setJustifyContent(newJustify);
    updateStyles(selectedElement.id, { justifyContent: newJustify });
  };

  const handleAlignItemsChange = (e) => {
    const newAlign = e.target.value;
    setAlignItems(newAlign);
    updateStyles(selectedElement.id, { alignItems: newAlign });
  };

  return (
    <div className="editor-section">
      <h4 className="editor-title">Display Settings</h4>
      <div className="editor-group">
        <label>Display</label>
        <select value={display} onChange={handleDisplayChange} className="editor-select">
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="inline-block">Inline Block</option>
          <option value="none">None</option>
        </select>
      </div>

      {display === 'flex' && (
        <>
          <div className="editor-group">
            <label>Flex Direction</label>
            <select value={flexDirection} onChange={handleFlexDirectionChange} className="editor-select">
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div className="editor-group">
            <label>Justify Content</label>
            <select value={justifyContent} onChange={handleJustifyContentChange} className="editor-select">
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
            </select>
          </div>

          <div className="editor-group">
            <label>Align Items</label>
            <select value={alignItems} onChange={handleAlignItemsChange} className="editor-select">
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex End</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default DisplayEditor;
