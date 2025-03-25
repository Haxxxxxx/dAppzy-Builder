import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph, Section, Div } from '../../SelectableElements';

const HeroOne = ({
  handleSelect, // parent selection handler for the overall hero
  uniqueId,
  children, // typically passed from DraggableHero after mapping via findElementById
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const heroRef = useRef(null);
  const { elements, updateStyles } = useContext(EditableContext);

  // Find the hero element in context
  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Fallback: if no children are passed and heroElement.children is empty, use configuration children
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

  // Apply default hero styles if no custom styles exist
  useEffect(() => {
    if (!heroElement) return;
    const noCustomStyles =
      !heroElement.styles || Object.keys(heroElement.styles).length === 0;
    if (noCustomStyles) {
      updateStyles(heroElement.id, {
        ...defaultHeroStyles.heroSection,
      });
    }
  }, [heroElement, updateStyles]);

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
        handleSelect(e);
      }}
    >
      {/* Left side: render all non‑image content in an editable Div */}
      <Div
        id={uniqueId + '-left'}
        styles={{...defaultHeroStyles.heroContent}}
        handleOpenMediaPanel={handleOpenMediaPanel}
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

      {/* Right side: render image content in an editable Div */}
      <Div
        id={uniqueId + '-right'}
        styles={defaultHeroStyles.heroImageContainer}
        handleOpenMediaPanel={handleOpenMediaPanel}
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
