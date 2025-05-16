import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/dropzone.css';
import '../Root.css';
import { structureConfigurations } from '../configs/structureConfigurations';
import { createPortal } from 'react-dom';

// Section Selection Popup Component
const SectionSelectionPopup = ({ onClose, onSelect }) => {
  // Define section configurations with their preview images
  const sectionConfigurations = {
    // Navbar configurations
    customTemplateNavbar: { name: 'Custom Navbar', previewImage: './img/previsu-custom-navbar.png' },
    twoColumn: { name: 'Two Columns', previewImage: './img/previsu-two-columns-navbar.png' },
    defiNavbar: { name: 'DeFi Navbar', previewImage: './img/previsu-defi-navbar.png' },

    // Hero configurations
    heroOne: { name: 'Basic Hero', previewImage: './img/previsu-basic-hero.png' },
    heroTwo: { name: 'Small Hero', previewImage: './img/previsu-small-hero.png' },
    heroThree: { name: 'Advanced Hero', previewImage: './img/previsu-advanced-hero.png' },

    // CTA configurations
    ctaOne: { name: 'Advanced CTA', previewImage: './img/previsu-advanced-cta.png' },
    ctaTwo: { name: 'Quick CTA', previewImage: './img/previsu-quick-cta.png' },

    // Web3 section configurations
    defiSection: { name: 'DeFi Dashboard', previewImage: './img/previsu-defi-dashboard.png' },
    mintingSection: { name: 'NFT Minting', previewImage: './img/previsu-minting.png' },
  
    // Footer configurations
    simpleFooter: { name: 'Simple Footer', previewImage: './img/previsu-simple-footer.png' },
    detailedFooter: { name: 'Detailed Footer', previewImage: './img/previsu-detailed-footer.png' },
    advancedFooter: { name: 'Advanced Footer', previewImage: './img/previsu-advanced-footer.png' },
    defiFooter: { name: 'DeFi Footer', previewImage: './img/previsu-defi-footer.png' },
  };

  const sections = Object.entries(structureConfigurations)
    .filter(([key]) => sectionConfigurations[key]) // Only include sections with configurations
    .map(([key, config]) => ({
      id: key,
      name: sectionConfigurations[key].name,
      previewImage: sectionConfigurations[key].previewImage,
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
          <select>
            <option>Category</option>
            {/* Ajoute ici les catégories si besoin */}
          </select>
          <input type="search" placeholder="Search" />
        </div>
        <div className="section-selection-sections-grid">
          {sections.map((section) => (
            <div
              key={section.id}
              className="section-selection-section-item"
            >
              <div className="section-selection-section-preview">
                <img
                  src={section.previewImage}
                  alt={section.name}
                  loading="lazy"
                />
              </div>
              <div className="section-selection-section-overlay">
                <button
                  className="section-selection-insert-btn"
                  onClick={() => onSelect(section)}
                >
                  <span class="material-symbols-outlined">
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

const divConfigurations = [
  {
    id: 'vflex-2-hflex',
    name: '2 Rows',
    parentType: 'vflex',
    direction: 'column',
    children: [{ type: 'hflex' }, { type: 'hflex' }]
  },
  {
    id: 'vflex-3-hflex',
    name: '3 Rows',
    parentType: 'vflex',
    direction: 'column',
    children: [{ type: 'hflex' }, { type: 'hflex' }, { type: 'hflex' }]
  },
  {
    id: 'hflex-2-vflex',
    name: '2 Columns',
    parentType: 'hflex',
    direction: 'row',
    children: [{ type: 'vflex' }, { type: 'vflex' }]
  },
  {
    id: 'hflex-3-vflex',
    name: '3 Columns',
    parentType: 'hflex',
    direction: 'row',
    children: [{ type: 'vflex' }, { type: 'vflex' }, { type: 'vflex' }]
  },
  {
    id: 'vflex-nested-grid',
    name: '2 Rows, 2 Cols Each',
    parentType: 'vflex',
    direction: 'column',
    children: [
      { type: 'hflex', children: [{ type: 'vflex' }, { type: 'vflex' }] },
      { type: 'hflex', children: [{ type: 'vflex' }, { type: 'vflex' }] }
    ]
  },
  {
    id: 'hflex-nested-grid',
    name: '2 Cols, 2 Rows Each',
    parentType: 'hflex',
    direction: 'row',
    children: [
      { type: 'vflex', children: [{ type: 'hflex' }, { type: 'hflex' }] },
      { type: 'vflex', children: [{ type: 'hflex' }, { type: 'hflex' }] }
    ]
  },
  {
    id: 'vflex-mixed',
    name: 'Row + Col',
    parentType: 'vflex',
    direction: 'column',
    children: [{ type: 'hflex' }, { type: 'vflex' }]
  },
  {
    id: 'hflex-mixed',
    name: 'Col + Row',
    parentType: 'hflex',
    direction: 'row',
    children: [{ type: 'vflex' }, { type: 'hflex' }]
  },
  {
    id: 'vflex-4-hflex',
    name: '4 Rows',
    parentType: 'vflex',
    direction: 'column',
    children: [{ type: 'hflex' }, { type: 'hflex' }, { type: 'hflex' }, { type: 'hflex' }]
  },
  {
    id: 'hflex-4-vflex',
    name: '4 Columns',
    parentType: 'hflex',
    direction: 'row',
    children: [{ type: 'vflex' }, { type: 'vflex' }, { type: 'vflex' }, { type: 'vflex' }]
  }
];

// Helper to render a mini preview for a config
function renderPreview(config, depth = 0) {
  const isVFlex = (config.parentType || config.type) === 'vflex';
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
        createFlexElement({ ...child, parentType: child.type, direction: child.type === 'vflex' ? 'column' : 'row' }, addNewElement, id);
      } else {
        addNewElement(child.type, 1, 0, id, {
          styles: { flex: 1, gap: '8px', padding: '8px', display: 'flex', flexDirection: child.type === 'vflex' ? 'column' : 'row' }
        });
      }
    });
  }
  return id;
}

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
  accept = ['ELEMENT', 'IMAGE', 'SPAN', 'BUTTON', 'CONNECT_WALLET_BUTTON', 'LINK', 'PARAGRAPH', 'HEADING', 'LIST', 'LIST_ITEM', 'BLOCKQUOTE', 'CODE', 'PRE', 'CAPTION', 'LEGEND', 'LINK_BLOCK', 'SECTION', 'defiSection', 'mintingSection', 'footer', 'navbar', 'hero', 'cta']
}) => {
  const dropRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSectionPopup, setShowSectionPopup] = useState(false);
  const [showDivOptions, setShowDivOptions] = useState(false);

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
    console.log('Library button clicked');
    setShowSectionPopup(true);
  };

  const handleConfigureClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDivOptions(true);
  };

  const handleSectionSelect = (section) => {
    console.log('Section selected:', section);
    if (onDrop) {
      // Get the section configuration from structureConfigurations
      const sectionConfig = structureConfigurations[section.id];
      if (!sectionConfig) {
        console.error('Section configuration not found:', section.id);
        return;
      }

      // Create a properly structured section object that matches the EditableContext expectations
      const sectionData = {
        type: sectionConfig.type || 'section',
        configuration: section.id,
        structure: section.id,
        styles: {
          ...sectionConfig.styles,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box'
        },
        children: sectionConfig.children.map(child => ({
          type: child.type,
          content: child.content || {},
          styles: {
            ...child.styles,
            position: 'relative',
            boxSizing: 'border-box'
          },
          settings: child.content?.settings || {},
          configuration: {
            ...child.content?.settings,
            enabled: true
          }
        })),
        settings: sectionConfig.settings || {},
        label: sectionConfig.label || section.name
      };

      console.log('Sending section data:', sectionData);
      onDrop(sectionData, parentId);
    }
    setShowSectionPopup(false);
  };

  const handleDivSelect = (config) => {
    if (onDrop && typeof window !== 'undefined') {
      // Use context's addNewElement for recursive creation
      const { addNewElement } = require('../context/EditableContext');
      // But since we don't have context here, pass the config to onDrop and let ContentList/EditableContext handle recursion
      onDrop({ flexConfig: config, isFlexConfig: true }, parentId);
    }
    setShowDivOptions(false);
  };

  const [{ isOver, draggedItem }, drop] = useDrop({
    accept,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if (onDrop) {
        // For sections, ensure we pass the full configuration
        if (item.type === 'section' || item.type === 'navbar' || item.type === 'hero' || item.type === 'cta' || item.type === 'footer' || item.type === 'defiSection' || item.type === 'mintingSection') {
          // Get the section configuration from structureConfigurations
          const sectionConfig = structureConfigurations[item.configuration];
          if (!sectionConfig) {
            console.error('Section configuration not found:', item.configuration);
            return;
          }

          // Determine the correct type based on the section configuration
          let type = item.type;
          if (item.configuration.includes('navbar')) {
            type = 'navbar';
          } else if (item.configuration.includes('hero')) {
            type = 'hero';
          } else if (item.configuration.includes('cta')) {
            type = 'cta';
          } else if (item.configuration.includes('defiSection')) {
            type = 'defiSection';
          } else if (item.configuration.includes('mintingSection')) {
            type = 'mintingSection';
          } else if (item.configuration.includes('footer')) {
            type = 'footer';
          }

          onDrop({
            type,
            configuration: item.configuration,
            structure: item.configuration,
            styles: {
              ...sectionConfig.styles,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              boxSizing: 'border-box'
            },
            children: sectionConfig.children.map(child => ({
              type: child.type,
              content: child.content || '',
              styles: {
                ...child.styles,
                position: 'relative',
                boxSizing: 'border-box'
              },
              settings: child.settings || {},
              children: child.children || []
            })),
            settings: sectionConfig.settings || {},
            label: sectionConfig.label || item.configuration
          }, parentId);
        } else {
          onDrop(item, parentId);
        }
      }
    },
    hover: (item, monitor) => {
      if (!dropRef.current) return;

      // Don't show dropzone if:
      // 1. Dragging a section or configured div
      // 2. Dragging a section into another section's content area
      const isDraggingSection = item.type === 'section' || item.type === 'navbar' || item.type === 'hero' || item.type === 'cta' || item.type === 'footer' || item.type === 'defiSection' || item.type === 'mintingSection';
      const isDraggingConfiguredDiv = item.type === 'div' && item.configuration;
      const isContentSection = parentId && parentId.includes('-content');

      if (isDraggingSection || isDraggingConfiguredDiv || (isDraggingSection && isContentSection)) {
        setIsVisible(false);
        return;
      }

      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      // Calculate the mouse position relative to the drop zone
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only update position if we're not already showing the drop zone
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
  });

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  // Don't render if:
  // 1. Dragging a section or configured div
  // 2. Dragging a section into another section's content area
  const isDraggingSection = draggedItem?.type === 'SECTION';
  const isDraggingConfiguredDiv = draggedItem?.type === 'DIV' && draggedItem?.configuration;
  const isContentSection = parentId && parentId.includes('-content');

  if (draggedItem && (isDraggingSection || isDraggingConfiguredDiv || (isDraggingSection && isContentSection))) {
    return null;
  }

  const isFirstDropzone = className === 'first-dropzone';
  const isDefaultDropzone = className === 'default-dropzone';

  return (
    <>
      <div
        ref={dropRef}
        className={`unified-dropzone ${className} ${isOver ? 'dropzone-hover' : ''} ${isDragging ? 'dropzone-active' : ''}`}
        onClick={handleInteraction}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: isFirstDropzone ? 'absolute' : (isDefaultDropzone ? 'static' : 'absolute'),
          left: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.x),
          top: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.y),
          right: isFirstDropzone ? '0' : 'auto',
          bottom: isFirstDropzone ? '0' : 'auto',
          opacity: isFirstDropzone || isDefaultDropzone ? 1 : (isVisible ? 1 : 0),
          transition: 'all 0.2s ease',
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
                    {renderPreview(config)}
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', textAlign: 'center' }}>{config.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dropzone-buttons">
                <button
                  className="dropzone-button configure-button"
                  onClick={handleConfigureClick}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    add
                  </span>
                </button>
                <button
                  className="dropzone-button library-button"
                  onClick={handleLibraryClick}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    folder_open
                  </span>
                </button>
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
}, (prevProps, nextProps) => {
  return (
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isOver === nextProps.isOver &&
    prevProps.scale === nextProps.scale &&
    prevProps.className === nextProps.className
  );
});

export default UnifiedDropZone; 