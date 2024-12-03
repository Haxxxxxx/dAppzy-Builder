// src/components/LeftbarPanels/StructurePanel.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const StructurePanel = () => {
  const { elements, buildHierarchy, selectedElement, setSelectedElement } = useContext(EditableContext);
  const nestedElements = buildHierarchy(elements);

  // Recursive function to render structure
  const renderStructure = (elements) => {
    return elements
      .filter((element) => element) // Ensure the element is valid
      .map((element) => (
        <div
          key={element.id}
          style={{ paddingLeft: '16px', borderLeft: '1px solid #ccc', marginBottom: '8px' }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement({ id: element.id, type: element.type });
            }}
            style={{
              cursor: 'pointer',
              backgroundColor: selectedElement?.id === element.id ? '#e0e0e0' : 'transparent',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {element.type} - {element.content || element.id}
          </div>
          {element.children && element.children.length > 0 && renderStructure(element.children)}
        </div>
      ));
  };

  return (
    <div className="structure-panel">
      <h3>Page Structure</h3>
      {renderStructure(nestedElements)}
    </div>
  );
};

export default StructurePanel;
