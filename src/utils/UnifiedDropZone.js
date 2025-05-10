import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/dropzone.css';
import '../Root.css';
import { structureConfigurations } from '../configs/structureConfigurations';

// Section Selection Popup Component
const SectionSelectionPopup = ({ onClose, onSelect }) => {
  // Define section configurations with their preview images
  const sectionConfigurations = {
    // Navbar configurations
    customTemplateNavbar: { name: 'Custom Navbar', previewImage: './img/previewcomponent.png' },
    twoColumn: { name: 'Two Columns', previewImage: './img/previewcomponent.png' },
    threeColumn: { name: 'Three Column', previewImage: './img/previewcomponent.png' },
    defiNavbar: { name: 'DeFi Navbar', previewImage: './img/previewcomponent.png' },
    
    // Hero configurations
    heroOne: { name: 'Basic Hero', previewImage: './img/previewcomponent.png' },
    heroTwo: { name: 'Small Hero', previewImage: './img/previewcomponent.png' },
    heroThree: { name: 'Advanced Hero', previewImage: './img/previewcomponent.png' },
    
    // CTA configurations
    ctaOne: { name: 'Advanced CTA', previewImage: './img/previewcomponent.png' },
    ctaTwo: { name: 'Quick CTA', previewImage: './img/previewcomponent.png' },
    
    // Content section configurations
    sectionOne: { name: 'Feature Section', previewImage: './img/previewcomponent.png' },
    sectionTwo: { name: 'Content Grid', previewImage: './img/previewcomponent.png' },
    sectionThree: { name: 'Testimonial Section', previewImage: './img/previewcomponent.png' },
    sectionFour: { name: 'Pricing Section', previewImage: './img/previewcomponent.png' }
  };

  const sections = Object.entries(structureConfigurations)
    .filter(([key]) => sectionConfigurations[key]) // Only include sections with configurations
    .map(([key, config]) => ({
      id: key,
      name: sectionConfigurations[key].name,
      previewImage: sectionConfigurations[key].previewImage,
      configuration: config
    }));

  return (
    <div className="section-selection-popup">
      <div className="popup-content">
        <div className="popup-header">
          <h3>Select a Section</h3>
          <button onClick={onClose} className="close-button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="sections-grid">
          {sections.map((section) => (
            <div
              key={section.id}
              className="section-item"
              onClick={() => onSelect(section)}
            >
              <div className="section-preview">
                <img 
                  src={section.previewImage} 
                  alt={section.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    marginBottom: '8px',
                    borderRadius: '4px',
                  }}
                  loading="lazy"
                />
              </div>
              <div className="section-name">{section.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const divConfigurations = [
  {
    id: 'vflex-2-hflex',
    name: '2 Rows',
    parentType: 'vflex',
    direction: 'column',
    children: [ { type: 'hflex' }, { type: 'hflex' } ]
  },
  {
    id: 'vflex-3-hflex',
    name: '3 Rows',
    parentType: 'vflex',
    direction: 'column',
    children: [ { type: 'hflex' }, { type: 'hflex' }, { type: 'hflex' } ]
  },
  {
    id: 'hflex-2-vflex',
    name: '2 Columns',
    parentType: 'hflex',
    direction: 'row',
    children: [ { type: 'vflex' }, { type: 'vflex' } ]
  },
  {
    id: 'hflex-3-vflex',
    name: '3 Columns',
    parentType: 'hflex',
    direction: 'row',
    children: [ { type: 'vflex' }, { type: 'vflex' }, { type: 'vflex' } ]
  },
  {
    id: 'vflex-nested-grid',
    name: '2 Rows, 2 Cols Each',
    parentType: 'vflex',
    direction: 'column',
    children: [
      { type: 'hflex', children: [ { type: 'vflex' }, { type: 'vflex' } ] },
      { type: 'hflex', children: [ { type: 'vflex' }, { type: 'vflex' } ] }
    ]
  },
  {
    id: 'hflex-nested-grid',
    name: '2 Cols, 2 Rows Each',
    parentType: 'hflex',
    direction: 'row',
    children: [
      { type: 'vflex', children: [ { type: 'hflex' }, { type: 'hflex' } ] },
      { type: 'vflex', children: [ { type: 'hflex' }, { type: 'hflex' } ] }
    ]
  },
  {
    id: 'vflex-mixed',
    name: 'Row + Col',
    parentType: 'vflex',
    direction: 'column',
    children: [ { type: 'hflex' }, { type: 'vflex' } ]
  },
  {
    id: 'hflex-mixed',
    name: 'Col + Row',
    parentType: 'hflex',
    direction: 'row',
    children: [ { type: 'vflex' }, { type: 'hflex' } ]
  },
  {
    id: 'vflex-4-hflex',
    name: '4 Rows',
    parentType: 'vflex',
    direction: 'column',
    children: [ { type: 'hflex' }, { type: 'hflex' }, { type: 'hflex' }, { type: 'hflex' } ]
  },
  {
    id: 'hflex-4-vflex',
    name: '4 Columns',
    parentType: 'hflex',
    direction: 'row',
    children: [ { type: 'vflex' }, { type: 'vflex' }, { type: 'vflex' }, { type: 'vflex' } ]
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
  accept = ['ELEMENT', 'IMAGE', 'SPAN', 'BUTTON', 'CONNECT_WALLET_BUTTON', 'LINK', 'PARAGRAPH', 'HEADING', 'LIST', 'LIST_ITEM', 'BLOCKQUOTE', 'CODE', 'PRE', 'CAPTION', 'LEGEND', 'LINK_BLOCK', 'SECTION']
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

    if (className === 'first-dropzone' && onPanelToggle) {
      onPanelToggle('sidebar');
    }
  }, [onClick, className, onPanelToggle]);

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

      // Determine the correct type based on the section ID
      let type = 'section';
      if (section.id.toLowerCase().includes('navbar')) {
        type = 'navbar';
      } else if (section.id.toLowerCase().includes('hero')) {
        type = 'hero';
      } else if (section.id.toLowerCase().includes('cta')) {
        type = 'cta';
      } else if (section.id.toLowerCase().includes('footer')) {
        type = 'footer';
      }

      console.log('Determined section type:', type); // Debug log

      // Get base styles based on section type and configuration
      let baseStyles = {};
      if (type === 'section') {
        // Apply section-specific styles based on the section ID
        if (section.id === 'sectionOne') {
          baseStyles = {
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: '#f9f9f9',
            flexDirection: 'column',
          };
        } else if (section.id === 'sectionTwo') {
          baseStyles = {
            backgroundColor: '#FFFFFF',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          };
        } else if (section.id === 'sectionThree') {
          baseStyles = {
            backgroundColor: '#FFFFFF',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          };
        } else if (section.id === 'sectionFour') {
          baseStyles = {
            backgroundColor: '#FFFFFF',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          };
        }
      } else if (type === 'hero') {
        if (section.id === 'heroThree') {
          baseStyles = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '40px',
            backgroundColor: '#ffffff',
            gap: '10vw',
            margin: '0',
          };
        } else if (section.id === 'heroTwo') {
          baseStyles = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: '#ffffff',
            textAlign: 'center',
          };
        } else {
          baseStyles = {
            display: 'flex',
            position: 'relative',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#ffffff',
            gap: '1rem',
            margin: '0',
          };
        }
      } else if (type === 'cta') {
        if (section.id === 'ctaTwo') {
          baseStyles = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: '#ffffff',
            textAlign: 'center',
          };
        } else {
          baseStyles = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            gap: '32px',
            backgroundColor: '#FFFFFF',
          };
        }
      }

      // Create a properly structured section object that matches the EditableContext expectations
      const sectionData = {
        type,
        configuration: section.id,
        structure: section.id,
        styles: {
          ...baseStyles,
          ...(sectionConfig.styles || {})
        },
        children: sectionConfig.children.map(child => ({
          type: child.type,
          content: child.content || '',
          styles: child.styles || {},
          settings: child.settings || {},
          children: child.children || []
        })),
        settings: sectionConfig.settings || {},
        label: sectionConfig.label || section.name
      };
      
      console.log('Sending section data:', sectionData); // Debug log
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
        if (item.type === 'section' || item.type === 'navbar' || item.type === 'hero' || item.type === 'cta' || item.type === 'footer') {
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
          } else if (item.configuration.includes('footer')) {
            type = 'footer';
          }

          onDrop({
            type,
            configuration: item.configuration,
            structure: item.configuration,
            styles: sectionConfig.styles || {},
            children: sectionConfig.children.map(child => ({
              type: child.type,
              content: child.content || '',
              styles: child.styles || {},
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
      const isDraggingSection = item.type === 'section' || item.type === 'navbar' || item.type === 'hero' || item.type === 'cta' || item.type === 'footer';
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