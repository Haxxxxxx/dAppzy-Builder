import React, { useContext, useMemo, useRef, useEffect } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { defaultHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';

const HeroOne = ({
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
    if (!findElementById(`${uniqueId}-left`, elements)) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-left`,
          type: 'div',
          styles: defaultHeroStyles.heroLeftContent,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }
    if (!findElementById(`${uniqueId}-right`, elements)) {
      setElements((prev) => [
        ...prev,
        {
          id: `${uniqueId}-right`,
          type: 'div',
          styles: defaultHeroStyles.heroRightContent,
          children: [],
          parentId: uniqueId,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (defaultInjectedRef.current) return;

    const defaultContent =
      children && children.length > 0
        ? children
        : (heroElement &&
            heroElement.configuration &&
            heroElement.configuration.children) ||
          [];

    const leftContainer = findElementById(`${uniqueId}-left`, elements);
    const rightContainer = findElementById(`${uniqueId}-right`, elements);

    if (
      defaultContent.length > 0 &&
      leftContainer &&
      rightContainer &&
      leftContainer.children.length === 0 &&
      rightContainer.children.length === 0
    ) {
      defaultContent.forEach((child) => {
        const containerId = child.type === 'image' ? `${uniqueId}-right` : `${uniqueId}-left`;
        const newId = addNewElement(child.type, 1, null, containerId);
        setElements((prev) =>
          prev.map((el) =>
            el.id === newId ? { ...el, content: child.content } : el
          )
        );
        setElements((prev) =>
          prev.map((el) =>
            el.id === containerId
              ? { ...el, children: [...el.children, newId] }
              : el
          )
        );
      });
      defaultInjectedRef.current = true;
    }
  }, [
    children,
    heroElement,
    elements,
    findElementById,
    uniqueId,
    addNewElement,
    setElements,
  ]);

  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
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
          ? { ...el, children: [...el.children, newId] }
          : el
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
    draggedId,
  } = useReorderDrop(findElementById, elements, setElements);

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
            styles={{
              ...defaultHeroStyles.heroTitle,
              ...(child.styles || {}),
            }}
          />
        );
      } else if (child.type === 'paragraph') {
        childContent = (
          <Paragraph
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...defaultHeroStyles.heroDescription,
              ...(child.styles || {}),
            }}
          />
        );
      } else if (child.type === 'button') {
        childContent = (
          <Button
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...defaultHeroStyles.primaryButton,
              ...(child.styles || {}),
            }}
          />
        );
      } else if (child.type === 'image') {
        childContent = (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{
              ...defaultHeroStyles.heroImage,
              ...(child.styles || {}),
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={(dragItem) => handleHeroDrop(dragItem, child.id)}
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
      const merged = merge(
        {},
        defaultHeroStyles.heroSection,
        heroElement.styles
      );
      if (heroElement.styles.display !== merged.display) {
        updateStyles(heroElement.id, merged);
      }
    }
  }, [heroElement, updateStyles]);

  const mergedHeroStyles = merge(
    {},
    defaultHeroStyles.heroSection,
    heroElement?.styles
  );

  return (
    <Section
      id={uniqueId}
      style={{
        ...mergedHeroStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
      }}
      ref={(node) => {
        heroRef.current = node;
        drop(node);
      }}
    >
      <Div
        id={`${uniqueId}-left`}
        parentId={`${uniqueId}-left`}
        styles={{ ...defaultHeroStyles.heroLeftContent }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-left`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-left`)}
      >
        {renderContainerChildren(`${uniqueId}-left`)}
      </Div>

      <Div
        id={`${uniqueId}-right`}
        parentId={`${uniqueId}-right`}
        styles={{ ...defaultHeroStyles.heroRightContent }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleHeroDrop(item, `${uniqueId}-right`)}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-right`)}
      >
        {renderContainerChildren(`${uniqueId}-right`)}
      </Div>
    </Section>
  );
};

export default HeroOne;
