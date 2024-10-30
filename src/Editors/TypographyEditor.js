// src/components/TypographyEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const TypographyEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Initialize states for typography properties
  const [fontSize, setFontSize] = useState('');
  const [lineHeight, setLineHeight] = useState('');
  const [letterSpacing, setLetterSpacing] = useState('');
  const [fontFamily, setFontFamily] = useState('');

  useEffect(() => {
    if (selectedElement) {
      const styles = elements[selectedElement.id]?.styles || {};
      setFontSize(styles.fontSize ? parseInt(styles.fontSize, 10) : '');
      setLineHeight(styles.lineHeight || '');
      setLetterSpacing(styles.letterSpacing || '');
      setFontFamily(styles.fontFamily || 'Arial');
    }
  }, [selectedElement, elements]);

  if (!selectedElement) return null;

  const { id } = selectedElement;
  const styles = elements[id]?.styles || {};

  const handleStyleChange = (styleKey, value) => {
    updateStyles(id, { [styleKey]: value });
  };

  const handleFontSizeChange = (e) => {
    const newSize = e.target.value;
    setFontSize(newSize);
    handleStyleChange('fontSize', `${newSize}px`);
  };

  const handleLineHeightChange = (e) => {
    const newLineHeight = e.target.value;
    setLineHeight(newLineHeight);
    handleStyleChange('lineHeight', newLineHeight);
  };

  const handleLetterSpacingChange = (e) => {
    const newLetterSpacing = e.target.value;
    setLetterSpacing(newLetterSpacing);
    handleStyleChange('letterSpacing', `${newLetterSpacing}px`);
  };

  const handleFontFamilyChange = (e) => {
    const newFontFamily = e.target.value;
    setFontFamily(newFontFamily);
    handleStyleChange('fontFamily', newFontFamily);
  };

  return (
    <div className="typography-editor editor">
      <h3>Edit Typography Styles</h3>

      {/* Font Size */}
      <label>
        Font Size:
        <input
          type="number"
          value={fontSize}
          onChange={handleFontSizeChange}
        />
      </label>

      {/* Font Weight */}
      <label>
        Font Weight:
        <select
          value={styles.fontWeight || 'normal'}
          onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
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
        <select
          value={fontFamily}
          onChange={handleFontFamilyChange}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>
      </label>

      {/* Line Height */}
      <label>
        Line Height:
        <input
          type="number"
          value={lineHeight}
          onChange={handleLineHeightChange}
        />
      </label>

      {/* Letter Spacing */}
      <label>
        Letter Spacing:
        <input
          type="number"
          value={letterSpacing}
          onChange={handleLetterSpacingChange}
        />
      </label>

      {/* Text Color */}
      <label>
        Text Color:
        <input
          type="color"
          value={styles.color || '#000000'}
          onChange={(e) => handleStyleChange('color', e.target.value)}
        />
      </label>

      {/* Text Alignment */}
      <label>
        Text Alignment:
        <select
          value={styles.textAlign || 'left'}
          onChange={(e) => handleStyleChange('textAlign', e.target.value)}
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
          value={styles.textDecoration || 'none'}
          onChange={(e) => handleStyleChange('textDecoration', e.target.value)}
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
          value={styles.textTransform || 'none'}
          onChange={(e) => handleStyleChange('textTransform', e.target.value)}
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
