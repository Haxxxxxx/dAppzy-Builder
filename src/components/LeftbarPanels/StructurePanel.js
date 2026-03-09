import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { buildHierarchy } from '../../utils/LeftBarUtils/elementUtils';
import '../css/StructurePanel.css';

const StructurePanel = () => {
  const { elements, selectedElement, setSelectedElement, setElements } = useContext(EditableContext);
  const nestedElements = buildHierarchy(elements);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Reorder an element among its siblings
  const reorderElement = (elementId, direction) => {
    setElements((prev) => {
      const el = prev.find((e) => e.id === elementId);
      if (!el) return prev;
      const parent = prev.find((e) => e.id === el.parentId);
      if (!parent || !parent.children) return prev;
      const idx = parent.children.indexOf(elementId);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= parent.children.length) return prev;
      const newChildren = [...parent.children];
      [newChildren[idx], newChildren[newIdx]] = [newChildren[newIdx], newChildren[idx]];
      return prev.map((e) => e.id === parent.id ? { ...e, children: newChildren } : e);
    });
  };

  // Recursive function to render structure
  const renderStructure = (elems) => {
    const valid = elems.filter((element) => element);
    return valid.map((element, idx) => {
        const isExpanded = expandedElements[element.id] || false;
        const isFirst = idx === 0;
        const isLast = idx === valid.length - 1;
        const hasParent = !!element.parentId;

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
              <span className="structure-tree-text">
                {getFriendlyLabel(element.type, element.content || element.label || element.id)}
              </span>
              {hasParent && (
                <span className="structure-reorder-btns">
                  <button
                    className="reorder-btn"
                    disabled={isFirst}
                    onClick={(e) => { e.stopPropagation(); reorderElement(element.id, -1); }}
                    title="Move up"
                  >
                    <span className="material-symbols-outlined">arrow_upward</span>
                  </button>
                  <button
                    className="reorder-btn"
                    disabled={isLast}
                    onClick={(e) => { e.stopPropagation(); reorderElement(element.id, 1); }}
                    title="Move down"
                  >
                    <span className="material-symbols-outlined">arrow_downward</span>
                  </button>
                </span>
              )}
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

  const filteredElements = searchQuery.trim()
    ? elements.filter((el) => {
        const q = searchQuery.toLowerCase();
        return (
          (el.label && el.label.toLowerCase().includes(q)) ||
          (el.type && el.type.toLowerCase().includes(q)) ||
          (el.content && typeof el.content === 'string' && el.content.toLowerCase().includes(q))
        );
      })
    : null;

  return (
    <div className="structure-panel">
      <h3>Page Structure</h3>
      <div className="structure-search">
        <input
          type="text"
          placeholder="Search elements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="structure-search-input"
        />
        {searchQuery && (
          <button className="structure-search-clear" onClick={() => setSearchQuery('')}>
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
      {filteredElements ? (
        <div className="structure-search-results">
          {filteredElements.length === 0 && <p className="structure-no-results">No elements found</p>}
          {filteredElements.map((el) => (
            <div
              key={el.id}
              className={`structure-tree-label${selectedElement?.id === el.id ? ' selected' : ''}`}
              onClick={() => setSelectedElement({ id: el.id, type: el.type })}
            >
              {getFriendlyLabel(el.type, el.content || el.label || el.id)}
            </div>
          ))}
        </div>
      ) : (
        renderStructure(nestedElements)
      )}
    </div>
  );
};

export default StructurePanel;
