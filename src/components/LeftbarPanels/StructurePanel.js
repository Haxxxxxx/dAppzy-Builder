import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import '../css/StructurePanel.css';

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
            className="structure-tree-node"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement({ id: element.id, type: element.type });
              }}
              className={`structure-tree-label${selectedElement?.id === element.id ? ' selected' : ''}`}
            >
              {element.children && element.children.length > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(element.id);
                  }}
                  className="structure-tree-toggle"
                >
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
              {getFriendlyLabel(element.type, element.content || element.label || element.id)}
            </div>
            {isExpanded && element.children && element.children.length > 0 && (
              <div className="structure-tree-children">
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
