import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const DisplayEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [display, setDisplay] = useState('block');
  const [flexDirection, setFlexDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  const [flexWrap, setFlexWrap] = useState('nowrap');
  const [gap, setGap] = useState('0px');

  useEffect(() => {
    if (selectedElement) {
      // Get styles from the selected element's styles object
      const elementStyles = selectedElement.styles || {};
      
      // Update state with current styles
      setDisplay(elementStyles.display || 'block');
      setFlexDirection(elementStyles.flexDirection || 'row');
      setJustifyContent(elementStyles.justifyContent || 'flex-start');
      setAlignItems(elementStyles.alignItems || 'stretch');
      setFlexWrap(elementStyles.flexWrap || 'nowrap');
      setGap(elementStyles.gap || '0px');
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

  const handleFlexWrapChange = (e) => {
    const newWrap = e.target.value;
    setFlexWrap(newWrap);
    updateStyles(selectedElement.id, { flexWrap: newWrap });
  };

  const handleGapChange = (e) => {
    const newGap = e.target.value;
    setGap(newGap);
    updateStyles(selectedElement.id, { gap: newGap });
  };

  return (
    <div className="settings-panel">
      <div className="settings-group">
        <label>Display</label>
        <select 
          value={display} 
          onChange={handleDisplayChange} 
          className="settings-select"
        >
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="inline-block">Inline Block</option>
          <option value="inline-flex">Inline Flex</option>
          <option value="none">None</option>
        </select>
      </div>

      {(display === 'flex' || display === 'inline-flex') && (
        <>
          <div className="settings-group">
            <label>Flex Direction</label>
            <select 
              value={flexDirection} 
              onChange={handleFlexDirectionChange} 
              className="settings-select"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Justify Content</label>
            <select 
              value={justifyContent} 
              onChange={handleJustifyContentChange} 
              className="settings-select"
            >
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Align Items</label>
            <select 
              value={alignItems} 
              onChange={handleAlignItemsChange} 
              className="settings-select"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex End</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Flex Wrap</label>
            <select 
              value={flexWrap} 
              onChange={handleFlexWrapChange} 
              className="settings-select"
            >
              <option value="nowrap">No Wrap</option>
              <option value="wrap">Wrap</option>
              <option value="wrap-reverse">Wrap Reverse</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Gap</label>
            <input
              type="text"
              value={gap}
              onChange={handleGapChange}
              placeholder="e.g., 10px, 1rem"
              className="settings-input"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DisplayEditor;
