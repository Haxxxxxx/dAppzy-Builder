// SectionStructureModal.js
import React from 'react';
import { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const HeadingLevelSelector = ({}) => {
    const { selectedElement, elements, updateStyles, setElements } = useContext(EditableContext);
    const element = elements.find(el => el.id === selectedElement.id);

    const handleLevelChange = (e) => {
        const newLevel = parseInt(e.target.value, 10);
        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === selectedElement.id
              ? { ...el, level: newLevel }
              : el
          )
        );
      };
     
  
    return (
        <div>
        <label>Heading Level:</label>
        <select value={element.level} onChange={handleLevelChange}>
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
          <option value={5}>H5</option>
          <option value={6}>H6</option>
        </select>
      </div>
    );
  };
  
  export default HeadingLevelSelector;
  