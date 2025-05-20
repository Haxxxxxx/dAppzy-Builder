// src/Sections/ContentSections/SectionOne.jsx
import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { defaultSectionStyles } from './defaultSectionStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const SectionOne = forwardRef(({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}, ref) => {
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

  const sectionElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Initialize the section structure with containers
  useEffect(() => {
    if (!sectionElement || defaultInjectedRef.current) return;

    // Get configuration from structureConfigurations
    const config = structureConfigurations.sectionOne || {};
    const configStyles = config.styles || {};

    // First, ensure the section has the default styles
    const mergedSectionStyles = merge({}, defaultSectionStyles.section, configStyles.section || {});
    updateStyles(sectionElement.id, mergedSectionStyles);

    const contentContainerId = `${uniqueId}-content`;
    const buttonsContainerId = `${uniqueId}-buttons`;
    const imageContainerId = `${uniqueId}-image`;

    // Create content container if it doesn't exist
    if (!findElementById(contentContainerId, elements)) {
      const contentContainer = {
        id: contentContainerId,
        type: 'div',
        styles: merge({}, 
          defaultSectionStyles.contentWrapper,
          {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '700px',
            textAlign: 'center',
            boxSizing: 'border-box',
            padding: '1rem',
            margin: '0 auto'
          },
          configStyles.content || {}
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, contentContainer]);

      // Add default content to content container from configuration
      const defaultContent = config.children || [];

      // Filter content elements (heading and paragraph)
      const contentElements = defaultContent.filter(child => 
        ['heading', 'paragraph'].includes(child.type)
      );

      // Create all content elements first
      const contentIds = contentElements.map(child => {
        const newId = addNewElement(child.type, 1, null, contentContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            return {
              ...el,
              content: child.content,
              styles: merge(
                child.type === 'heading' ? defaultSectionStyles.heading :
                child.type === 'paragraph' ? defaultSectionStyles.paragraph :
                {},
                child.styles || {}
              )
            };
          }
          return el;
        }));
        return newId;
      });

      // Update content container with all content IDs
      setElements(prev => prev.map(el => {
        if (el.id === contentContainerId) {
          return {
            ...el,
            children: contentIds
          };
        }
        return el;
      }));
    }

    // Create buttons container if it doesn't exist
    if (!findElementById(buttonsContainerId, elements)) {
      const buttonsContainer = {
        id: buttonsContainerId,
        type: 'div',
        styles: merge({}, 
          defaultSectionStyles.buttonContainer,
          {
            display: 'flex',
            flexDirection: 'row',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: '700px',
            margin: '0 auto',
            padding: '1rem'
          },
          configStyles.buttons || {}
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, buttonsContainer]);

      // Add default buttons from configuration
      const defaultContent = config.children || [];

      // Filter button elements
      const buttonElements = defaultContent.filter(child => 
        child.type === 'button'
      );

      // Create all button elements
      const buttonIds = buttonElements.map(child => {
        const newId = addNewElement('button', 1, null, buttonsContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            const buttonStyle = child.content === 'Primary Action' ? 
              defaultSectionStyles.primaryButton : 
              defaultSectionStyles.secondaryButton;
            return {
              ...el,
              content: child.content,
              styles: merge(
                buttonStyle || {},
                child.styles || {}
              )
            };
          }
          return el;
        }));
        return newId;
      });

      // Update buttons container with all button IDs
      setElements(prev => prev.map(el => {
        if (el.id === buttonsContainerId) {
          return {
            ...el,
            children: buttonIds
          };
        }
        return el;
      }));
    }

    // Create image container if it doesn't exist
    if (!findElementById(imageContainerId, elements)) {
      const imageContainer = {
        id: imageContainerId,
        type: 'div',
        styles: merge({}, 
          defaultSectionStyles.imageContainer,
          configStyles.image || {}
        ),
        children: [],
        parentId: uniqueId,
      };
      setElements(prev => [...prev, imageContainer]);

      // Add default image from configuration
      const defaultContent = config.children || [];

      const imageElement = defaultContent.find(child => child.type === 'image');
      if (imageElement) {
        const imageId = addNewElement('image', 1, null, imageContainerId);
        // Update image element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === imageId) {
            return {
              ...el,
              content: imageElement.content,
              styles: merge({},
                defaultSectionStyles.image,
                configStyles.image?.img || {},
                imageElement.styles || {}
              )
            };
          }
          return el;
        }));
        // Update image container with image ID
        setElements(prev => prev.map(el => {
          if (el.id === imageContainerId) {
            return {
              ...el,
              children: [imageId]
            };
          }
          return el;
        }));
      }
    }

    // Update section's children to only include the containers
    setElements(prev => prev.map(el => {
      if (el.id === uniqueId) {
          return {
            ...el,
          children: [contentContainerId, buttonsContainerId, imageContainerId],
          configuration: 'sectionOne'
          };
        }
        return el;
    }));

    defaultInjectedRef.current = true;
  }, [sectionElement, uniqueId, elements, findElementById, setElements, addNewElement, updateStyles]);

  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
    // Simple drop handler that just adds the element
    addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: (item) => handleSectionDrop(item, uniqueId),
  });

  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };

  const {
    activeDrop,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  } = useReorderDrop(findElementById, elements, setElements);

  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    return container.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      // Get configuration from structureConfigurations
      const config = structureConfigurations.sectionOne || {};
      const configStyles = config.styles || {};

      // For image elements, ensure proper style merging
      if (child.type === 'image') {
        const imageStyles = merge({},
          defaultSectionStyles.image,
          configStyles.image?.img || {},
          child.styles || {}
        );

        return renderElement(
          {
            ...child,
            styles: imageStyles
          },
          elements,
          null,
          setSelectedElement,
          setElements,
          null,
          undefined,
          handleOpenMediaPanel
        );
      }

      return renderElement(
              child,
              elements,
              null,
              setSelectedElement,
              setElements,
              null,
              undefined,
              handleOpenMediaPanel
      );
    });
  };

  // Get container elements
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
  const imageContainer = findElementById(`${uniqueId}-image`, elements);

  // Get configuration from structureConfigurations
  const config = structureConfigurations.sectionOne || {};
  const configStyles = config.styles || {};

  // Merge styles for containers
  const contentStyles = merge({}, 
    defaultSectionStyles.contentWrapper,
    configStyles.content || {},
    contentContainer?.styles || {}
  );

  const buttonsStyles = merge({}, 
    defaultSectionStyles.buttonContainer,
    configStyles.buttons || {},
    buttonsContainer?.styles || {}
  );

  const imageStyles = merge({}, 
    defaultSectionStyles.imageContainer,
    configStyles.image || {},
    imageContainer?.styles || {}
  );

  // Merge styles for section
  const mergedSectionStyles = merge({}, 
    defaultSectionStyles.section,
    {
      position: 'relative',
      display: 'flex',
      boxSizing: 'border-box',
      padding: '2rem',
      margin: 0,
      backgroundColor: 'transparent',
      flexDirection: 'column',
      gap: '0px',
      transition: 'none',
      alignItems: 'center',
      width: '100%'
    },
    configStyles.section || {},
    sectionElement?.styles || {}
  );

  // Get wrapper styles from configuration
  const wrapperStyles = merge({},
    {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    configStyles.wrapper || {}
  );

  return (
    <SectionWithRef
      id={uniqueId}
      style={{
        ...mergedSectionStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
      }}
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
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        ...wrapperStyles
      }}>
        {contentContainer && (
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
        )}
        {buttonsContainer && (
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
        )}
      {imageContainer && (
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
      )}
      </div>
    </SectionWithRef>
  );
});

export default SectionOne;
