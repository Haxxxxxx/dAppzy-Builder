import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { CustomTemplateHeroStyles } from './defaultHeroStyles';
import { Heading, Paragraph, Button, Image, Span } from '../../SelectableElements';

const HeroThree = ({
  uniqueId,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  handleSelect,
}) => {
  const heroRef = useRef(null);
  const { elements, updateStyles } = useContext(EditableContext);

  // Make this hero droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem,
  });

  // Locate the hero element from global state
  const heroElement = elements.find((el) => el.id === uniqueId);

  // If no custom styles exist for the container, apply defaults
  useEffect(() => {
    if (!heroElement) return;

    const noCustomStyles =
      !heroElement.styles || Object.keys(heroElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(heroElement.id, {
        ...CustomTemplateHeroStyles.heroSection,
      });
    }
  }, [heroElement, updateStyles]);

  // Merge container-level styles + highlight if dragging over
  const sectionStyles = {
    ...CustomTemplateHeroStyles.heroSection,
    ...(heroElement?.styles || {}),
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
  };

  // Handle image replacement via drag-and-drop
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
      style={sectionStyles}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {/* Left hero content */}
      <div style={CustomTemplateHeroStyles.heroContent}>
        {/* Render all Span (captions) */}
        {children
          .filter((child) => child.type === 'span')
          .map((child) => (
            <Span
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...CustomTemplateHeroStyles.caption,
                ...(child.styles || {}),
              }}
            />
          ))}

        {/* Render all Heading elements */}
        {children
          .filter((child) => child.type === 'heading')
          .map((child) => (
            <Heading
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...CustomTemplateHeroStyles.heroTitle,
                ...(child.styles || {}),
              }}
            />
          ))}

        {/* Render all Paragraph elements */}
        {children
          .filter((child) => child.type === 'paragraph')
          .map((child) => (
            <Paragraph
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...CustomTemplateHeroStyles.heroDescription,
                ...(child.styles || {}),
              }}
            />
          ))}

        {/* Render all Buttons */}
        <div style={CustomTemplateHeroStyles.buttonContainer}>
          {children
            .filter((child) => child.type === 'button')
            .map((btn, index) => (
              <Button
                key={btn.id}
                id={btn.id}
                content={btn.content}
                styles={
                  index === 0
                    ? {
                        ...CustomTemplateHeroStyles.primaryButton,
                        ...(btn.styles || {}),
                      }
                    : {
                        ...CustomTemplateHeroStyles.secondaryButton,
                        ...(btn.styles || {}),
                      }
                }
              />
            ))}
        </div>
      </div>

      {/* Right hero image(s) */}
      <div style={CustomTemplateHeroStyles.heroImageContainer}>
        {children
          .filter((child) => child.type === 'image')
          .map((child) => (
            <Image
              key={child.id}
              id={child.id}
              src={child.content}
              styles={{
                ...CustomTemplateHeroStyles.heroImage,
                ...(child.styles || {}),
              }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={handleImageDrop}
            />
          ))}
      </div>
    </section>
  );
};

export default HeroThree;
