import React, { useContext, useMemo, useRef, useEffect } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop.js';
import { CustomTemplateHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div, Span } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';

const HeroThree = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const heroRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  useEffect(() => {
    // Only proceed if we haven't injected content yet
    if (defaultInjectedRef.current) return;

    const leftContainer = findElementById(`${uniqueId}-left`, elements);
    const rightContainer = findElementById(`${uniqueId}-right`, elements);

    // Create containers if they don't exist
    if (!leftContainer) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-left`,
          type: 'div',
          styles: CustomTemplateHeroStyles.heroContent,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }
    if (!rightContainer) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-right`,
          type: 'div',
          styles: CustomTemplateHeroStyles.heroImageContainer,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }

    // Get the default content from the hero configuration
    const defaultContent = heroElement?.configuration ? 
      structureConfigurations[heroElement.configuration].children : [];

    // Only inject content if we have default content and the containers are empty
    if (defaultContent.length > 0) {
      const currentLeftContainer = findElementById(`${uniqueId}-left`, elements);
      const currentRightContainer = findElementById(`${uniqueId}-right`, elements);

      // Check if the containers are empty
      const containersAreEmpty = 
        currentLeftContainer && 
        currentRightContainer && 
        currentLeftContainer.children.length === 0 && 
        currentRightContainer.children.length === 0;

      if (containersAreEmpty) {
        defaultContent.forEach((child) => {
          if (child.type === 'image') {
            const newId = addNewElement(child.type, 1, null, `${uniqueId}-right`);
            setElements((prev) =>
              prev.map((el) =>
                el.id === newId ? { ...el, content: child.content } : el
              )
            );
            setElements((prev) =>
              prev.map((el) =>
                el.id === `${uniqueId}-right`
                  ? { ...el, children: [...el.children, newId] }
                  : el
              )
            );
          } else {
            const newId = addNewElement(child.type, 1, null, `${uniqueId}-left`);
            setElements((prev) =>
              prev.map((el) =>
                el.id === newId ? { ...el, content: child.content } : el
              )
            );
            setElements((prev) =>
              prev.map((el) =>
                el.id === `${uniqueId}-left`
                  ? { ...el, children: [...el.children, newId] }
                  : el
              )
            );
          }
        });
        defaultInjectedRef.current = true;
      }
    }
  }, [children, heroElement, elements, findElementById, uniqueId, addNewElement, setElements]);

  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
    const newId = addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId ? { ...el, children: [...el.children, newId] } : el
      )
    );
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem: (item) => handleHeroDrop(item, uniqueId),
  });

  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    if (element) {
      setSelectedElement(element);
    } else {
      setSelectedElement({ id: divId, type: 'div', styles: {} });
    }
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

    let buttonCount = 0;
    let buttons = [];

    const childrenElements = container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      const childContent =
        child.type === 'span' ? (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...CustomTemplateHeroStyles.caption, ...(child.styles || {}) }}
          />
        ) : child.type === 'heading' ? (
          <Heading
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...CustomTemplateHeroStyles.heroTitle, ...(child.styles || {}) }}
          />
        ) : child.type === 'paragraph' ? (
          <Paragraph
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...CustomTemplateHeroStyles.heroDescription, ...(child.styles || {}) }}
          />
        ) : child.type === 'button' ? (
          (() => {
            const isPrimary = buttonCount === 0;
            buttonCount++;
            return (
              <span
                key={child.id}
                draggable
                onDragStart={(e) => onDragStart(e, child.id)}
                onDragOver={(e) => onDragOver(e, containerId, index)}
                onDragEnd={onDragEnd}
                style={{ display: 'inline-block' }}
              >
                <Button
                  id={child.id}
                  content={child.content}
                  styles={
                    isPrimary
                      ? { ...CustomTemplateHeroStyles.primaryButton, ...(child.styles || {}) }
                      : { ...CustomTemplateHeroStyles.secondaryButton, ...(child.styles || {}) }
                  }
                />
              </span>
            );
          })()
        ) : child.type === 'image' ? (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{ ...CustomTemplateHeroStyles.heroImage, ...(child.styles || {}) }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={(item) => handleHeroDrop(item, child.id)}
          />
        ) : (
          renderElement(
            child,
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            undefined,
            handleOpenMediaPanel
          )
        );

      // If this is a button, add it to our buttons array
      if (child.type === 'button') {
        buttons.push(childContent);
        return null; // Don't render the button here
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

    // Add the button container if we have any buttons
    if (buttons.length > 0) {
      childrenElements.push(
        <div key="button-container" style={CustomTemplateHeroStyles.buttonContainer}>
          {buttons}
        </div>
      );
    }

    // Add the drop zone at the bottom
    childrenElements.push(
      <div
        key="drop-zone-bottom"
        style={{ height: '40px', width: '100%' }}
        onDragOver={(e) => onDragOver(e, containerId, container.children.length)}
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

    return childrenElements;
  };

  useEffect(() => {
    if (heroElement) {
      const merged = merge({}, CustomTemplateHeroStyles.heroSection, heroElement.styles);
      if (heroElement.styles.display !== merged.display) {
        updateStyles(heroElement.id, merged);
      }
    }
  }, [heroElement, updateStyles]);

  const mergedHeroStyles = merge({}, CustomTemplateHeroStyles.heroSection, heroElement?.styles);

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
      ref={(node) => {
        heroRef.current = node;
        drop(node);
      }}
    >
      <Div
        id={`${uniqueId}-left`}
        parentId={`${uniqueId}-left`}
        styles={{ ...CustomTemplateHeroStyles.heroContent }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-left`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-left`)}
      >
        {renderContainerChildren(`${uniqueId}-left`)}
      </Div>
      <Div
        id={`${uniqueId}-right`}
        parentId={`${uniqueId}-right`}
        styles={{ ...CustomTemplateHeroStyles.heroImageContainer }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-right`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-right`)}
      >
        {renderContainerChildren(`${uniqueId}-right`)}
      </Div>
    </Section>
  );
};

export default HeroThree;
