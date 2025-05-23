import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import '../Basic/css/EmptyState.css';

// Helper to generate a unique ID
const generateUniqueId = () => {
  return 'div-' + Math.random().toString(36).substr(2, 9);
};

// Helper to render a grid preview
const renderGridPreview = (config) => {
  const { columns, rows } = config;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '2px',
        background: '#e5e8ea',
        padding: '4px',
        borderRadius: '4px',
        minWidth: '48px',
        minHeight: '48px'
      }}
    >
      {Array(rows * columns).fill(null).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#bfc5c9',
            borderRadius: '2px',
            minHeight: '8px',
            aspectRatio: '1',
          }}
        />
      ))}
    </div>
  );
};

// Grid-specific configurations
const gridConfigurations = [
  {
    id: 'grid-2x2',
    name: '2×2 Grid',
    columns: 2,
    rows: 2,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-3x3',
    name: '3×3 Grid',
    columns: 3,
    rows: 3,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-4x4',
    name: '4×4 Grid',
    columns: 4,
    rows: 4,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-2x3',
    name: '2×3 Grid',
    columns: 2,
    rows: 3,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-3x2',
    name: '3×2 Grid',
    columns: 3,
    rows: 2,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-4x2',
    name: '4×2 Grid',
    columns: 4,
    rows: 2,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-2x4',
    name: '2×4 Grid',
    columns: 2,
    rows: 4,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-1x4',
    name: '1×4 Grid',
    columns: 4,
    rows: 1,
    get preview() { return renderGridPreview(this); }
  },
  {
    id: 'grid-4x1',
    name: '4×1 Grid',
    columns: 1,
    rows: 4,
    get preview() { return renderGridPreview(this); }
  }
];

const GridLayout = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, setElements } =
    useContext(EditableContext);
  const gridElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children = [] } = gridElement;
  const gridRef = useRef(null);
  const [showDivOptions, setShowDivOptions] = useState(false);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: gridRef,
    onDropItem: (item, parentId) => {
      const newId = generateUniqueId();
      setElements((prev) => [
        ...prev.map((el) =>
          el.id === parentId
            ? { ...el, children: [...new Set([...el.children, newId])] }
            : el
        ),
        {
          id: newId,
          type: item.type,
          parentId,
          styles: item.styles || {},
          children: []
        }
      ]);
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'gridLayout', styles });
  };

  const handleAddElement = (e) => {
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleGridSelect = (config) => {
    const totalCells = config.rows * config.columns;
    const newElements = [];
    const newChildren = [];
    
    // Create all cells in memory first
    for (let i = 0; i < totalCells; i++) {
      const newId = generateUniqueId();
      newChildren.push(newId);
      newElements.push({
        id: newId,
        type: 'div',
        parentId: id,
        styles: {
          padding: '8px',
          minHeight: '50px',
          background: 'rgba(0,0,0,0.02)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
          position: 'relative'
        },
        children: []
      });
    }

    // Update everything in one state update
    setElements(prev => [
      ...prev.map(el => el.id === id ? {
        ...el,
        children: newChildren,
        styles: {
          ...el.styles,
          display: 'grid',
          gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
          gridTemplateRows: `repeat(${config.rows}, 1fr)`,
          gap: '12px',
          padding: '12px',
          width: '100%',
          position: 'relative',
          boxSizing: 'border-box'
        }
      } : el),
      ...newElements
    ]);

    setShowDivOptions(false);
  };

  return (
    <div
      id={id}
      ref={(node) => {
        gridRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        display: 'grid',
        gridTemplateColumns: styles.gridTemplateColumns || 'repeat(4, 1fr)',
        gridGap: styles.gridGap || '1.5rem',
        padding: styles.padding || '10px',
        width: '100%',
        position: 'relative'
      }}
    >
      {children.length === 0 ? (
        <div
          className="empty-state-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100px',
            background: isOverCurrent ? '#f0f0f0' : 'transparent',
            gridColumn: '1 / -1'
          }}
        >
          {showDivOptions ? (
            <div className="inline-div-options-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', width: '100%', padding: '16px' }}>
              {gridConfigurations.map((config) => (
                <div
                  key={config.id}
                  className="inline-div-option"
                  onClick={(e) => { e.stopPropagation(); handleGridSelect(config); }}
                  style={{
                    cursor: 'pointer',
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '12px',
                    minWidth: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '2px solid #e5e8ea',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '2px solid #bfc5c9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '2px solid #e5e8ea';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  {config.preview}
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginTop: '8px', 
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    {config.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <button
              className="add-element-button"
              onClick={handleAddElement}
            >
              <span className="plus-icon">+</span>
            </button>
          )}
        </div>
      ) : (
        children.map((childId) =>
          renderElement(
            elements.find((el) => el.id === childId),
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            selectedElement
          )
        )
      )}
    </div>
  );
};

export default GridLayout;
