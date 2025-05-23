import React, { useContext, useRef, forwardRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import useElementDrop from '../../utils/useElementDrop';
import '../Basic/css/EmptyState.css';
import { divConfigurations } from '../../utils/UnifiedDropZone';

const Section = forwardRef(({
  id,
  parentId = null,
  handleOpenMediaPanel,
  styles: passedStyles = {},
  children: passedChildren,
  onDropItem,
  onClick: extraOnClick,
}, ref) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const [showDivOptions, setShowDivOptions] = useState(false);

  let sectionElement = elements.find((el) => el.id === id);
  const contextStyles = (sectionElement && sectionElement.styles) || {};
  const contextChildren = (sectionElement && sectionElement.children) || [];

  const styles = { ...contextStyles, ...passedStyles };
  const childrenToRender = passedChildren !== undefined ? passedChildren : contextChildren;
  const sectionRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id,
    elementRef: sectionRef,
    onDropItem: (item) => {
      let currentSection = elements.find((el) => el.id === id);
      if (!currentSection) {
        const newSectionElement = { id, type: 'section', styles: passedStyles, children: [], parentId };
        setElements((prev) => [...prev, newSectionElement]);
        currentSection = newSectionElement;
      }
      if (onDropItem) {
        onDropItem(item, id);
      } else {
        // Create new element and update section's children with its new id
        const newId = addNewElement(item.type, item.level || 1, null, id);
        setElements((prev) =>
          prev.map((el) =>
            el.id === id ? { ...el, children: [...el.children, newId] } : el
          )
        );
      }
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!sectionElement) {
      const newSectionElement = { id, type: 'section', styles: passedStyles, children: [], parentId };
      setElements((prev) => [...prev, newSectionElement]);
      setSelectedElement(newSectionElement);
      sectionElement = newSectionElement;
    } else {
      setSelectedElement(sectionElement);
    }
    if (typeof extraOnClick === 'function') {
      extraOnClick(e);
    }
  };

  const handleAddElement = (e) => {
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleDivSelect = (config) => {
    // Create flex elements recursively
    const createFlexElement = (config, parentId = null) => {
      const id = addNewElement(config.parentType || config.type, 1, 0, parentId, {
        styles: { gap: '12px', padding: '12px', display: 'flex', flexDirection: config.direction }
      });
      if (config.children && config.children.length > 0) {
        config.children.forEach(child => {
          if (child.children) {
            createFlexElement({ ...child, parentType: child.type, direction: child.type === 'vflexLayout' ? 'column' : 'row' }, id);
          } else {
            addNewElement(child.type, 1, 0, id, {
              styles: { flex: 1, gap: '8px', padding: '8px', display: 'flex', flexDirection: child.type === 'vflexLayout' ? 'column' : 'row' }
            });
          }
        });
      }
      return id;
    };

    createFlexElement(config, id);
    setShowDivOptions(false);
  };

  const backgroundContent =
    styles.backgroundType === 'video' && styles.backgroundUrl ? (
      <video
        src={styles.backgroundUrl}
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      />
    ) : styles.backgroundType === 'image' && styles.backgroundUrl ? (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${styles.backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        }}
      />
    ) : null;

  return (
    <section
      id={id}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        position: 'relative',
        padding: styles.padding || '10px',
        margin: styles.margin || '0',
        backgroundColor: isOverCurrent ? 'rgba(0, 0, 0, 0.1)' : styles.backgroundColor || 'transparent',
      }}
    >
      {backgroundContent}
      {(!childrenToRender ||
        (Array.isArray(childrenToRender) && childrenToRender.length === 0)) ? (
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
      ) : Array.isArray(childrenToRender) ? (
        childrenToRender.map((child, index) => {
          if (React.isValidElement(child)) {
            return child;
          } else {
            const childEl = elements.find((el) => el === child || el.id === child);
            return renderElement(
              childEl,
              elements,
              null,
              setSelectedElement,
              setElements,
              null,
              selectedElement,
              handleOpenMediaPanel
            );
          }
        })
      ) : (
        childrenToRender
      )}
    </section>
  );
});

Section.displayName = 'Section';

export default Section;
