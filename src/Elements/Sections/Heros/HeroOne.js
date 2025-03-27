import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';

const HeroOne = ({
  handleSelect,
  uniqueId,
  children, // default content from parent mapping
  onDropItem, // optional external callback (if needed)
  handleOpenMediaPanel,
}) => {
  const heroRef = useRef(null);
  const defaultInjectedRef = useRef(false); // Guard for default injection
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  // Get the hero element (Section) from state.
  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Pre-register left and right containers if they don’t exist.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inject default content into left/right containers (if they are empty) only once.
  useEffect(() => {
    if (defaultInjectedRef.current) return; // run only once

    const defaultContent =
      (children && children.length > 0)
        ? children
        : (heroElement && heroElement.configuration && heroElement.configuration.children) || [];

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
        // For instance, images go to right; everything else goes to left.
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
  }, [children, heroElement, elements, findElementById, uniqueId, addNewElement, setElements]);

  // Generic drop handler that works for any dropped component.
  const handleHeroDrop = (droppedItem, parentId = uniqueId) => {
    const newId = addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId ? { ...el, children: [...el.children, newId] } : el
      )
    );
  };

  // Enable drop functionality on the whole hero section.
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem: (item) => handleHeroDrop(item, uniqueId),
  });

  // Apply default styles to the hero element if none exist.
  useEffect(() => {
    if (!heroElement) return;
    const noCustomStyles =
      !heroElement.styles || Object.keys(heroElement.styles).length === 0;
    if (noCustomStyles) {
      updateStyles(heroElement.id, { ...defaultHeroStyles.heroSection });
    }
  }, [heroElement, updateStyles]);

  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    if (element) {
      setSelectedElement(element);
    } else {
      setSelectedElement({ id: divId, type: 'div', styles: {} });
    }
  };

  // Drag and Drop Handlers for reordering child elements.
  const onDragStart = (e, draggedId) => {
    // Prevent drag event from propagating upward.
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', draggedId);
    // Create a custom drag image using the element that holds the event.
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.padding = '4px 8px';
    dragImage.style.background = '#fff';
    dragImage.style.border = '1px solid #ccc';
    dragImage.style.fontSize = 'inherit';
    // Use e.currentTarget so only the targeted element's content is used.
    dragImage.innerHTML = e.currentTarget.innerHTML;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(
      dragImage,
      dragImage.offsetWidth / 2,
      dragImage.offsetHeight / 2
    );
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const onDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const onDrop = (e, dropTargetIndex, containerId) => {
    e.stopPropagation();
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const container = findElementById(containerId, elements);
    if (!container) return;

    // Create a new array with the dragged element removed and inserted at the drop target index.
    const newChildren = container.children.filter((id) => id !== draggedId);
    newChildren.splice(dropTargetIndex, 0, draggedId);

    // Update state with the new order.
    setElements((prev) =>
      prev.map((el) =>
        el.id === containerId ? { ...el, children: newChildren } : el
      )
    );
  };

  // Utility: render children for a given container with drag and drop capabilities.
  // Here we wrap each child in a <span> to limit the draggable area to only the element’s content.
  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;
    return container.children.map((childId, index) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      // Common props for child components.
      const commonProps = {
        key: child.id || `${child.type}-${index}`,
        id: child.id || `${child.type}-${index}`,
      };

      // Render the appropriate component based on its type.
      const childContent = child.type === 'heading' ? (
        <Heading
          {...commonProps}
          content={child.content}
          styles={{ ...defaultHeroStyles.heroTitle, ...(child.styles || {}) }}
        />
      ) : child.type === 'paragraph' ? (
        <Paragraph
          {...commonProps}
          content={child.content}
          styles={{ ...defaultHeroStyles.heroDescription, ...(child.styles || {}) }}
        />
      ) : child.type === 'button' ? (
        <Button
          {...commonProps}
          content={child.content}
          styles={{ ...defaultHeroStyles.primaryButton, ...(child.styles || {}) }}
        />
      ) : child.type === 'image' ? (
        <Image
          {...commonProps}
          src={child.content}
          styles={{ ...defaultHeroStyles.heroImage, ...(child.styles || {}) }}
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

      // Wrap the child content in a <span> with inline-block display.
      // Stop propagation on drag events so the parent Section’s drop behavior isn’t triggered.
      return (
        <span
          key={child.id || `${child.type}-${index}`}
          draggable
          onDragStart={(e) => onDragStart(e, child.id)}
          onDragOver={(e) => onDragOver(e)}
          onDrop={(e) => onDrop(e, index, containerId)}
          style={{ display: 'inline-block' }}
        >
          {childContent}
        </span>
      );
    });
  };

  return (
    <Section
      id={uniqueId}
      style={{
        ...defaultHeroStyles.heroSection,
        ...(heroElement?.styles || {}),
        // Optionally, you can remove or adjust the drop-target style here if needed.
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
      {/* Render the left and right Divs */}
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
      {/* Items dropped directly on the hero section become children of the Section */}
    </Section>
  );
};

export default HeroOne;
