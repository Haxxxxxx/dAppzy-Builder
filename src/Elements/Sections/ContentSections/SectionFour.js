import React, { useContext, useMemo, useRef, useEffect } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { sectionFourStyles } from './defaultSectionStyles';
import { Heading, Paragraph, Button, Image, Span, Icon, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { registerContainer, injectDefaultContent, mergeStyles } from '../../../utils/htmlRenderUtils/containerHelpers';
import useReorderDrop from '../../../utils/useReorderDrop';

const SectionFour = ({
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
  
  const sectionElement = useMemo(() => elements.find(el => el.id === uniqueId), [elements, uniqueId]);
  
  // Register containers
  useEffect(() => {
    registerContainer(uniqueId, 'caption', sectionFourStyles.captionContainer || {}, elements, setElements, findElementById);
    registerContainer(uniqueId, 'heading', sectionFourStyles.headingContainer || {}, elements, setElements, findElementById);
    registerContainer(uniqueId, 'features', sectionFourStyles.featuresContainer, elements, setElements, findElementById);
    registerContainer(uniqueId, 'button', { display: 'flex', justifyContent: 'center', marginTop: '24px' }, elements, setElements, findElementById);
  }, [uniqueId]);
  
  // Inject default content only once
  useEffect(() => {
    if (defaultInjectedRef.current) return;
    const defaultContent =
      (children && children.length > 0)
        ? children
        : (sectionElement && sectionElement.configuration && sectionElement.configuration.children) || [];
    
    const mapping = {
      span: 'caption',
      heading: 'heading',
      featureItem: 'features',
      button: 'button',
      default: 'features',
    };
    
    const captionContainer = findElementById(`${uniqueId}-caption`, elements);
    const headingContainer = findElementById(`${uniqueId}-heading`, elements);
    const featuresContainer = findElementById(`${uniqueId}-features`, elements);
    const buttonContainer = findElementById(`${uniqueId}-button`, elements);
    
    if (
      defaultContent.length > 0 &&
      captionContainer && headingContainer && featuresContainer && buttonContainer &&
      captionContainer.children.length === 0 &&
      headingContainer.children.length === 0 &&
      featuresContainer.children.length === 0 &&
      buttonContainer.children.length === 0
    ) {
      injectDefaultContent(defaultContent, mapping, uniqueId, elements, addNewElement, setElements, findElementById);
      defaultInjectedRef.current = true;
    }
  }, [children, sectionElement, elements, uniqueId, addNewElement, setElements, findElementById]);
  
  // Generic drop handler for new items dropped onto the section
  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
    const newId = addNewElement(
      droppedItem.type,
      droppedItem.level || 1,
      null,
      parentId
    );
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId
          ? { ...el, children: [...(el.children || []), newId] }
          : el
      )
    );
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
    
    return container.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;
      
      let childContent;
      switch(child.type) {
        case 'span':
          childContent = (
            <Span
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...sectionFourStyles.caption, ...(child.styles || {}) }}
              onClick={(e) => handleSelect(e, child.id)}
            />
          );
          break;
        case 'heading':
          childContent = (
            <Heading
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...sectionFourStyles.heading, ...(child.styles || {}) }}
              onClick={(e) => handleSelect(e, child.id)}
            />
          );
          break;
        case 'featureItem':
          childContent = (
            <div key={child.id} style={sectionFourStyles.featureItem}>
              {child.children?.map(sub => {
                if (sub.type === 'icon') {
                  return (
                    <Icon
                      key={sub.id}
                      id={sub.id}
                      styles={{ ...sectionFourStyles.featureIcon, ...(sub.styles || {}) }}
                      onClick={(e) => handleSelect(e, sub.id)}
                    />
                  );
                } else if (sub.type === 'image') {
                  return (
                    <Image
                      key={sub.id}
                      id={sub.id}
                      src={sub.content}
                      styles={{ ...sectionFourStyles.featureIcon, ...(sub.styles || {}) }}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      handleDrop={(item) => handleSectionDrop(item, sub.id)}
                      onClick={(e) => handleSelect(e, sub.id)}
                    />
                  );
                } else if (sub.type === 'heading') {
                  return (
                    <Heading
                      key={sub.id}
                      id={sub.id}
                      content={sub.content}
                      styles={{ ...sectionFourStyles.featureHeading, ...(sub.styles || {}) }}
                      onClick={(e) => handleSelect(e, sub.id)}
                    />
                  );
                } else if (sub.type === 'paragraph') {
                  return (
                    <Paragraph
                      key={sub.id}
                      id={sub.id}
                      content={sub.content}
                      styles={{ ...sectionFourStyles.featureText, ...(sub.styles || {}) }}
                      onClick={(e) => handleSelect(e, sub.id)}
                    />
                  );
                }
                return null;
              })}
            </div>
          );
          break;
        case 'button':
          childContent = (
            <Button
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...sectionFourStyles.primaryButton, ...(child.styles || {}) }}
              onClick={(e) => handleSelect(e, child.id)}
            />
          );
          break;
        default:
          childContent = renderElement(
            child,
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            undefined,
            handleOpenMediaPanel
          );
      }
      return childContent;
    });
  };
  
  const mergedSectionStyles = mergeStyles(
    sectionFourStyles.section,
    sectionElement?.styles || {}
  );
  
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {findElementById(`${uniqueId}-caption`, elements) && (
        <Div
          id={`${uniqueId}-caption`}
          parentId={`${uniqueId}-caption`}
            styles={{ ...sectionFourStyles.captionContainer }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-caption`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-caption`)}
        >
          {renderContainerChildren(`${uniqueId}-caption`)}
        </Div>
      )}
        {findElementById(`${uniqueId}-heading`, elements) && (
        <Div
          id={`${uniqueId}-heading`}
          parentId={`${uniqueId}-heading`}
            styles={{ ...sectionFourStyles.headingContainer }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-heading`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-heading`)}
        >
          {renderContainerChildren(`${uniqueId}-heading`)}
        </Div>
      )}
        {findElementById(`${uniqueId}-features`, elements) && (
        <Div
          id={`${uniqueId}-features`}
          parentId={`${uniqueId}-features`}
          styles={{ ...sectionFourStyles.featuresContainer }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-features`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-features`)}
        >
          {renderContainerChildren(`${uniqueId}-features`)}
        </Div>
      )}
        {findElementById(`${uniqueId}-button`, elements) && (
        <Div
          id={`${uniqueId}-button`}
          parentId={`${uniqueId}-button`}
            styles={{ ...sectionFourStyles.buttonContainer }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-button`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-button`)}
        >
          {renderContainerChildren(`${uniqueId}-button`)}
        </Div>
      )}
      </div>
    </Section>
  );
};

export default SectionFour;
