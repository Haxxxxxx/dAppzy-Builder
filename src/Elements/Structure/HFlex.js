import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import '../Basic/css/EmptyState.css';
import { divConfigurations } from '../../utils/UnifiedDropZone';
import { VFLEX_LAYOUT } from '../../constants/elementTypes';

const HFlexLayout = ({ id, handleOpenMediaPanel }) => {
  const { selectedElement, setSelectedElement, elements, setElements, addNewElement } = useContext(EditableContext);
  const hFlexElement = elements.find((el) => el.id === id) || {};
  const { styles = {}, children = [] } = hFlexElement;
  const hFlexRef = useRef(null);
  const [showDivOptions, setShowDivOptions] = useState(false);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: hFlexRef,
    onDropItem: (item) => {
      if (item.flexConfig) {
        handleDivSelect(item.flexConfig);
      } else {
        addNewElement(item.type, item.level || 1, null, id, item.children ? item : null);
      }
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(hFlexElement.id ? hFlexElement : { id, type: 'hflex', styles, children });
  };

  const handleAddElement = (e) => {
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleDivSelect = (config) => {
    // Helper to create an element and its children via addNewElement
    const createElementInMemory = (config, parentId) => {
      const currentId = addNewElement(
        config.parentType || config.type,
        1,
        null,
        parentId,
        {
          styles: {
            flex: 1,
            gap: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: config.direction,
            position: 'relative',
            boxSizing: 'border-box'
          }
        }
      );

      if (config.children && config.children.length > 0) {
        config.children.forEach(child => {
          const childConfig = {
            ...child,
            parentType: child.type,
            direction: child.type === VFLEX_LAYOUT ? 'column' : 'row'
          };
          createElementInMemory(childConfig, currentId);
        });
      }

      return currentId;
    };

    // Create the structure starting from the container's children
    config.children.forEach(child => {
      const childConfig = {
        ...child,
        parentType: child.type,
        direction: child.type === VFLEX_LAYOUT ? 'column' : 'row'
      };
      createElementInMemory(childConfig, id);
    });

    setShowDivOptions(false);
  };

  return (
    <div
      id={id}
      ref={(node) => {
        hFlexRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: children.length === 0 ? 'center' : (styles.justifyContent || 'flex-start'),
        alignItems: children.length === 0 ? 'center' : (styles.alignItems || 'stretch'),
        padding: styles.padding || '10px',
        boxSizing: 'border-box',
      }}
    >
      {children.length === 0 ? (
        <div className={`empty-state-container${isOverCurrent ? ' container-drop-hover' : ''}`}>
          <span className="empty-state-badge">Flex Row</span>
          {showDivOptions ? (
            <div className="layout-options-grid">
              {divConfigurations.map((config) => (
                <div
                  key={config.id}
                  className="layout-option"
                  onClick={(e) => { e.stopPropagation(); handleDivSelect(config); }}
                >
                  {config.preview}
                  <div className="layout-option-label">{config.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <button
              className="add-element-btn"
              onClick={handleAddElement}
            >
              <span className="plus-icon">+</span>
              Add Layout
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
            selectedElement,
            null,
            true,
            handleOpenMediaPanel
          )
        )
      )}
    </div>
  );
};

export default HFlexLayout;
