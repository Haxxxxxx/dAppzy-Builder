// src/Sections/ContentSections/SectionOne.jsx
import React, { useContext, useMemo, useRef, useEffect } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop.js';
import { defaultSectionStyles } from './defaultSectionStyles';
import { Heading, Paragraph, Button, Image, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import {
  registerContainer,
  injectDefaultContent,
  mergeStyles,
} from '../../../utils/htmlRenderUtils/containerHelpers';

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

  // Locate the section element from global state.
  const sectionElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Register the three containers once when the component mounts.
  useEffect(() => {
    registerContainer(
      uniqueId,
      'content',
      defaultSectionStyles.contentWrapper,
      elements,
      setElements,
      findElementById
    );
    registerContainer(
      uniqueId,
      'buttons',
      defaultSectionStyles.buttonContainer || {
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        marginTop: '10px',
      },
      elements,
      setElements,
      findElementById
    );
    registerContainer(
      uniqueId,
      'image',
      defaultSectionStyles.imageContainer,
      elements,
      setElements,
      findElementById
    );
  }, [uniqueId]);

  // Inject default content only once
  useEffect(() => {
    if (defaultInjectedRef.current) return;

    const defaultContent =
      (children && children.length > 0)
        ? children
        : (sectionElement &&
            sectionElement.configuration &&
            sectionElement.configuration.children) ||
          [];

    const mapping = {
      image: 'image',
      button: 'buttons',
      default: 'content',
    };

    const contentContainer = findElementById(`${uniqueId}-content`, elements);
    const buttonsContainer = findElementById(`${uniqueId}-buttons`, elements);
    const imageContainer = findElementById(`${uniqueId}-image`, elements);

    if (
      defaultContent.length > 0 &&
      contentContainer && contentContainer.children.length === 0 &&
      buttonsContainer && buttonsContainer.children.length === 0 &&
      imageContainer && imageContainer.children.length === 0
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
  }, [uniqueId, children, elements, sectionElement]);

  // Generic drop handler for new items dropped onto the section
  const handleSectionDrop = (droppedItem, parentId = uniqueId) => {
    if (droppedItem.id) {
      return;
    }

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

    const childrenElements = container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      let childContent;
      switch (child.type) {
        case 'heading':
          childContent = (
            <Heading
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...defaultSectionStyles.heading, ...(child.styles || {}) }}
              onClick={(e) => handleSelect(e, child.id)}
            />
          );
          break;
        case 'paragraph':
          childContent = (
            <Paragraph
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...defaultSectionStyles.paragraph, ...(child.styles || {}) }}
              onClick={(e) => handleSelect(e, child.id)}
            />
          );
          break;
        case 'button':
          childContent = (
            <Button
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...defaultSectionStyles.primaryButton, ...(child.styles || {}) }}
              onClick={(e) => handleSelect(e, child.id)}
            />
          );
          break;
        case 'image':
          childContent = (
            <Image
              key={child.id}
              id={child.id}
              src={child.content}
              styles={{ ...defaultSectionStyles.image, ...(child.styles || {}) }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={(item) => handleSectionDrop(item, child.id)}
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
            onDragOver={(e) => onDragOver(e, containerId, index)}
            onDragEnd={onDragEnd}
            style={{ display: 'inline-block' }}
          >
            {childContent}
          </span>
        </React.Fragment>
      );
    });

    // Only add bottom drop zone if we're actually dragging something
    if (activeDrop && activeDrop.containerId === containerId) {
    childrenElements.push(
      <div
        key="drop-zone-bottom"
        style={{ height: '40px', width: '100%' }}
        onDragOver={(e) => onDragOver(e, containerId, container.children.length)}
        onDrop={(e) => onDrop(e, containerId)}
      >
          {activeDrop.index === container.children.length && (
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

  const mergedSectionStyles = mergeStyles(
    defaultSectionStyles.section,
    sectionElement?.styles || {}
  );

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
      <div style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          {findElementById(`${uniqueId}-content`, elements) && (
            <Div
              id={`${uniqueId}-content`}
              parentId={`${uniqueId}-content`}
              styles={{ ...defaultSectionStyles.contentWrapper }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
              onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
            >
              {renderContainerChildren(`${uniqueId}-content`)}
            </Div>
          )}
          {findElementById(`${uniqueId}-buttons`, elements) && (
            <Div
              id={`${uniqueId}-buttons`}
              parentId={`${uniqueId}-buttons`}
              styles={{ ...defaultSectionStyles.buttonContainer }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
              onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
            >
              {renderContainerChildren(`${uniqueId}-buttons`)}
            </Div>
          )}
        </div>
        {findElementById(`${uniqueId}-image`, elements) && (
          <Div
            id={`${uniqueId}-image`}
            parentId={`${uniqueId}-image`}
            styles={{ ...defaultSectionStyles.imageContainer }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-image`)}
            onClick={(e) => handleInnerDivClick(e, `${uniqueId}-image`)}
          >
            {renderContainerChildren(`${uniqueId}-image`)}
          </Div>
        )}
      </div>
    </Section>
  );
};

export default SectionOne;
