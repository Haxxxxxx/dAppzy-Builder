import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const StructurePanel = () => {
  const { elements, buildHierarchy } = useContext(EditableContext);
  const nestedElements = buildHierarchy(elements);

  const renderStructure = (elements) => {
    return elements.map((element) => (
      <div key={element.id} style={{ paddingLeft: '16px', borderLeft: '1px solid #ccc', marginBottom: '8px' }}>
        <div>
          {element.type} - {element.content || `[${element.type}]`}
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
