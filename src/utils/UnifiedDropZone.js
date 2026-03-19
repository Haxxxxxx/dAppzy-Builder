import React, { useRef, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/dropzone.css';
import '../Root.css';
import { structureConfigurations } from '../configs/structureConfigurations';
import { createPortal } from 'react-dom';
import { defaultNavbarStyles, CustomTemplateNavbarStyles } from '../Elements/Sections/Navbars/DefaultNavbarStyles';
import { defaultHeroStyles, CustomTemplateHeroStyles, heroTwoStyles } from '../Elements/Sections/Heros/defaultHeroStyles';
import { sectionPopupConfigs, SECTION_POPUP_CATEGORIES, ALL_DROPPABLE_TYPES, SECTION_TYPES, resolveConfigType } from '../core/elementRegistry';
import { NAVBAR, HERO, BUTTON, VFLEX_LAYOUT, DIV } from '../constants/elementTypes';
import { isDescendantOf, buildSectionData, DROP_REJECTION_REASONS } from './dndUtils';
import { useToast } from '../context/ToastContext';

// Section Selection Popup Component
const SectionSelectionPopup = ({ onClose, onSelect }) => {
  const defaultPreviewImage = './img/previewcomponent.png';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (sectionId) => {
    setImageErrors(prev => ({
      ...prev,
      [sectionId]: true
    }));
  };

  const sections = Object.entries(structureConfigurations)
    .filter(([key]) => sectionPopupConfigs[key])
    .filter(([key]) => {
      const matchesCategory = selectedCategory === 'All' || sectionPopupConfigs[key].category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        sectionPopupConfigs[key].name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .map(([key, config]) => ({
      id: key,
      name: sectionPopupConfigs[key].name,
      previewImage: sectionPopupConfigs[key].previewImage,
      category: sectionPopupConfigs[key].category,
      configuration: config
    }));

  return createPortal(
    <div className="section-selection-popup">
      <div className="section-selection-popup-content">
        <div className="section-selection-popup-header">
          <h3 className='section-selection-popup-header-title'>Sections Library</h3>
          <button onClick={onClose} className="section-selection-close-button">&times;</button>
        </div>
        <hr className='section-selection-popup-hr'></hr>
        <div className="section-selection-popup-toolbar">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="section-selection-category-select"
          >
            {SECTION_POPUP_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input 
            type="search" 
            placeholder="Search" 
            className="section-selection-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="section-selection-sections-grid">
          {sections.map((section) => (
            <div
              key={section.id}
              className="section-selection-section-item"
            >
              <div className="section-selection-section-preview">
                <img
                  src={imageErrors[section.id] ? defaultPreviewImage : section.previewImage}
                  alt={section.name}
                  loading="lazy"
                  onError={() => handleImageError(section.id)}
                />
              </div>
              <div className="section-selection-section-name">
                {section.name}
              </div>
              <div className="section-selection-section-overlay">
                <button
                  className="section-selection-insert-btn"
                  onClick={() => onSelect(section)}
                >
                  <span className="material-symbols-outlined">
                    download
                  </span>
                  Insert
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Helper to render a mini preview for a config
function renderPreview(config, depth = 0) {
  const isVFlex = (config.parentType || config.type) === VFLEX_LAYOUT;
  const direction = isVFlex ? 'column' : 'row';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: '3px',
        background: depth === 0 ? '#e5e8ea' : '#d3d7db',
        borderRadius: '4px',
        padding: depth === 0 ? '4px' : '2px',
        minWidth: depth === 0 ? '48px' : '16px',
        minHeight: depth === 0 ? '24px' : '8px',
        alignItems: 'stretch',
        justifyContent: 'stretch',
      }}
    >
      {config.children && config.children.map((child, i) =>
        child.children ? (
          <div key={i} style={{ flex: 1 }}>
            {renderPreview({ ...child, parentType: child.type }, depth + 1)}
          </div>
        ) : (
          <div
            key={i}
            style={{
              flex: 1,
              background: '#bfc5c9',
              borderRadius: '2px',
              margin: direction === 'row' ? '0 1px' : '1px 0',
              minHeight: depth === 0 ? '16px' : '8px',
              minWidth: depth === 0 ? '16px' : '8px',
            }}
          />
        )
      )}
    </div>
  );
}

// Recursively create all nested flex elements in the element tree
function createFlexElement(config, addNewElement, parentId = null) {
  const id = addNewElement(config.parentType || config.type, 1, 0, parentId, {
    styles: { gap: '12px', padding: '12px', display: 'flex', flexDirection: config.direction }
  });
  if (config.children && config.children.length > 0) {
    config.children.forEach(child => {
      if (child.children) {
        createFlexElement({ ...child, parentType: child.type, direction: child.type === VFLEX_LAYOUT ? 'column' : 'row' }, addNewElement, id);
      } else {
        addNewElement(child.type, 1, 0, id, {
          styles: { flex: 1, gap: '8px', padding: '8px', display: 'flex', flexDirection: child.type === VFLEX_LAYOUT ? 'column' : 'row' }
        });
      }
    });
  }
  return id;
}

export const divConfigurations = [
  {
    id: 'vflex-2-hflex',
    name: '2 Rows',
    parentType: 'vflexLayout',
    direction: 'column',
    children: [{ type: 'hflexLayout' }, { type: 'hflexLayout' }],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'vflex-3-hflex',
    name: '3 Rows',
    parentType: 'vflexLayout',
    direction: 'column',
    children: [{ type: 'hflexLayout' }, { type: 'hflexLayout' }, { type: 'hflexLayout' }],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'hflex-2-vflex',
    name: '2 Columns',
    parentType: 'hflexLayout',
    direction: 'row',
    children: [{ type: 'vflexLayout' }, { type: 'vflexLayout' }],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'hflex-3-vflex',
    name: '3 Columns',
    parentType: 'hflexLayout',
    direction: 'row',
    children: [{ type: 'vflexLayout' }, { type: 'vflexLayout' }, { type: 'vflexLayout' }],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'vflex-nested-grid',
    name: '2 Rows, 2 Cols Each',
    parentType: 'vflexLayout',
    direction: 'column',
    children: [
      { type: 'hflexLayout', children: [{ type: 'vflexLayout' }, { type: 'vflexLayout' }] },
      { type: 'hflexLayout', children: [{ type: 'vflexLayout' }, { type: 'vflexLayout' }] }
    ],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'hflex-nested-grid',
    name: '2 Cols, 2 Rows Each',
    parentType: 'hflexLayout',
    direction: 'row',
    children: [
      { type: 'vflexLayout', children: [{ type: 'hflexLayout' }, { type: 'hflexLayout' }] },
      { type: 'vflexLayout', children: [{ type: 'hflexLayout' }, { type: 'hflexLayout' }] }
    ],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'vflex-mixed',
    name: 'Row + Col',
    parentType: 'vflexLayout',
    direction: 'column',
    children: [{ type: 'hflexLayout' }, { type: 'vflexLayout' }],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'hflex-mixed',
    name: 'Col + Row',
    parentType: 'hflexLayout',
    direction: 'row',
    children: [{ type: 'vflexLayout' }, { type: 'hflexLayout' }],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'vflex-4-hflex',
    name: '4 Rows',
    parentType: 'vflexLayout',
    direction: 'column',
    children: [{ type: 'hflexLayout' }, { type: 'hflexLayout' }, { type: 'hflexLayout' }, { type: 'hflexLayout' }],
    get preview() { return renderPreview(this); }
  },
  {
    id: 'hflex-4-vflex',
    name: '4 Columns',
    parentType: 'hflexLayout',
    direction: 'row',
    children: [{ type: 'vflexLayout' }, { type: 'vflexLayout' }, { type: 'vflexLayout' }, { type: 'vflexLayout' }],
    get preview() { return renderPreview(this); }
  }
];

const UnifiedDropZone = React.memo(({
  onDrop,
  parentId,
  onClick,
  text,
  className,
  scale,
  isDragging,
  index,
  onPanelToggle,
  accept = ALL_DROPPABLE_TYPES,
  elements,
}) => {
  const dropRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [showSectionPopup, setShowSectionPopup] = useState(false);
  const [showDivOptions, setShowDivOptions] = useState(false);
  const { showToast } = useToast();

  const handleInteraction = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'click' && onClick) {
      onClick(e);
    }
  }, [onClick]);

  const handleLibraryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSectionPopup(true);
  };

  const handleConfigureClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleSectionSelect = (section) => {
    if (onDrop) {
      const navbarStyles = section.id === 'customTemplateNavbar'
        ? CustomTemplateNavbarStyles
        : defaultNavbarStyles;
      const heroStyles = section.id === 'heroTwo'
        ? heroTwoStyles
        : (section.id === 'customTemplateHero' ? CustomTemplateHeroStyles : defaultHeroStyles);

      const sectionData = buildSectionData(
        section.id,
        structureConfigurations,
        resolveConfigType,
        { navbarStyles, heroStyles, NAVBAR, HERO, BUTTON }
      );

      if (!sectionData) return;

      onDrop(sectionData, parentId);
    }
    setShowSectionPopup(false);
  };

  const handleDivSelect = (config) => {
    if (onDrop && typeof window !== 'undefined') {
      onDrop({ flexConfig: config, isFlexConfig: true }, parentId);
    }
    setShowDivOptions(false);
  };

  const [{ isOver, draggedItem }, drop] = useDrop(() => ({
    accept,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      // Circular reference guard: block dropping a container into its own descendant
      if (item.id && parentId && elements) {
        if (isDescendantOf(item.id, parentId, elements)) {
          if (import.meta.env.DEV) console.warn('[DnD] Blocked: cannot drop element into its own descendant');
          showToast(DROP_REJECTION_REASONS.CIRCULAR, 'info');
          return;
        }
      }
      if (onDrop) {
        // For sections, ensure we pass the full configuration
        if (SECTION_TYPES.has(item.type)) {
          const navbarStyles = item.configuration === 'customTemplateNavbar'
            ? CustomTemplateNavbarStyles
            : defaultNavbarStyles;
          const heroStyles = item.configuration === 'heroTwo'
            ? heroTwoStyles
            : (item.configuration === 'customTemplateHero' ? CustomTemplateHeroStyles : defaultHeroStyles);

          const sectionData = buildSectionData(
            item.configuration,
            structureConfigurations,
            resolveConfigType,
            { navbarStyles, heroStyles, NAVBAR, HERO, BUTTON }
          );

          if (!sectionData) return;

          onDrop(sectionData, parentId);
        } else {
          onDrop(item, parentId);
        }
      }
    },
    hover: (item, monitor) => {
      if (!dropRef.current) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Track cursor position for floating dropzone types (non-first, non-default)
      if (!isVisible) {
        setPosition({
          x: clientOffset.x,
          y: clientOffset.y
        });
        setIsVisible(true);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      draggedItem: monitor.getItem()
    }),
  }), [accept, onDrop, parentId]);

  // Use callback ref so the drop connector always tracks the current DOM node.
  // Previously, returning null for section drags unmounted the element, and the
  // useEffect with [drop] never re-fired on remount — breaking ALL subsequent drops.
  const setDropRef = useCallback((node) => {
    dropRef.current = node;
    drop(node);
  }, [drop]);

  const isFirstDropzone = className === 'first-dropzone';
  const isDefaultDropzone = className === 'default-dropzone';

  return (
    <>
      <div
        ref={setDropRef}
        className={`unified-dropzone ${className} ${isOver ? 'dropzone-hover' : ''} ${isDragging ? 'dropzone-active' : ''}`}
        onClick={handleInteraction}
        style={{
          position: isFirstDropzone ? 'absolute' : (isDefaultDropzone ? 'static' : 'absolute'),
          left: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.x),
          top: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.y),
          right: isFirstDropzone ? '0' : 'auto',
          bottom: isFirstDropzone ? '0' : 'auto',
          opacity: isFirstDropzone || isDefaultDropzone ? 1 : (isVisible ? 1 : 0),
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: isDragging ? 'auto' : 'none',
          transform: isFirstDropzone ? 'none' : (isDefaultDropzone ? 'none' : 'translate(-50%, -50%)'),
          zIndex: 1000,
          height: isFirstDropzone ? '100%' : (isDefaultDropzone ? 'auto' : '20px'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: isFirstDropzone || isDefaultDropzone ? '5px' : '5px',
        }}
      >
        <div className="dropzone-content">
          {(isDefaultDropzone || isFirstDropzone) ? (
            showDivOptions ? (
              <div className="inline-div-options-grid">
                <button
                  className="div-options-back"
                  onClick={(e) => { e.stopPropagation(); setShowDivOptions(false); }}
                  type="button"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </button>
                <p className="div-options-heading">Choose a layout</p>
                <div className="div-options-cards">
                  {divConfigurations.map((config) => (
                    <div
                      key={config.id}
                      className="div-option-card"
                      onClick={(e) => { e.stopPropagation(); handleDivSelect(config); }}
                    >
                      {config.preview}
                      <span className="div-option-label">{config.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-canvas-state">
                <span className="material-symbols-outlined empty-canvas-icon">dashboard_customize</span>
                <h3 className="empty-canvas-title">Start building your page</h3>
                <p className="empty-canvas-subtitle">Add a layout structure or pick a pre-built section</p>
                <div className="empty-canvas-actions">
                  <button
                    className="empty-canvas-btn empty-canvas-btn-primary"
                    onClick={handleConfigureClick}
                    type="button"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Layout
                  </button>
                  <button
                    className="empty-canvas-btn empty-canvas-btn-secondary"
                    onClick={handleLibraryClick}
                    type="button"
                  >
                    <span className="material-symbols-outlined">folder_open</span>
                    Sections Library
                  </button>
                </div>
                <p className="empty-canvas-hint">or drag an element from the sidebar</p>
              </div>
            )
          ) : (
            <div className="dropzone-text">
              {isOver ? 'Drop here to add an element' : text || 'Drop here !'}
            </div>
          )}
        </div>
      </div>
      {showSectionPopup && (
        <SectionSelectionPopup
          onClose={() => setShowSectionPopup(false)}
          onSelect={handleSectionSelect}
        />
      )}
    </>
  );
});

export default UnifiedDropZone; 