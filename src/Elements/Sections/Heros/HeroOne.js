import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';

const HeroOne = ({
  handleSelect, // Parent selection handler for the overall hero
  uniqueId,
  children, // Typically passed from DraggableHero after mapping via findElementById
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const heroRef = useRef(null);
  const { elements, setSelectedElement, findElementById, updateStyles } = useContext(EditableContext);

  // Find the hero element in context
  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Determine children to render (fallback logic)
  const heroChildren =
    children && children.length > 0
      ? children
      : (heroElement?.children && heroElement.children.length > 0)
        ? heroElement.children
        : (heroElement?.configuration?.children || []);

  // Enable drop functionality on the hero
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem,
  });

  // On mount, if no custom styles exist, apply defaults
  useEffect(() => {
    if (!heroElement) return;
    const noCustomStyles = !heroElement.styles || Object.keys(heroElement.styles).length === 0;
    if (noCustomStyles) {
      updateStyles(heroElement.id, { ...defaultHeroStyles.heroSection });
    }
  }, [heroElement, updateStyles]);

  // Handle inner div selection by setting the selected element from context
  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    if (element) {
      setSelectedElement(element);
    } else {
      // Optionally, if not found, simply set a temporary selected element.
      setSelectedElement({ id: divId, type: 'div', styles: { ...defaultHeroStyles.heroLeftContent } });
    }
  };

  // Handle image drop for image elements
  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <Section
      id={uniqueId}
      style={{
        ...defaultHeroStyles.heroSection,
        ...(heroElement?.styles || {}),
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Optionally select the overall hero element here if desired:
        handleSelect(e, uniqueId);
      }}
      ref={drop}
    >
      {/* Left side: Render all non‑image content */}
      <Div
        id={`${uniqueId}-left`}
        parentId={uniqueId}
        styles={{ ...defaultHeroStyles.heroLeftContent }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-left`)}
      >
        {heroChildren
          .filter((child) => child?.type !== 'image')
          .map((child, index) => {
            if (child.type === 'heading') {
              return (
                <Heading
                  key={child.id || `heading-${index}`}
                  id={child.id || `heading-${index}`}
                  content={child.content}
                  styles={{
                    ...defaultHeroStyles.heroTitle,
                    ...(child.styles || {}),
                  }}
                />
              );
            } else if (child.type === 'paragraph') {
              return (
                <Paragraph
                  key={child.id || `paragraph-${index}`}
                  id={child.id || `paragraph-${index}`}
                  content={child.content}
                  styles={{
                    ...defaultHeroStyles.heroDescription,
                    ...(child.styles || {}),
                  }}
                />
              );
            } else if (child.type === 'button') {
              return (
                <Button
                  key={child.id || `button-${index}`}
                  id={child.id || `button-${index}`}
                  content={child.content}
                  styles={{
                    ...defaultHeroStyles.primaryButton,
                    ...(child.styles || {}),
                  }}
                />
              );
            }
            return null;
          })}
      </Div>

      {/* Right side: Render image content */}
      <Div
        id={`${uniqueId}-right`}
        parentId={uniqueId}
        styles={{ ...defaultHeroStyles.heroRightContent }}
        handleOpenMediaPanel={handleOpenMediaPanel}
        onClick={(e) => handleInnerDivClick(e, `${uniqueId}-right`)}
      >
        {heroChildren
          .filter((child) => child?.type === 'image')
          .map((child, index) => (
            <Image
              key={child.id || `image-${index}`}
              id={child.id || `image-${index}`}
              src={child.content}
              styles={{
                ...defaultHeroStyles.heroImage,
                ...(child.styles || {}),
              }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={(item) => handleImageDrop(item, child.id || `image-${index}`)}
            />
          ))}
      </Div>
    </Section>
  );
};

export default HeroOne;
