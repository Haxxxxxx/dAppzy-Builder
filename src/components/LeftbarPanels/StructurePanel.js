import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const StructurePanel = () => {
  const { elements, buildHierarchy } = useContext(EditableContext);
  const nestedElements = buildHierarchy(elements);

  // Recursive function to render structure
  const renderStructure = (elements) => {
    return elements
      .filter((element) => element && element.type) // Ensure the element is valid
      .map((element) => (
        <div
          key={element.id}
          style={{ paddingLeft: '16px', borderLeft: '1px solid #ccc', marginBottom: '8px' }}
        >
          <div>
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
