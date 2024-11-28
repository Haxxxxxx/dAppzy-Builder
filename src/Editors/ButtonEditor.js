// src/components/ButtonEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const ButtonEditor = () => {
    const { selectedElement, updateStyles, updateClickEvent, updateAccessibility, elements } = useContext(EditableContext);

    // State to store the current styles of the selected element
    const [hoverBackgroundColor, setHoverBackgroundColor] = useState('#ffffff'); // Default to white
    const [hoverTextColor, setHoverTextColor] = useState('#000000'); // Default to black
    const [clickEvent, setClickEvent] = useState('');
    const [ariaLabel, setAriaLabel] = useState('');
    const [tooltip, setTooltip] = useState('');
    const [displayedStyles, setDisplayedStyles] = useState({});

    // Utility function to convert RGB/RGBA to Hex, handling transparent cases
    const rgbToHex = (rgb) => {
        if (rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') {
            return '#000000'; // Set a default fallback color for transparent
        }
        const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
        return result
            ? `#${((1 << 24) + (parseInt(result[1]) << 16) + (parseInt(result[2]) << 8) + parseInt(result[3]))
                .toString(16)
                .slice(1)
                .toUpperCase()}`
            : rgb;
    };

    // Fetch the styles when a new element is selected
    useEffect(() => {
        if (selectedElement) {
            const domElement = document.getElementById(selectedElement.id);
            if (domElement) {
                const computedStyles = getComputedStyle(domElement);
                const styles = {
                    backgroundColor: rgbToHex(computedStyles.backgroundColor || '#ffffff'),
                    color: rgbToHex(computedStyles.color || '#000000'),
                    width: computedStyles.width,
                    height: computedStyles.height,
                    padding: computedStyles.padding,
                    margin: computedStyles.margin,
                    borderRadius: computedStyles.borderRadius,
                    boxShadow: computedStyles.boxShadow,
                };
                setDisplayedStyles(styles); // Set the fetched styles for display

                // Set initial values for hover effects and accessibility
                setHoverBackgroundColor(styles.backgroundColor || '#ffffff');
                setHoverTextColor(styles.color || '#000000');
                setClickEvent(elements[selectedElement.id]?.clickEvent || ''); // Fetch click event if stored
                setAriaLabel(elements[selectedElement.id]?.ariaLabel || ''); // Fetch aria-label if stored
                setTooltip(elements[selectedElement.id]?.tooltip || ''); // Fetch tooltip if stored
            }
        }
    }, [selectedElement, elements]);

    if (!selectedElement) return null;

    const { id } = selectedElement;

    // Handlers for each field
    const handleHoverBackgroundColorChange = (e) => {
        const newColor = e.target.value;
        setHoverBackgroundColor(newColor);
        updateStyles(id, { ':hover': { backgroundColor: newColor } });
    };

    const handleHoverTextColorChange = (e) => {
        const newColor = e.target.value;
        setHoverTextColor(newColor);
        updateStyles(id, { ':hover': { color: newColor } });
    };

    const handleClickEventChange = (e) => {
        const newEvent = e.target.value;
        setClickEvent(newEvent);
        updateClickEvent(id, newEvent);
    };

    const handleAriaLabelChange = (e) => {
        const newLabel = e.target.value;
        setAriaLabel(newLabel);
        updateAccessibility(id, { ariaLabel: newLabel });
    };

    const handleTooltipChange = (e) => {
        const newTooltip = e.target.value;
        setTooltip(newTooltip);
        updateAccessibility(id, { tooltip: newTooltip });
    };

    return (
        <div className="button-editor editor">

            {/* Display the current styles */}
            <div className="current-styles">
                <h4>Current Styles:</h4>
                <p>Background Color: {displayedStyles.backgroundColor}</p>
                <p>Text Color: {displayedStyles.color}</p>
                <p>Width: {displayedStyles.width}</p>
                <p>Height: {displayedStyles.height}</p>
                <p>Padding: {displayedStyles.padding}</p>
                <p>Margin: {displayedStyles.margin}</p>
                <p>Border Radius: {displayedStyles.borderRadius}</p>
                <p>Box Shadow: {displayedStyles.boxShadow}</p>
            </div>
            <div className="editor-group">

                {/* Hover Settings */}
                <label>
                    Hover Background Color:
                    <div className="color-group">
                        <input
                            type="color"
                            value={hoverBackgroundColor}
                            onChange={(e) => handleHoverBackgroundColorChange}
                        />
                        <input
                            type="text"
                            value={hoverBackgroundColor}
                            readOnly
                            className="color-hex"
                        />
                    </div>
                </label>

                <label>
                    Hover Text Color:
                    <div className="color-group">
                        <input
                            type="color"
                            value={hoverTextColor}
                            onChange={(e) => handleHoverTextColorChange}
                        />
                        <input
                            type="text"
                            value={hoverTextColor}
                            readOnly
                            className="color-hex"
                        />
                    </div>
                </label>
            </div>

            <div className="editor-group">

                {/* Click Event */}
                <label>
                    Click Event (JS Function Name):
                    <input
                        type="text"
                        value={clickEvent}
                        onChange={handleClickEventChange}
                        placeholder="e.g., handleButtonClick"
                    />
                </label>

                {/* Accessibility Settings */}
                <label>
                    ARIA Label:
                    <input
                        type="text"
                        value={ariaLabel}
                        onChange={handleAriaLabelChange}
                        placeholder="Describe button purpose"
                    />
                </label>

                <label>
                    Tooltip:
                    <input
                        type="text"
                        value={tooltip}
                        onChange={handleTooltipChange}
                        placeholder="Tooltip text"
                    />
                </label>
            </div>

        </div>
    );
};

export default ButtonEditor;
