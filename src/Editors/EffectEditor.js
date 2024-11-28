// src/components/EffectEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const EffectEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // State for each property
  const [boxShadow, setBoxShadow] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [visibility, setVisibility] = useState('visible');
  const [transition, setTransition] = useState('');
  const [animation, setAnimation] = useState('');

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);
        setBoxShadow(computedStyles.boxShadow || '');
        setOpacity(computedStyles.opacity || '');
        setVisibility(computedStyles.visibility || '-');
        setTransition(computedStyles.transition || '');
        setAnimation(computedStyles.animation || '');
      }
    }
  }, [selectedElement, elements]);

  const { id } = selectedElement;

  // Handlers for each property
  const handleBoxShadowChange = (e) => {
    const newBoxShadow = e.target.value;
    setBoxShadow(newBoxShadow);
    updateStyles(id, { boxShadow: newBoxShadow });
  };

  const handleOpacityChange = (e) => {
    const newOpacity = e.target.value;
    setOpacity(newOpacity);
    updateStyles(id, { opacity: newOpacity });
  };

  const handleVisibilityChange = (e) => {
    const newVisibility = e.target.value;
    setVisibility(newVisibility);
    updateStyles(id, { visibility: newVisibility });
  };

  const handleTransitionChange = (e) => {
    const newTransition = e.target.value;
    setTransition(newTransition);
    updateStyles(id, { transition: newTransition });
  };

  const handleAnimationChange = (e) => {
    const newAnimation = e.target.value;
    setAnimation(newAnimation);
    updateStyles(id, { animation: newAnimation });
  };

  return (
    <div className="effect-editor editor">
      <div className="editor-group">

        <label>
          Box Shadow:
          <select value={boxShadow} onChange={handleBoxShadowChange}>
            <option value="">None</option>
            <option value="2px 4px 10px rgba(0,0,0,0.3)">Small Shadow</option>
            <option value="5px 10px 20px rgba(0,0,0,0.5)">Medium Shadow</option>
            <option value="10px 15px 30px rgba(0,0,0,0.7)">Large Shadow</option>
          </select>
        </label>

        <label>
          Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={handleOpacityChange}
          />
        </label>

        <label>
          Visibility:
          <select value={visibility} onChange={handleVisibilityChange}>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="collapse">Collapse</option>
          </select>
        </label>

        <label>
          Transition:
          <select value={transition} onChange={handleTransitionChange}>
            <option value="">None</option>
            <option value="all 0.3s ease-in-out">Fade In/Out</option>
            <option value="all 0.5s ease">Slow Fade</option>
            <option value="all 0.2s linear">Quick Transition</option>
          </select>
        </label>

        <label>
          Animation:
          <select value={animation} onChange={handleAnimationChange}>
            <option value="">None</option>
            <option value="bounce 1s infinite">Bounce</option>
            <option value="fadeIn 1s forwards">Fade In</option>
            <option value="rotate 2s linear infinite">Rotate</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default EffectEditor;
