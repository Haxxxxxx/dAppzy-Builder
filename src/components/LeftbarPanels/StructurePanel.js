import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';

const StructurePanel = () => {
  const { elements, buildHierarchy, selectedElement, setSelectedElement } = useContext(EditableContext);
  const nestedElements = buildHierarchy(elements);

  // Define a mapping for friendly labels for each type
  const typeToLabel = {
    span: 'text',
    link: 'text',
    paragraph: 'text',
    description: 'text',
    title: 'text',
    'list-item': 'text',
    button: 'button',
    image: 'image',
    anchor: 'link',
    blockquote: 'quote',
    code: 'code block',
    pre: 'preformatted',
    timer: 'timer',
    remaining: 'remaining',
    value: 'price',
    currency: 'currency',
    quantity: 'quantity',
    price: 'total price',
    rareItemsTitle: 'rare items title',
    docItemsTitle: 'document items title',
    'rare-item': 'rare item',
    'document-item': 'document item',
    section: 'container',
    div: 'container',
    default: 'element',
    navbar: 'navbar',
    mintingSection: 'minting Section',
    hero: 'hero Section',
    cta: 'cta Section',
    footer: 'footer Section',
  };

  // Function to resolve a friendly label for an element type
  const getFriendlyLabel = (type, content) => {
    const label = typeToLabel[type] || typeToLabel.default;
    return content ? `${label} - ${content}` : label;
  };

  // State to track expanded/collapsed elements
  const [expandedElements, setExpandedElements] = useState({});

  // Toggle the expanded/collapsed state of an element
  const toggleExpand = (id) => {
    setExpandedElements((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the current state
    }));
  };

  // Recursive function to render structure
  const renderStructure = (elements) => {
    return elements
      .filter((element) => element) // Ensure the element is valid
      .map((element) => {
        const isExpanded = expandedElements[element.id] || false;

        return (
          <div
            key={element.id}
            style={{
              paddingLeft: '16px',
              borderLeft: '1px solid #ccc',
              marginBottom: '8px',
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement({ id: element.id, type: element.type });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                backgroundColor: selectedElement?.id === element.id ? '#313031' : 'transparent',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {element.children && element.children.length > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent onClick
                    toggleExpand(element.id);
                  }}
                  style={{
                    marginRight: '8px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
              {getFriendlyLabel(element.type, element.content || element.label || element.id)}
            </div>
            {isExpanded && element.children && element.children.length > 0 && (
              <div style={{ paddingLeft: '16px' }}>
                {renderStructure(element.children)}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="structure-panel">
      <h3>Page Structure</h3>
      {renderStructure(nestedElements)}
    </div>
  );
};

export default StructurePanel;
