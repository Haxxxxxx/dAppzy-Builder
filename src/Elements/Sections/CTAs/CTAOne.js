import React, { useRef, useMemo, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { ctaOneStyles } from './defaultCtaStyles';
import { Button, Span, Section, Div, Image } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import {
  registerContainer,
  injectDefaultContent,
  mergeStyles,
} from '../../../utils/htmlRenderUtils/containerHelpers';

const CTAOne = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const ctaRef = useRef(null);
  const defaultInjectedRef = useRef(false);

  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  // Locate the CTAOne element from state.
  const ctaElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Register three containers: text, buttons, and image.
  useEffect(() => {
    registerContainer(
      uniqueId,
      'text',
      ctaOneStyles.ctaContent,
      elements,
      setElements,
      findElementById
    );
    registerContainer(
      uniqueId,
      'buttons',
      ctaOneStyles.buttonContainer,
      elements,
      setElements,
      findElementById
    );
    registerContainer(
      uniqueId,
      'image',
      ctaOneStyles.ctaImage,
      elements,
      setElements,
      findElementById
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueId, elements]);

  // Inject default content only once.
  useEffect(() => {
    if (defaultInjectedRef.current) return;

    const defaultContent =
      (children && children.length > 0)
        ? children
        : (ctaElement &&
            ctaElement.configuration &&
            ctaElement.configuration.children) ||
          [];

    // Mapping: 
    // - "image" elements go to the "image" container
    // - "button" elements go to the "buttons" container
    // - All other types go to the "text" container.
    const mapping = {
      image: 'image',
      button: 'buttons',
      default: 'text',
    };

    const textContainer = findElementById(`${uniqueId}-text`, elements);
    const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
    const imageContainer = findElementById(`${uniqueId}-image`, elements);

    if (
      defaultContent.length > 0 &&
      textContainer &&
      buttonsContainer &&
      imageContainer &&
      textContainer.children.length === 0 &&
      buttonsContainer.children.length === 0 &&
      imageContainer.children.length === 0
    ) {
      injectDefaultContent(
        defaultContent,
        mapping,
        uniqueId,
        elements,
        addNewElement,
        setElements,
        findElementById
      );
      defaultInjectedRef.current = true;
    }
  }, [children, ctaElement, elements, uniqueId, addNewElement, setElements, findElementById]);

  // Generic drop handler for new items dropped onto the CTA.
  const handleCTADrop = (droppedItem, parentId = uniqueId) => {
    const newId = addNewElement(
      droppedItem.type,
      droppedItem.level || 1,
      null,
      parentId
    );
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId ? { ...el, children: [...el.children, newId] } : el
      )
    );
  };

  // Enable drop functionality on the whole CTA section.
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: ctaRef,
    onDropItem: (item) => handleCTADrop(item, uniqueId),
  });

  // Use our custom hook for drag and drop reordering.
  const { activeDrop, onDragStart, onDragOver, onDrop, onDragEnd } =
    useReorderDrop(findElementById, elements, setElements);

  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };

  // Helper function to render children within a container and include drop placeholders.
  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    const childrenElements = container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      let childContent;
      if (child.type === 'heading' || child.type === 'title') {
        childContent = (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...ctaOneStyles.ctaTitle, ...(child.styles || {}) }}
          />
        );
      } else if (child.type === 'paragraph') {
        childContent = (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...ctaOneStyles.ctaDescription, ...(child.styles || {}) }}
          />
        );
      } else if (child.type === 'button') {
        childContent = (
          <Button
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...ctaOneStyles.primaryButton, ...(child.styles || {}) }}
          />
        );
      } else if (child.type === 'image') {
        childContent = (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{ ...ctaOneStyles.ctaImage, ...(child.styles || {}) }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={(item) => handleCTADrop(item, child.id)}
          />
        );
      } else {
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

      return (
        <React.Fragment key={child.id}>
          {activeDrop.containerId === containerId &&
            activeDrop.index === index && (
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
            onDragOver={(e) => onDragOver(e, containerId, index)}
            onDragEnd={onDragEnd}
            style={{ display: 'inline-block' }}
          >
            {childContent}
          </span>
        </React.Fragment>
      );
    });

    // Conditionally render an extra drop zone only if the container is empty
    // or an active drop is happening for the bottom of this container.
    if (container.children.length === 0 || activeDrop.containerId === containerId) {
      childrenElements.push(
        <div
          key="drop-zone-bottom"
          style={{
            height: container.children.length === 0 ? '40px' : 'auto',
            width: '100%',
          }}
          onDragOver={(e) =>
            onDragOver(e, containerId, container.children.length)
          }
          onDrop={(e) => onDrop(e, containerId)}
        >
          {activeDrop.containerId === containerId &&
            activeDrop.index === container.children.length && (
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
              >
                Drop here – element will be dropped here
              </div>
            )}
        </div>
      );
    }

    return childrenElements;
  };

  // Merge overall CTA styles.
  useEffect(() => {
    if (ctaElement) {
      const merged = mergeStyles(ctaOneStyles.cta, ctaElement.styles);
      if (ctaElement.styles.display !== merged.display) {
        updateStyles(ctaElement.id, merged);
      }
    }
  }, [ctaElement, updateStyles]);

  const mergedCtaStyles = mergeStyles(ctaOneStyles.cta, ctaElement?.styles);

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedCtaStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        ctaRef.current = node;
        drop(node);
      }}
    >
      <Div
        id={`${uniqueId}-text`}
        parentId={`${uniqueId}-text`}
        styles={{ ...ctaOneStyles.ctaContent }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleCTADrop(item, `${uniqueId}-text`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-text`)}
      >
        {renderContainerChildren(`${uniqueId}-text`)}
      </Div>
      <Div
        id={`${uniqueId}-buttons`}
        parentId={`${uniqueId}-buttons`}
        styles={{ ...ctaOneStyles.buttonContainer }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleCTADrop(item, `${uniqueId}-buttons`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
      >
        {renderContainerChildren(`${uniqueId}-buttons`)}
      </Div>
      <Div
        id={`${uniqueId}-image`}
        parentId={`${uniqueId}-image`}
        styles={{ ...ctaOneStyles.ctaImage }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleCTADrop(item, `${uniqueId}-image`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-image`)}
      >
        {renderContainerChildren(`${uniqueId}-image`)}
      </Div>
    </Section>
  );
};

export default CTAOne;
