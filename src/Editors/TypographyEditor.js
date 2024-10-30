// src/components/TypographyEditor.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { EditableContext } from '../context/EditableContext';
import { debounce } from '../utils/debounce';

const TypographyEditor = () => {
  const { selectedElement, updateStyles, elements, findElementById } = useContext(EditableContext);

  // Initialize states for typography properties
  const [fontSize, setFontSize] = useState('');
  const [lineHeight, setLineHeight] = useState('');
  const [letterSpacing, setLetterSpacing] = useState('');
  const [fontFamily, setFontFamily] = useState('');

  // Debounced handler for updating styles
  const debouncedUpdateStyle = useCallback(
    debounce((id, styleKey, value) => {
      updateStyles(id, { [styleKey]: value });
    }, 200),
    [updateStyles]
  );

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id); // Get the DOM element by ID
  
      if (element) {
        const computedStyles = getComputedStyle(element);
        // Parse font size and letter spacing
        const fontSizeValue = computedStyles.fontSize ? parseFloat(computedStyles.fontSize) : '';
        const letterSpacingValue = computedStyles.letterSpacing === 'normal' ? '' : parseFloat(computedStyles.letterSpacing) || '';
  
        // Handle line height; if it's "normal", we keep it as "normal"
        const lineHeightValue = computedStyles.lineHeight === 'normal' ? 'normal' : parseFloat(computedStyles.lineHeight) || '';
  
        // Use only the primary font in the font family
        const fontFamilyValue = computedStyles.fontFamily.split(',')[0].trim();
  
        // Set state with parsed values
        setFontSize(fontSizeValue);
        setLineHeight(lineHeightValue);
        setLetterSpacing(letterSpacingValue);
        setFontFamily(fontFamilyValue);
      }
    }
  }, [selectedElement]);
  





  if (!selectedElement) return null;

  // Retrieve the element by ID so that we can use its current styles as defaults
  const element = findElementById(selectedElement.id, elements);

  const handleFontSizeChange = (e) => {
    const newSize = e.target.value;
    setFontSize(newSize);
    debouncedUpdateStyle(selectedElement.id, 'fontSize', `${newSize}px`);
  };

  const handleLineHeightChange = (e) => {
    const newLineHeight = e.target.value;
    setLineHeight(newLineHeight);
    debouncedUpdateStyle(selectedElement.id, 'lineHeight', isNaN(newLineHeight) ? newLineHeight : `${newLineHeight}px`);
  };

  const handleLetterSpacingChange = (e) => {
    const newLetterSpacing = e.target.value;
    setLetterSpacing(newLetterSpacing);
    debouncedUpdateStyle(selectedElement.id, 'letterSpacing', `${newLetterSpacing}px`);
  };


  const handleFontFamilyChange = (e) => {
    const newFontFamily = e.target.value;
    setFontFamily(newFontFamily);
    updateStyles(selectedElement.id, { fontFamily: newFontFamily });
  };


  return (
    <div className="typography-editor editor">
      <h3>Edit Typography Styles</h3>

      {/* Font Size */}
      <label>
        Font Size:
        <input
          type="number"
          value={fontSize || ''} // Ensure a fallback to an empty string if undefined
          onChange={(e) => handleFontSizeChange(e)}
        />
      </label>


      {/* Font Weight */}
      <label>
        Font Weight:
        <select
          value={element?.styles.fontWeight || 'normal'}
          onChange={(e) => updateStyles(selectedElement.id, { fontWeight: e.target.value })}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Light</option>
          <option value="bolder">Bolder</option>
        </select>
      </label>

      {/* Font Family */}
      <label>
        Font Family:
        <select value={fontFamily} onChange={handleFontFamilyChange}>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="-apple-system">System Default</option>
          {/* Add other options if needed */}
        </select>
      </label>

      {/* Line Height */}
      <label>
        Line Height:
        <input
          type="text" // Use text if line-height can be "normal" or a number
          value={lineHeight || ''}
          onChange={handleLineHeightChange}
        />
      </label>

      {/* Letter Spacing */}
      <label>
        Letter Spacing:
        <input
          type="number"
          value={letterSpacing || ''} // Ensure a fallback to an empty string if undefined
          onChange={handleLetterSpacingChange}
        />
      </label>

      {/* Text Color */}
      <label>
        Text Color:
        <input
          type="color"
          value={element?.styles.color || '#000000'}
          onChange={(e) => updateStyles(selectedElement.id, { color: e.target.value })}
        />
      </label>

      {/* Text Alignment */}
      <label>
        Text Alignment:
        <select
          value={element?.styles.textAlign || 'left'}
          onChange={(e) => updateStyles(selectedElement.id, { textAlign: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </label>

      {/* Text Decoration */}
      <label>
        Text Decoration:
        <select
          value={element?.styles.textDecoration || 'none'}
          onChange={(e) => updateStyles(selectedElement.id, { textDecoration: e.target.value })}
        >
          <option value="none">None</option>
          <option value="underline">Underline</option>
          <option value="line-through">Line-through</option>
          <option value="overline">Overline</option>
        </select>
      </label>

      {/* Text Transform */}
      <label>
        Text Transform:
        <select
          value={element?.styles.textTransform || 'none'}
          onChange={(e) => updateStyles(selectedElement.id, { textTransform: e.target.value })}
        >
          <option value="none">None</option>
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="capitalize">Capitalize</option>
        </select>
      </label>
    </div>
  );
};

export default TypographyEditor;
