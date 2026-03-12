import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';
import DeFiFooter from '../Sections/Footers/DeFiFooter';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { 
  SimplefooterStyles, 
  DetailedFooterStyles, 
  TemplateFooterStyles, 
  DeFiFooterStyles 
} from '../Sections/Footers/defaultFooterStyles';
import { FOOTER, HEADING, PARAGRAPH, BUTTON, DIV } from '../../constants/elementTypes';

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
const DraggableFooter = ({
  id,
  configuration,
  isEditing,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);

  // Memoize footer styles to avoid recalculation
  const footerStyles = useMemo(() => ({
    simpleFooter: SimplefooterStyles.footerSection,
    detailedFooter: DetailedFooterStyles.footerSection,
    advancedFooter: TemplateFooterStyles.footerSection,
    defiFooter: DeFiFooterStyles.footerSection
  }), []);

  // Set up drag-and-drop functionality with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: FOOTER,
      configuration,
      structure: configuration
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const footerConfig = structureConfigurations[item.configuration];
        if (footerConfig) {
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;

          if (targetSectionId) {
            // Check for existing footer in a single pass
            const sectionElement = findElementById(targetSectionId, elements);
            const hasExistingFooter = sectionElement?.children?.some(childId => {
              const child = findElementById(childId, elements);
              return child?.type === FOOTER && child?.configuration === item.configuration;
            });

            if (!hasExistingFooter) {
              // Generate all IDs up-front so we can build the full structure
              // before any state update, then call setElements exactly ONCE.
              const timestamp = Date.now();
              const newFooterId = `footer-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;
              const mainContainerId = `${newFooterId}-main`;

              const baseStyles = footerStyles[item.configuration] || footerConfig.styles || {};
              const defaultContent = footerConfig.children || [];

              // Build content element objects (no addNewElement calls)
              const contentElements = defaultContent.map((child, idx) => ({
                id: `${mainContainerId}-child-${idx}-${Math.random().toString(36).substring(2, 6)}`,
                type: child.type,
                content: child.content,
                src: child.src,
                href: child.href,
                styles: child.styles || {},
                parentId: mainContainerId,
              }));

              // Build the complete footer structure as a flat array
              const footerStructure = [
                {
                  id: newFooterId,
                  type: FOOTER,
                  configuration: item.configuration,
                  structure: item.configuration,
                  styles: { ...baseStyles },
                  children: [mainContainerId],
                  parentId: targetSectionId,
                },
                {
                  id: mainContainerId,
                  type: DIV,
                  styles: {
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '2rem',
                    padding: '10px',
                  },
                  children: contentElements.map(e => e.id),
                  parentId: newFooterId,
                },
                ...contentElements,
              ];

              // Single setElements call: add all new elements and update parent section
              setElements(prev => {
                const filteredPrev = prev.filter(
                  el => !footerStructure.some(newEl => newEl.id === el.id)
                );
                const updatedPrev = filteredPrev.map(el => {
                  if (el.id === targetSectionId) {
                    return { ...el, children: [...(el.children || []), newFooterId] };
                  }
                  return el;
                });
                return [...updatedPrev, ...footerStructure];
              });

              // Select new footer after paint
              requestAnimationFrame(() => {
                setSelectedElement({
                  id: newFooterId,
                  type: FOOTER,
                  configuration: item.configuration,
                });
              });
            }
          }
        }
      }
    },
  }), [configuration, isEditing, elements, findElementById, addNewElement, setSelectedElement, footerStyles]);

  // Handle drop events within the footer section with improved error handling
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentSection = findElementById(id, elements);
    if (!currentSection) {
      return;
    }

    if (item.type === FOOTER) {
      return;
    }

    // Check for duplicates in a single pass
    const hasDuplicate = currentSection.children?.some(childId => {
      const child = findElementById(childId, elements);
      return child?.type === item.type && 
             (item.type === HEADING || item.type === PARAGRAPH || item.type === BUTTON) &&
             child?.content === item.content;
    });

    if (hasDuplicate) {
      return;
    }

    // Add new element with minimal properties
    const elementId = addNewElement(
      item.type,
      1,
      index,
      id,
      {
        type: item.type,
        content: item.content || '',
        styles: item.styles || {},
        configuration: item.configuration || {}
      }
    );

    // Batch state updates
    requestAnimationFrame(() => {
      setSelectedElement({ 
        id: elementId, 
        type: item.type,
        parentId: id,
        index: index
      });
    });
  };

  // Memoize footer element and children with improved caching
  const footerElement = useMemo(() => findElementById(id, elements), [id, elements, findElementById]);
  
  const configChildren = useMemo(() => 
    structureConfigurations[configuration]?.children || [], 
    [configuration]
  );

  const resolvedChildren = useMemo(() => {
    if (!footerElement?.children?.length) return [];
    return footerElement.children
      .map(childId => findElementById(childId, elements))
      .filter(Boolean);
  }, [footerElement?.children, elements, findElementById]);

  const childrenToRender = useMemo(() => 
    resolvedChildren.length > 0 ? resolvedChildren : configChildren,
    [resolvedChildren, configChildren]
  );

  // Handle element selection
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: FOOTER, styles: footerElement?.styles });
  };

  // Component map for configuration → React component
  const FOOTER_COMPONENTS = {
    simpleFooter: SimpleFooter,
    detailedFooter: DetailedFooter,
    advancedFooter: TemplateFooter,
    defiFooter: DeFiFooter,
  };

  const FooterComponent = FOOTER_COMPONENTS[configuration];
  if (!FooterComponent) return null;

  return (
    <FooterComponent
      uniqueId={id}
      contentListWidth={contentListWidth}
      children={childrenToRender}
      onDropItem={onDropItem}
      handlePanelToggle={handlePanelToggle}
      handleOpenMediaPanel={handleOpenMediaPanel}
      handleSelect={handleSelect}
    />
  );
};

export default DraggableFooter;
