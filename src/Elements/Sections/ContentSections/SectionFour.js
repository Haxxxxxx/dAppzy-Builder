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
  
  // Register containers: caption, heading, features, and button.
  useEffect(() => {
    registerContainer(uniqueId, 'caption', sectionFourStyles.captionContainer || {}, elements, setElements, findElementById);
    registerContainer(uniqueId, 'heading', sectionFourStyles.headingContainer || {}, elements, setElements, findElementById);
    registerContainer(uniqueId, 'features', sectionFourStyles.featuresContainer, elements, setElements, findElementById);
    registerContainer(uniqueId, 'button', { display: 'flex', justifyContent: 'center', marginTop: '24px' }, elements, setElements, findElementById);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueId, elements]);
  
  // Inject default content only once.
  useEffect(() => {
    if (defaultInjectedRef.current) return;
    const defaultContent = (children && children.length > 0) ? children : (sectionElement && sectionElement.configuration && sectionElement.configuration.children) || [];
    // Mapping: span -> caption, heading -> heading, featureItem -> features, button -> button, default -> features.
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
  
  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;
    const childrenElements = container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;
      let childContent;
      switch(child.type) {
        case 'span':
          childContent = <Span key={child.id} id={child.id} content={child.content} styles={{ ...sectionFourStyles.caption, ...(child.styles || {}) }} />;
          break;
        case 'heading':
          childContent = <Heading key={child.id} id={child.id} content={child.content} styles={{ ...sectionFourStyles.heading, ...(child.styles || {}) }} />;
          break;
        case 'featureItem':
          childContent = (
            <div key={child.id} style={sectionFourStyles.featureItem}>
              {child.children?.map(sub => {
                if (sub.type === 'icon') {
                  return <Icon key={sub.id} id={sub.id} styles={{ ...sectionFourStyles.featureIcon, ...(sub.styles || {}) }} />;
                } else if (sub.type === 'image') {
                  return <Image key={sub.id} id={sub.id} src={sub.content} styles={{ ...sectionFourStyles.featureIcon, ...(sub.styles || {}) }} handleOpenMediaPanel={handleOpenMediaPanel} handleDrop={onDropItem} />;
                } else if (sub.type === 'heading') {
                  return <Heading key={sub.id} id={sub.id} content={sub.content} styles={{ ...sectionFourStyles.featureHeading, ...(sub.styles || {}) }} />;
                } else if (sub.type === 'paragraph') {
                  return <Paragraph key={sub.id} id={sub.id} content={sub.content} styles={{ ...sectionFourStyles.featureText, ...(sub.styles || {}) }} />;
                }
                return null;
              })}
            </div>
          );
          break;
        case 'button':
          childContent = <Button key={child.id} id={child.id} content={child.content} styles={{ ...sectionFourStyles.primaryButton, ...(child.styles || {}) }} />;
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
              fontFamily: 'Montserrat',
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
            fontFamily: 'Montserrat',
          }}>
            Drop here – element will be dropped here
          </div>
        </div>
      );
    }
    return childrenElements;
  };
  
  useEffect(() => {
    if (sectionElement) {
      const merged = mergeStyles(sectionFourStyles.sectionContainer, sectionElement.styles);
      if (sectionElement.styles.display !== merged.display) {
        updateStyles(sectionElement.id, merged);
      }
    }
  }, [sectionElement, updateStyles]);
  
  const mergedSectionStyles = mergeStyles(sectionFourStyles.sectionContainer, sectionElement?.styles);
  
  // Only render container Divs if they exist and have children.
  const captionContainer = findElementById(`${uniqueId}-caption`, elements);
  const headingContainer = findElementById(`${uniqueId}-heading`, elements);
  const featuresContainer = findElementById(`${uniqueId}-features`, elements);
  const buttonContainer = findElementById(`${uniqueId}-button`, elements);
  
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
      {captionContainer && captionContainer.children && captionContainer.children.length > 0 && (
        <Div
          id={`${uniqueId}-caption`}
          parentId={`${uniqueId}-caption`}
          styles={{ ...sectionFourStyles.caption }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-caption`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-caption`)}
        >
          {renderContainerChildren(`${uniqueId}-caption`)}
        </Div>
      )}
      {headingContainer && headingContainer.children && headingContainer.children.length > 0 && (
        <Div
          id={`${uniqueId}-heading`}
          parentId={`${uniqueId}-heading`}
          styles={{ ...sectionFourStyles.heading }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-heading`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-heading`)}
        >
          {renderContainerChildren(`${uniqueId}-heading`)}
        </Div>
      )}
      {featuresContainer && featuresContainer.children && featuresContainer.children.length > 0 && (
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
      {buttonContainer && buttonContainer.children && buttonContainer.children.length > 0 && (
        <Div
          id={`${uniqueId}-button`}
          parentId={`${uniqueId}-button`}
          styles={{ ...({ display: 'flex', justifyContent: 'center', marginTop: '24px' }) }}
          handleOpenMediaPanel={handleOpenMediaPanel}
          onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-button`)}
          onClick={(e) => handleInnerDivClick(e, `${uniqueId}-button`)}
        >
          {renderContainerChildren(`${uniqueId}-button`)}
        </Div>
      )}
    </Section>
  );
};

export default SectionFour;
