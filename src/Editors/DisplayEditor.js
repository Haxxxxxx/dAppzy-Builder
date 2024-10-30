// src/components/DisplayEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const DisplayEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // State variables for display and flex properties
  const [display, setDisplay] = useState('');
  const [flexDirection, setFlexDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  const [flexWrap, setFlexWrap] = useState('nowrap');
  const [alignContent, setAlignContent] = useState('stretch');
  const [gridTemplateColumns, setGridTemplateColumns] = useState('');
  const [gridTemplateRows, setGridTemplateRows] = useState('');

  // Load current styles when a new element is selected
  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id); // Get the DOM element by ID
  
      if (element) {
      const computedStyles = getComputedStyle(element);
      
      setDisplay(computedStyles.display || 'block');
      setFlexDirection(computedStyles.flexDirection || 'row');
      setJustifyContent(computedStyles.justifyContent || 'flex-start');
      setAlignItems(computedStyles.alignItems || 'stretch');
      setFlexWrap(computedStyles.flexWrap || 'nowrap');
      setAlignContent(computedStyles.alignContent || 'stretch');
      setGridTemplateColumns(computedStyles.gridTemplateColumns || '');
      setGridTemplateRows(computedStyles.gridTemplateRows || '');
    }
  }
  }, [selectedElement, elements]);

  if (!selectedElement) return null;

  const { id } = selectedElement;

  // Handlers for each style property
  const handleDisplayChange = (e) => {
    const newDisplay = e.target.value;
    setDisplay(newDisplay);
    updateStyles(id, { display: newDisplay });
  };

  const handleFlexDirectionChange = (e) => {
    const newDirection = e.target.value;
    setFlexDirection(newDirection);
    updateStyles(id, { flexDirection: newDirection });
  };

  const handleJustifyContentChange = (e) => {
    const newJustify = e.target.value;
    setJustifyContent(newJustify);
    updateStyles(id, { justifyContent: newJustify });
  };

  const handleAlignItemsChange = (e) => {
    const newAlign = e.target.value;
    setAlignItems(newAlign);
    updateStyles(id, { alignItems: newAlign });
  };

  const handleFlexWrapChange = (e) => {
    const newWrap = e.target.value;
    setFlexWrap(newWrap);
    updateStyles(id, { flexWrap: newWrap });
  };

  const handleAlignContentChange = (e) => {
    const newAlignContent = e.target.value;
    setAlignContent(newAlignContent);
    updateStyles(id, { alignContent: newAlignContent });
  };

  const handleGridTemplateColumnsChange = (e) => {
    const newColumns = e.target.value;
    setGridTemplateColumns(newColumns);
    updateStyles(id, { gridTemplateColumns: newColumns });
  };

  const handleGridTemplateRowsChange = (e) => {
    const newRows = e.target.value;
    setGridTemplateRows(newRows);
    updateStyles(id, { gridTemplateRows: newRows });
  };

  return (
    <div className="display-editor editor">
      <h3>Edit Display Properties</h3>

      {/* Display Selector */}
      <label>
        Display:
        <select value={display} onChange={handleDisplayChange}>
          <option value="block">Block</option>
          <option value="inline">Inline</option>
          <option value="inline-block">Inline-Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="none">None</option>
        </select>
      </label>

      {/* Flex-specific Properties */}
      {display === 'flex' && (
        <div className="flex-properties editor">
          <hr></hr>
          <label>
            Flex Direction:
            <select value={flexDirection} onChange={handleFlexDirectionChange}>
              <option value="row">Row</option>
              <option value="row-reverse">Row-Reverse</option>
              <option value="column">Column</option>
              <option value="column-reverse">Column-Reverse</option>
            </select>
          </label>

          <label>
            Justify Content:
            <select value={justifyContent} onChange={handleJustifyContentChange}>
              <option value="flex-start">Flex-Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex-End</option>
              <option value="space-around">Space-Around</option>
              <option value="space-between">Space-Between</option>
              <option value="space-evenly">Space-Evenly</option>
            </select>
          </label>

          <label>
            Align Items:
            <select value={alignItems} onChange={handleAlignItemsChange}>
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex-Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex-End</option>
              <option value="baseline">Baseline</option>
            </select>
          </label>

          <label>
            Flex Wrap:
            <select value={flexWrap} onChange={handleFlexWrapChange}>
              <option value="nowrap">No Wrap</option>
              <option value="wrap">Wrap</option>
              <option value="wrap-reverse">Wrap-Reverse</option>
            </select>
          </label>

          <label>
            Align Content:
            <select value={alignContent} onChange={handleAlignContentChange}>
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex-Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex-End</option>
              <option value="space-around">Space-Around</option>
              <option value="space-between">Space-Between</option>
            </select>
          </label>
        </div>
      )}

      {/* Grid-specific Properties */}
      {display === 'grid' && (
        <div className="grid-properties editor">
          <hr></hr>
          <label>
            Grid Template Columns:
            <input
              type="text"
              value={gridTemplateColumns}
              onChange={handleGridTemplateColumnsChange}
              placeholder="e.g., 1fr 2fr"
            />
          </label>

          <label>
            Grid Template Rows:
            <input
              type="text"
              value={gridTemplateRows}
              onChange={handleGridTemplateRowsChange}
              placeholder="e.g., auto auto"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default DisplayEditor;
