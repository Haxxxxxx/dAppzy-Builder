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

  // 1) Register the three containers once when the component mounts.
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
    // Run only once per mount.
  }, [uniqueId]);

  // 2) Inject default content only once (no environment check).
  useEffect(() => {
    if (defaultInjectedRef.current) return;

    // Determine the default content from children prop or from section config
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

    // Only inject if the containers exist and appear empty
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

  // 3) Generic drop handler for new items dropped onto the section.
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

  // 4) Enable drop functionality on the entire section.
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem: (item) => handleSectionDrop(item, uniqueId),
  });

  // 5) Use our custom hook for drag and drop reordering.
  const { activeDrop, onDragStart, onDragOver, onDrop, onDragEnd } = useReorderDrop(
    findElementById,
    elements,
    setElements
  );

  // 6) Select the container div if clicked
  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };

  // 7) Render children within a container with drop placeholders.
  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    const childrenElements = container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      let childContent;
      if (child.type === 'heading') {
        childContent = (
          <Heading
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...defaultSectionStyles.heading, ...(child.styles || {}) }}
          />
        );
      } else if (child.type === 'paragraph') {
        childContent = (
          <Paragraph
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...defaultSectionStyles.paragraph, ...(child.styles || {}) }}
          />
        );
      } else if (child.type === 'button') {
        childContent = (
          <Button
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...defaultSectionStyles.primaryButton, ...(child.styles || {}) }}
          />
        );
      } else if (child.type === 'image') {
        childContent = (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{ ...defaultSectionStyles.image, ...(child.styles || {}) }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={(item) => handleSectionDrop(item, child.id)}
          />
        );
      } else {
        // Fallback for other element types
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
          {activeDrop.containerId === containerId && activeDrop.index === index && (
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

    // Drop zone at the bottom
    if (
      activeDrop.containerId === containerId &&
      activeDrop.index === container.children.length
    ) {
      childrenElements.push(
        <div
          key="drop-zone-bottom"
          style={{
            height: '40px',
            width: '100%',
          }}
          onDragOver={(e) => onDragOver(e, containerId, container.children.length)}
          onDrop={(e) => onDrop(e, containerId)}
        >
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
        </div>
      );
    }

    return childrenElements;
  };

  // 8) Merge overall Section styles
  useEffect(() => {
    if (sectionElement) {
      const merged = mergeStyles(defaultSectionStyles.sectionContainer, sectionElement.styles);
      if (sectionElement.styles.display !== merged.display) {
        updateStyles(sectionElement.id, merged);
      }
    }
  }, [sectionElement, updateStyles]);

  const mergedSectionStyles = mergeStyles(
    defaultSectionStyles.sectionContainer,
    sectionElement?.styles
  );

  // 9) Final render
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
        styles={{ ...defaultSectionStyles.contentWrapper }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
      >
        {renderContainerChildren(`${uniqueId}-content`)}
      </Div>

      <Div
        id={`${uniqueId}-buttons`}
        parentId={`${uniqueId}-buttons`}
        styles={
          defaultSectionStyles.buttonContainer || {
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
            marginTop: '10px',
          }
        }
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleSectionDrop(item, `${uniqueId}-buttons`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-buttons`)}
      >
        {renderContainerChildren(`${uniqueId}-buttons`)}
      </Div>

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
    </Section>
  );
};

export default SectionOne;
