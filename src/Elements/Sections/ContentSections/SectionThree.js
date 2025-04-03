import React, { useContext, useMemo, useRef, useEffect } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop.js';
import { sectionThreeStyles } from './defaultSectionStyles.js';
import { Heading, Paragraph, Button, Image, Section, Div, Span } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { registerContainer, injectDefaultContent, mergeStyles } from '../../../utils/htmlRenderUtils/containerHelpers';

const SectionThree = ({
  uniqueId,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  handleSelect,
  configuration,
}) => {
  const sectionRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  
  const { elements, setElements, setSelectedElement, findElementById, updateStyles, addNewElement } = useContext(EditableContext);
  
  // Locate the section element.
  const sectionElement = useMemo(() => elements.find(el => el.id === uniqueId), [elements, uniqueId]);
  
  // Register four containers: label, content, buttons, and image.
  useEffect(() => {
    registerContainer(uniqueId, 'label', sectionThreeStyles.labelContainer, elements, setElements, findElementById);
    registerContainer(uniqueId, 'content', sectionThreeStyles.contentWrapper, elements, setElements, findElementById);
    registerContainer(uniqueId, 'buttons', sectionThreeStyles.buttonContainer, elements, setElements, findElementById);
    registerContainer(uniqueId, 'image', sectionThreeStyles.imageContainer, elements, setElements, findElementById);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueId, elements]);
  
  // Inject default content only once.
  useEffect(() => {
    if (defaultInjectedRef.current) return;
    const defaultContent =
      (children && children.length > 0)
        ? children
        : (sectionElement && sectionElement.configuration && sectionElement.configuration.children) || [];
    // Mapping: span → label; heading & paragraph → content; button → buttons; image → image; default → content.
    const mapping = {
      span: 'label',
      heading: 'content',
      paragraph: 'content',
      button: 'buttons',
      image: 'image',
      default: 'content',
    };
    const labelContainer = findElementById(`${uniqueId}-label`, elements);
    const contentContainer = findElementById(`${uniqueId}-content`, elements);
    const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
    const imageContainer = findElementById(`${uniqueId}-image`, elements);
    
    if (
      defaultContent.length > 0 &&
      labelContainer && contentContainer && buttonsContainer && imageContainer &&
      labelContainer.children.length === 0 &&
      contentContainer.children.length === 0 &&
      buttonsContainer.children.length === 0 &&
      imageContainer.children.length === 0
    ) {
      injectDefaultContent(defaultContent, mapping, uniqueId, elements, addNewElement, setElements, findElementById);
      defaultInjectedRef.current = true;
    }
  }, [children, sectionElement, elements, uniqueId, addNewElement, setElements, findElementById]);
  
  // Drop and reorder hooks.
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: (item) => handleSectionDrop(item, uniqueId),
  });
  
  const { activeDrop, onDragStart, onDragOver, onDrop, onDragEnd } = useReorderDrop(findElementById, elements, setElements);
  
  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
    const newId = addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
    setElements(prev => prev.map(el => el.id === parentId ? { ...el, children: [...(el.children || []), newId] } : el));
  };
  
  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };
  
  // Helper to render children with drop placeholders.
  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;
  
    const childrenElements = container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;
      let childContent;
      switch(child.type) {
        case 'heading':
          childContent = <Heading key={child.id} id={child.id} content={child.content} styles={{ ...sectionThreeStyles.heading, ...(child.styles || {}) }} />;
          break;
        case 'paragraph':
          childContent = <Paragraph key={child.id} id={child.id} content={child.content} styles={{ ...sectionThreeStyles.paragraph, ...(child.styles || {}) }} />;
          break;
        case 'button':
          childContent = <Button key={child.id} id={child.id} content={child.content} styles={{ ...sectionThreeStyles.primaryButton, ...(child.styles || {}) }} />;
          break;
        case 'image':
          childContent = <Image key={child.id} id={child.id} src={child.content} styles={{ ...sectionThreeStyles.image, ...(child.styles || {}) }} handleOpenMediaPanel={handleOpenMediaPanel} handleDrop={(item) => handleSectionDrop(item, child.id)} />;
          break;
        case 'span':
          childContent = <Span key={child.id} id={child.id} content={child.content} styles={{ ...sectionThreeStyles.label, ...(child.styles || {}) }} />;
          break;
        default:
          childContent = renderElement(child, elements, null, setSelectedElement, setElements, null, undefined, handleOpenMediaPanel);
      }
  
      return (
        <React.Fragment key={child.id}>
          {activeDrop.containerId === containerId && activeDrop.index === index && (
            <div className="drop-placeholder" style={{
              padding: '8px',
              border: '2px dashed #5C4EFA',
              textAlign: 'center',
              fontStyle: 'italic',
              backgroundColor: 'transparent',
              width: '100%',
              margin: '5px',
              fontFamily: 'Montserrat'
            }}
            onDragOver={(e) => onDragOver(e, containerId, index)}
            onDrop={(e) => onDrop(e, containerId)}
            >
              Drop here – element will be dropped here
            </div>
          )}
          <span draggable onDragStart={(e) => onDragStart(e, child.id)} onDragOver={(e) => onDragOver(e, containerId, index)} onDragEnd={onDragEnd} style={{ display: 'inline-block' }}>
            {childContent}
          </span>
        </React.Fragment>
      );
    });
  
    // Render extra drop zone only if an active drop is exactly at the bottom.
    if (activeDrop.containerId === containerId && activeDrop.index === container.children.length) {
      childrenElements.push(
        <div key="drop-zone-bottom" style={{ height: '40px', width: '100%' }} onDragOver={(e) => onDragOver(e, containerId, container.children.length)} onDrop={(e) => onDrop(e, containerId)}>
          <div className="drop-placeholder" style={{
            padding: '8px',
            border: '2px dashed #5C4EFA',
            textAlign: 'center',
            fontStyle: 'italic',
            backgroundColor: 'transparent',
            width: '100%',
            margin: '5px',
            fontFamily: 'Montserrat'
          }}>
            Drop here – element will be dropped here
          </div>
        </div>
      );
    }
  
    return childrenElements;
  };
  
  // Merge overall Section styles.
  useEffect(() => {
    if (sectionElement) {
      const merged = mergeStyles(sectionThreeStyles.sectionContainer, sectionElement.styles);
      if (sectionElement.styles.display !== merged.display) {
        updateStyles(sectionElement.id, merged);
      }
    }
  }, [sectionElement, updateStyles]);
  
  const mergedSectionStyles = mergeStyles(sectionThreeStyles.sectionContainer, sectionElement?.styles);
  
  // Only render a container if it exists and has children.
  const labelContainer = findElementById(`${uniqueId}-label`, elements);
  const contentContainer = findElementById(`${uniqueId}-content`, elements);
  const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
  const imageContainer = findElementById(`${uniqueId}-image`, elements);
  
  return (
    <Section
      id={uniqueId}
      style={{ ...mergedSectionStyles }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
    >
      {labelContainer && labelContainer.children && labelContainer.children.length > 0 && (
        <Div
          id={`${uniqueId}-label`}
          parentId={`${uniqueId}-label`}
          styles={{ ...sectionThreeStyles.labelContainer }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-label`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-label`)}
        >
          {renderContainerChildren(`${uniqueId}-label`)}
        </Div>
      )}
      {contentContainer && contentContainer.children && contentContainer.children.length > 0 && (
        <Div
          id={`${uniqueId}-content`}
          parentId={`${uniqueId}-content`}
          styles={{ ...sectionThreeStyles.contentWrapper }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
        >
          {renderContainerChildren(`${uniqueId}-content`)}
        </Div>
      )}
      {buttonsContainer && buttonsContainer.children && buttonsContainer.children.length > 0 && (
        <Div
          id={`${uniqueId}-buttons`}
          parentId={`${uniqueId}-buttons`}
          styles={{ ...sectionThreeStyles.buttonContainer }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
        >
          {renderContainerChildren(`${uniqueId}-buttons`)}
        </Div>
      )}
      {imageContainer && imageContainer.children && imageContainer.children.length > 0 && (
        <Div
          id={`${uniqueId}-image`}
          parentId={`${uniqueId}-image`}
          styles={{ ...sectionThreeStyles.imageContainer }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-image`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-image`)}
        >
          {renderContainerChildren(`${uniqueId}-image`)}
        </Div>
      )}
    </Section>
  );
};

export default SectionThree;
