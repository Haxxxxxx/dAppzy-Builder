// src/Sections/ContentSections/SectionOne.jsx
import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop.js';
import { defaultSectionStyles } from './defaultSectionStyles';
import { Heading, Paragraph, Button, Image, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { mergeStyles } from '../../../utils/htmlRenderUtils/containerHelpers';

const SectionOne = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
  configuration,
}) => {
  const sectionRef = useRef(null);
  const defaultInjectedRef = useRef(false);

  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  // Locate the section element from global state
  const sectionElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Initialize containers and inject default content
  useEffect(() => {
    if (defaultInjectedRef.current || !sectionElement) return;

    // Get configuration styles
    const configStyles = sectionElement?.configuration?.styles || {};

    // First, ensure the section has the default styles
    updateStyles(sectionElement.id, configStyles.section || {});

    // Create containers if they don't exist
    const containers = [
      {
        id: `${uniqueId}-content`,
        type: 'div',
        styles: configStyles.content || {},
        children: [],
        parentId: uniqueId,
        configuration: sectionElement.configuration
      },
      {
        id: `${uniqueId}-buttons`,
        type: 'div',
        styles: configStyles.buttons || {},
        children: [],
        parentId: uniqueId,
        configuration: sectionElement.configuration
      },
      {
        id: `${uniqueId}-image`,
        type: 'div',
        styles: configStyles.image || {},
        children: [],
        parentId: uniqueId,
        configuration: sectionElement.configuration
      }
    ];

    // Add containers if they don't exist
    const updates = [];
    containers.forEach(container => {
      const existingContainer = findElementById(container.id, elements);
      if (!existingContainer) {
        updates.push(container);
      }
    });

    // Get default content
    const defaultContent = children?.length > 0 ? children :
      (sectionElement?.configuration?.children || []);

    // Only inject content if we have default content and the containers are empty
    if (defaultContent.length > 0) {
      const contentContainer = findElementById(`${uniqueId}-content`, elements);
      const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
      const imageContainer = findElementById(`${uniqueId}-image`, elements);

      if ((!contentContainer || contentContainer.children.length === 0) &&
          (!buttonsContainer || buttonsContainer.children.length === 0) &&
          (!imageContainer || imageContainer.children.length === 0)) {
        
        const mapping = {
          image: 'image',
          button: 'buttons',
          default: 'content',
        };

        // Create new elements for each content item
        defaultContent.forEach(item => {
          const containerType = mapping[item.type] || mapping.default;
          const containerId = `${uniqueId}-${containerType}`;
          const newId = `${uniqueId}-${item.type}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Get the appropriate styles for this element type
          let elementStyles = {};
          if (item.type === 'button') {
            elementStyles = item.content === 'Primary Action' ? 
              configStyles.primaryButton : 
              configStyles.secondaryButton;
          } else if (item.type === 'image') {
            // Get both image container and image element styles
            elementStyles = {
              ...configStyles.image,
              img: configStyles.image?.img || {}
            };
          } else {
            elementStyles = configStyles[item.type] || {};
          }

          const newElement = {
            id: newId,
            type: item.type,
            content: item.content,
            styles: elementStyles,
            parentId: containerId,
            configuration: sectionElement.configuration
          };

          updates.push(newElement);

          // Update container's children array
          const containerIndex = updates.findIndex(el => el.id === containerId);
          if (containerIndex !== -1) {
            updates[containerIndex].children = [...(updates[containerIndex].children || []), newId];
          }
        });
      }
    }

    // Apply all updates in a single state change
    if (updates.length > 0) {
      setElements(prev => {
        const existingIds = new Set(prev.map(el => el.id));
        const newElements = updates.filter(el => !existingIds.has(el.id));
        return [...prev, ...newElements];
      });
      defaultInjectedRef.current = true;
    }
  }, [sectionElement, elements, findElementById, uniqueId, updateStyles, setElements, children]);

  // Generic drop handler for new items
  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
    if (droppedItem.id) return;

    const newId = addNewElement(
      droppedItem.type,
      droppedItem.level || 1,
      null,
      parentId
    );

    setElements(prev => prev.map(el =>
        el.id === parentId
          ? { ...el, children: [...(el.children || []), newId] }
          : el
    ));
  };

  // Drop and reorder hooks
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: handleSectionDrop,
  });

  const { activeDrop, onDragStart, onDragOver, onDrop, onDragEnd } = useReorderDrop(
    findElementById,
    elements,
    setElements
  );

  const handleInnerDivClick = (e, containerId) => {
    e.stopPropagation();
    const container = findElementById(containerId, elements);
    if (container) {
      setSelectedElement(container);
    }
  };

  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    return container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      return (
        <React.Fragment key={child.id}>
          {activeDrop && activeDrop.containerId === containerId && activeDrop.index === index && (
            <div
              className="drop-placeholder"
              style={{
                padding: '8px',
                border: '2px dashed #5C4EFA',
                textAlign: 'center',
                fontStyle: 'italic',
                backgroundColor: 'transparent',
                width: '100%',
                margin: '5px',
                fontFamily: 'Montserrat',
              }}
              onDragOver={(e) => onDragOver(e, containerId, index)}
              onDrop={(e) => onDrop(e, containerId)}
            >
              Drop here – element will be dropped here
            </div>
          )}
          <span
            draggable
            onDragStart={(e) => onDragStart(e, child.id)}
            onDragEnd={onDragEnd}
            style={{ display: 'block' }}
          >
            {renderElement(
              child,
              elements,
              null,
              setSelectedElement,
              setElements,
              null,
              undefined,
              handleOpenMediaPanel
            )}
          </span>
        </React.Fragment>
      );
    });
  };

  // Get container elements
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
  const imageContainer = findElementById(`${uniqueId}-image`, elements);

  // Merge styles for containers
  const contentStyles = mergeStyles(defaultSectionStyles.contentWrapper, contentContainer?.styles || {});
  const buttonsStyles = mergeStyles(defaultSectionStyles.buttonContainer || {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    marginTop: '10px',
  }, buttonsContainer?.styles || {});
  const imageStyles = mergeStyles(defaultSectionStyles.imageContainer, imageContainer?.styles || {});

  // Merge styles for section
  const mergedSectionStyles = mergeStyles(defaultSectionStyles.section, sectionElement?.styles || {});

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedSectionStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
    >
            <Div
              id={`${uniqueId}-content`}
              parentId={`${uniqueId}-content`}
        styles={contentStyles}
              handleOpenMediaPanel={handleOpenMediaPanel}
              onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
              onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
            >
              {renderContainerChildren(`${uniqueId}-content`)}
            </Div>
            <Div
              id={`${uniqueId}-buttons`}
              parentId={`${uniqueId}-buttons`}
        styles={buttonsStyles}
              handleOpenMediaPanel={handleOpenMediaPanel}
              onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
              onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
            >
              {renderContainerChildren(`${uniqueId}-buttons`)}
            </Div>
          <Div
            id={`${uniqueId}-image`}
            parentId={`${uniqueId}-image`}
        styles={imageStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-image`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-image`)}
          >
            {renderContainerChildren(`${uniqueId}-image`)}
          </Div>
    </Section>
  );
};

export default SectionOne;
