import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const TypographyEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Initialize states for typography properties
  const [styles, setStyles] = useState({
    fontSize: '',
    lineHeight: '',
    letterSpacing: '',
    fontFamily: '',
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left',
    textDecoration: 'none',
    textTransform: 'none',
  });

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id); // Get the DOM element by ID
      if (element) {
        const computedStyles = getComputedStyle(element);

        // Extract the style properties from computed styles
        setStyles({
          fontSize: computedStyles.fontSize ? parseFloat(computedStyles.fontSize) : '',
          lineHeight: computedStyles.lineHeight ? parseFloat(computedStyles.lineHeight) : '',
          letterSpacing: computedStyles.letterSpacing ? parseFloat(computedStyles.letterSpacing) : '',
          fontFamily: computedStyles.fontFamily || '',
          fontWeight: computedStyles.fontWeight || 'normal',
          color: computedStyles.color || '#000000',
          textAlign: computedStyles.textAlign || 'left',
          textDecoration: computedStyles.textDecoration || 'none',
          textTransform: computedStyles.textTransform || 'none',
        });
      }
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const { id } = selectedElement;

  // Handlers for style changes
  const handleStyleChange = (styleKey, value) => {
    setStyles((prevStyles) => ({
      ...prevStyles,
      [styleKey]: value,
    }));

    // Update the styles immediately without debouncing
    updateStyles(
      id,
      { [styleKey]: value + (['fontSize', 'lineHeight', 'letterSpacing'].includes(styleKey) && value ? 'px' : '') }
    );
  };

  return (
    <div className="typography-editor editor">
      <h3>Edit Typography Styles</h3>

      {/* Font Size */}
      <label>
        Font Size:
        <input
          type="number"
          value={styles.fontSize || ''}
          onChange={(e) => handleStyleChange('fontSize', e.target.value)}
        />
      </label>

      {/* Font Weight */}
      <label>
        Font Weight:
        <select
          value={styles.fontWeight}
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
        <select value={styles.fontFamily} onChange={(e) => handleStyleChange('fontFamily', e.target.value)}>
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
          type="number"
          value={styles.lineHeight || ''}
          onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
        />
      </label>

      {/* Letter Spacing */}
      <label>
        Letter Spacing:
        <input
          type="number"
          value={styles.letterSpacing || ''}
          onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
        />
      </label>

      {/* Text Color */}
      <label>
        Text Color:
        <input
          type="color"
          value={styles.color}
          onChange={(e) => handleStyleChange('color', e.target.value)}
        />
      </label>

      {/* Text Alignment */}
      <label>
        Text Alignment:
        <select
          value={styles.textAlign}
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
          value={styles.textDecoration}
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
          value={styles.textTransform}
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
