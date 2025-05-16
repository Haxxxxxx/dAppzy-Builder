import React, { useContext, useState, useEffect, useRef, forwardRef, useMemo, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';
import DeFiFooter from '../Sections/Footers/DeFiFooter';
import { FooterConfigurations } from '../../configs/footers/FooterConfigurations';
import { structureConfigurations } from '../../configs/structureConfigurations.js';

/**
 * DraggableFooter component for rendering and managing footer sections.
 * Supports drag and drop functionality, modal interactions, and different footer configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the footer
 * @param {string} props.configuration - Footer configuration type
 * @param {boolean} props.isEditing - Whether the footer is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the footer preview
 * @param {string} props.label - Label for the footer
 */
const DraggableFooter = forwardRef(({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc,
  label,
}, forwardedRef) => {
  const {
    addNewElement,
    setElements,
    elements,
    findElementById,
    setSelectedElement,
    generateUniqueId,
    updateElement
  } = useContext(EditableContext);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  const dragRef = useRef(null);

  // Memoize configuration mapping
  const mappedConfiguration = useMemo(() => {
    // Map the configuration names from FooterPanel to the correct configurations
    const configMap = {
      'simpleFooter': 'simpleFooter',
      'detailedFooter': 'detailedFooter',
      'advancedFooter': 'advancedFooter',
      'defiFooter': 'defiFooter'
    };
    return configMap[configuration] || configuration;
  }, [configuration]);

  // Memoize footer and its children
  const { footer, footerConfig, resolvedChildren, childrenToRender } = useMemo(() => {
    const footer = findElementById(id, elements);
    const footerConfig = FooterConfigurations[mappedConfiguration] || {};
    const configChildren = footerConfig.children || [];
    
    const resolvedChildren = (footer?.children || [])
      .map((childId) => findElementById(childId, elements))
      .filter(Boolean);
    
    return {
      footer,
      footerConfig,
      resolvedChildren,
      childrenToRender: resolvedChildren.length > 0 ? resolvedChildren : configChildren
    };
  }, [id, elements, mappedConfiguration, findElementById]);

  // Optimize drag-and-drop functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'footer', 
      configuration: mappedConfiguration,
      structure: mappedConfiguration,
      styles: footerConfig?.styles || {},
      children: footerConfig?.children || []
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingFooter = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'footer' && el?.configuration === item.configuration);

            if (!existingFooter) {
              const footerConfig = FooterConfigurations[item.configuration];
              if (footerConfig) {
                // Create footer with optimized configuration
                const newFooterId = addNewElement('footer', 1, null, targetSectionId, {
                ...footerConfig,
                configuration: item.configuration,
                  structure: item.configuration,
                  styles: {
                    ...footerConfig.styles,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    boxSizing: 'border-box'
                  }
                });

                // Create content container
                const contentContainerId = `${newFooterId}-content`;
                const contentContainer = {
                  id: contentContainerId,
                      type: 'div',
                  styles: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto'
                  },
                  children: [],
                  parentId: newFooterId
                };

                // Create default content elements
                const defaultChildren = footerConfig.children.map(child => ({
                  id: `${contentContainerId}-${child.type}-${Date.now()}`,
                  type: child.type,
                  content: child.content,
                  styles: {
                    ...child.styles,
                    position: 'relative',
                    boxSizing: 'border-box',
                    padding: '10px',
                    margin: '10px 0'
                  },
                  parentId: contentContainerId,
                      children: []
                }));

                contentContainer.children = defaultChildren.map(child => child.id);

                // Add all new elements
                setElements(prev => {
                  const existingIds = new Set(prev.map(el => el.id));
                  const newElements = [contentContainer, ...defaultChildren].filter(el => !existingIds.has(el.id));
                  return [...prev, ...newElements];
                });

                // Update footer with content container
                updateElement(newFooterId, {
                  children: [contentContainerId]
                });
            }
          }
        }
        setSelectedElement({ id: item.id, type: 'footer', configuration: item.configuration });
      }
    }
  }), [configuration, isEditing, elements, findElementById, addNewElement, setSelectedElement, footerConfig, updateElement]);

  // Optimize drop handling
  const onDropItem = useCallback((item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentFooter = findElementById(id, elements);
    if (!currentFooter) return;

    if (item.type === 'footer') return;

    // Check for duplicates efficiently
    const existingElements = currentFooter.children
      ?.map(childId => findElementById(childId, elements))
    .filter(Boolean);

    // Check for duplicates by type and content
    const hasDuplicate = existingElements?.some(el => 
      el.type === item.type && el.content === item.content
    );
    if (hasDuplicate) return;

    // Generate a unique ID with timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const newId = `${item.type}-${timestamp}-${randomStr}`;

    // Optimized base styles
    const baseStyles = {
      heading: {
        color: '#1A1A1A',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        lineHeight: '1.2'
      },
      subheading: {
        color: '#4A4A4A',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        marginBottom: '1.5rem'
      },
      button: {
        backgroundColor: '#5C4EFA',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      },
      paragraph: {
        color: '#4A4A4A',
        fontSize: '1rem',
        lineHeight: '1.6',
        marginBottom: '1rem'
      },
      span: {
        color: '#4A4A4A',
        fontSize: '0.875rem',
        lineHeight: '1.5'
      }
    };

    // Create element with optimized configuration
    const elementId = addNewElement(
      item.type,
      1,
      index,
      id,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: {
          ...baseStyles[item.type],
          ...item.styles
        },
        configuration: item.configuration || {},
        children: item.children || []
      }
    );

    // Batch state updates
    setElements(prevElements => {
      // Check if the element is already in the children array
      const currentFooter = prevElements.find(el => el.id === id);
      if (!currentFooter) return prevElements;

      const hasElement = currentFooter.children?.includes(elementId);
      if (hasElement) return prevElements;

      return prevElements.map(el => {
        if (el.id === id) {
          const updatedChildren = [...(el.children || [])];
          if (!updatedChildren.includes(elementId)) {
            updatedChildren.splice(index, 0, elementId);
          }
          return { ...el, children: updatedChildren };
        }
        return el;
      });
    });

    setSelectedElement({ 
      id: elementId, 
      type: item.type,
      parentId: id,
      index: index
    });
  }, [id, elements, findElementById, addNewElement, setElements, setSelectedElement]);

  // Memoize event handlers
  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'footer', styles: footer?.styles });
  }, [id, footer?.styles, setSelectedElement]);

  const toggleModal = useCallback(() => setModalOpen(prev => !prev), []);

  // Optimize click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isModalOpen]);

  // Optimize ref handling
  useEffect(() => {
    if (forwardedRef) {
      if (typeof forwardedRef === 'function') {
        forwardedRef(dragRef.current);
      } else {
        forwardedRef.current = dragRef.current;
      }
    }
  }, [forwardedRef]);

  // Memoize footer component selection
  const FooterComponent = useMemo(() => {
    switch (mappedConfiguration) {
      case 'simpleFooter':
        return (
          <SimpleFooter
            uniqueId={id}
            contentListWidth={contentListWidth}
            children={childrenToRender}
            onDropItem={onDropItem}
            handlePanelToggle={handlePanelToggle}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleSelect={handleSelect}
          />
        );
      case 'detailedFooter':
        return (
          <DetailedFooter
            uniqueId={id}
            contentListWidth={contentListWidth}
            children={childrenToRender}
            onDropItem={onDropItem}
            handlePanelToggle={handlePanelToggle}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleSelect={handleSelect}
          />
        );
      case 'advancedFooter':
        return (
          <TemplateFooter
            uniqueId={id}
            contentListWidth={contentListWidth}
            children={childrenToRender}
            onDropItem={onDropItem}
            handlePanelToggle={handlePanelToggle}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleSelect={handleSelect}
          />
        );
      case 'defiFooter':
        return (
          <DeFiFooter
            uniqueId={id}
            contentListWidth={contentListWidth}
            children={childrenToRender}
            onDropItem={onDropItem}
            handlePanelToggle={handlePanelToggle}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleSelect={handleSelect}
          />
        );
      default:
        return null;
    }
  }, [
    mappedConfiguration,
    id,
    contentListWidth,
    childrenToRender,
    onDropItem,
    handlePanelToggle,
    handleOpenMediaPanel,
    handleSelect
  ]);

  if (showDescription) {
    return (
      <div 
        className="bento-extract-display" 
        ref={drag} 
        style={{ 
          opacity: isDragging ? 0.5 : 1,
          cursor: 'pointer'
        }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
        aria-label={`${label} preview`}
      >
        <img
          src={imgSrc}
          alt={label}
          style={{
            width: '100%',
            height: 'auto',
            marginBottom: '8px',
            borderRadius: '4px',
          }}
          loading="lazy"
        />
        <strong className='element-name'>{label}</strong>
      </div>
    );
  }

    return (
      <div
      ref={(node) => {
        dragRef.current = node;
        drag(node);
      }}
        style={{
          cursor: 'pointer',
          border: isDragging ? '1px dashed #000' : 'none',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={toggleModal}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
        aria-label={`${label} component`}
      >
        <strong>{label}</strong>
        {FooterComponent}
      </div>
    );
});

DraggableFooter.displayName = 'DraggableFooter';

export default DraggableFooter;
