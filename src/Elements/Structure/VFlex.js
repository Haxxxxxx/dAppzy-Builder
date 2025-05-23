import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import '../Basic/css/EmptyState.css';
import { divConfigurations } from '../../utils/UnifiedDropZone';

// Helper to generate a unique ID based on type
const generateUniqueId = (type) => {
  const prefix = type === 'vflexLayout' ? 'vflex' : 
                type === 'hflexLayout' ? 'hflex' : 
                type === 'container' ? 'container' : 'div';
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

const VFlexLayout = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, setElements } =
    useContext(EditableContext);
  const vFlexElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children = [] } = vFlexElement;
  const vFlexRef = useRef(null);
  const [showDivOptions, setShowDivOptions] = useState(false);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: vFlexRef,
    onDropItem: (item, parentId) => {
      const newId = generateUniqueId(item.type);
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
    setSelectedElement({ id, type: 'vflex', styles });
  };

  const handleAddElement = (e) => {
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleDivSelect = (config) => {
    // Create all elements in memory first
    const newElements = [];
    const elementMap = new Map();
    
    // Helper to create an element and its children
    const createElementInMemory = (config, parentId) => {
      const currentId = generateUniqueId(config.parentType || config.type);
      const currentElement = {
        id: currentId,
        type: config.parentType || config.type,
        parentId,
        styles: {
          flex: 1,
          gap: '12px',
          padding: '12px',
          display: 'flex',
          flexDirection: config.direction,
          position: 'relative',
          boxSizing: 'border-box'
        },
        children: []
      };
      
      newElements.push(currentElement);
      elementMap.set(currentId, currentElement);

      if (config.children && config.children.length > 0) {
        config.children.forEach(child => {
          const childConfig = {
            ...child,
            parentType: child.type,
            direction: child.type === 'vflexLayout' ? 'column' : 'row'
          };

          const childId = createElementInMemory(childConfig, currentId);
          currentElement.children.push(childId);
        });
      }

      return currentId;
    };

    // Create the entire structure starting from the container's children
    const childrenIds = config.children.map(child => {
      const childConfig = {
        ...child,
        parentType: child.type,
        direction: child.type === 'vflexLayout' ? 'column' : 'row'
      };
      return createElementInMemory(childConfig, id);
    });

    // Update everything in one state update
    setElements(prev => [
      ...prev.map(el => el.id === id ? {
        ...el,
        children: childrenIds,
        styles: {
          ...el.styles,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '12px',
          position: 'relative',
          boxSizing: 'border-box',
          justifyContent: styles.justifyContent || 'flex-start',
          alignItems: styles.alignItems || 'stretch',
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
        vFlexRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: styles.justifyContent || 'flex-start',
        alignItems: styles.alignItems || 'stretch',
        padding: styles.padding || '10px',
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
          }}
        >
          {showDivOptions ? (
            <div className="inline-div-options-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', width: '100%' }}>
              {divConfigurations.map((config) => (
                <div
                  key={config.id}
                  className="inline-div-option"
                  onClick={(e) => { e.stopPropagation(); handleDivSelect(config); }}
                  style={{
                    cursor: 'pointer',
                    background: '#e5e8ea',
                    borderRadius: '6px',
                    padding: '8px',
                    minWidth: '60px',
                    minHeight: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    border: '2px solid #e5e8ea',
                    transition: 'border 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.border = '2px solid #bfc5c9'}
                  onMouseLeave={e => e.currentTarget.style.border = '2px solid #e5e8ea'}
                >
                  {config.preview}
                  <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', textAlign: 'center' }}>{config.name}</div>
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

export default VFlexLayout;
