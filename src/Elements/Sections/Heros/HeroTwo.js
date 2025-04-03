import React, { useContext, useMemo, useRef, useEffect } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop.js';
import { heroTwoStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { HeroConfiguration } from '../../../configs/heros/HeroConfigurations';

const HeroTwo = ({
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
    if (defaultInjectedRef.current) return;

    const contentContainer = findElementById(`${uniqueId}-content`, elements);

    if (!contentContainer) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-content`,
          type: 'div',
          styles: heroTwoStyles.heroLeftContent,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }

    const defaultContent = heroElement?.configuration ? 
      HeroConfiguration[heroElement.configuration].children : [];

    if (defaultContent.length > 0) {
      const currentContentContainer = findElementById(`${uniqueId}-content`, elements);

      const containerIsEmpty = 
        currentContentContainer && 
        currentContentContainer.children.length === 0;

      if (containerIsEmpty) {
        defaultContent.forEach((child) => {
          const newId = addNewElement(child.type, 1, null, `${uniqueId}-content`);
          setElements((prev) =>
            prev.map((el) =>
              el.id === newId ? { ...el, content: child.content } : el
            )
          );
          setElements((prev) =>
            prev.map((el) =>
              el.id === `${uniqueId}-content`
                ? { ...el, children: [...el.children, newId] }
                : el
            )
          );
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

    const childrenElements = container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      const childContent =
        child.type === 'heading' ? (
          <Heading
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...heroTwoStyles.heroTitle, ...(child.styles || {}) }}
          />
        ) : child.type === 'paragraph' ? (
          <Paragraph
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...heroTwoStyles.heroDescription, ...(child.styles || {}) }}
          />
        ) : child.type === 'button' ? (
          <div key={child.id} style={heroTwoStyles.buttonContainer}>
            <Button
              id={child.id}
              content={child.content}
              styles={{ ...heroTwoStyles.primaryButton, ...(child.styles || {}) }}
            />
          </div>
        ) : child.type === 'image' ? (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{ ...heroTwoStyles.heroImage, ...(child.styles || {}) }}
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
      const merged = merge({}, heroTwoStyles.heroSection, heroElement.styles);
      if (heroElement.styles.display !== merged.display) {
        updateStyles(heroElement.id, merged);
      }
    }
  }, [heroElement, updateStyles]);

  const mergedHeroStyles = merge({}, heroTwoStyles.heroSection, heroElement?.styles);

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
        id={`${uniqueId}-content`}
        parentId={`${uniqueId}-content`}
        styles={{ ...heroTwoStyles.heroLeftContent }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-content`)}
      >
        {renderContainerChildren(`${uniqueId}-content`)}
      </Div>
    </Section>
  );
};

export default HeroTwo;
