// src/Elements/Sections/Heros/HeroOne.jsx

import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultHeroStyles } from './defaultHeroStyles';
import { Image, Button, Heading, Paragraph } from '../../SelectableElements';

const HeroOne = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const heroRef = useRef(null);
  const { elements, updateStyles } = useContext(EditableContext);

  // Locate this hero element in global state
  const heroElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Make the hero droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem,
  });

  // If no custom styles exist, apply defaultHeroStyles
  useEffect(() => {
    if (!heroElement) return;

    const noCustomStyles =
      !heroElement.styles || Object.keys(heroElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(heroElement.id, {
        ...defaultHeroStyles.heroSection,
        // Optionally store a flag if you prefer:
        // applied: true,
      });
    }
  }, [heroElement, updateStyles]);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <section
      ref={(node) => {
        heroRef.current = node;
        drop(node);
      }}
      style={{
        // Merge default + user-defined hero-level styles:
        ...defaultHeroStyles.heroSection,
        ...(heroElement?.styles || {}),
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {/* Left side content */}
      <div style={defaultHeroStyles.heroContent}>
        {children
          .filter((child) => child?.type === 'heading')
          .map((child) => (
            <Heading
              key={child.id}
              id={child.id}
              content={child.content}
              // Merge default + user overrides for the heading
              styles={{
                ...defaultHeroStyles.heroTitle,
                ...(child.styles || {}),
              }}
            />
          ))}

        {children
          .filter((child) => child?.type === 'paragraph')
          .map((child) => (
            <Paragraph
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...defaultHeroStyles.heroDescription,
                ...(child.styles || {}),
              }}
            />
          ))}

        <div style={defaultHeroStyles.buttonContainer}>
          {children
            .filter((child) => child?.type === 'button')
            .map((child) => (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...defaultHeroStyles.primaryButton,
                  ...(child.styles || {}),
                }}
              />
            ))}
        </div>
      </div>

      {/* Right side image */}
      <div style={defaultHeroStyles.heroImageContainer}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <Image
              key={child.id}
              id={child.id}
              src={child.content}
              styles={{
                ...defaultHeroStyles.heroImage,
                ...(child.styles || {}),
              }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={(item) => handleImageDrop(item, child.id)}
            />
          ))}
      </div>
    </section>
  );
};

export default HeroOne;
