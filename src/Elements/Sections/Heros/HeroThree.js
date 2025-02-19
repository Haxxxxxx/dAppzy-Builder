import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { CustomTemplateHeroStyles } from './defaultHeroStyles';
import { Heading, Paragraph, Button, Image, Span } from '../../SelectableElements';

/**
 * HeroThree - merges CustomTemplateHeroStyles for layout and child styling.
 */
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

  // If no custom styles exist for the container, apply the defaults
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

  // Identify children for layout
  const captionChild = children.find((c) => c.type === 'span');
  const headingChild = children.find((c) => c.type === 'heading');
  const paragraphChild = children.find((c) => c.type === 'paragraph');
  const buttonChildren = children.filter((c) => c.type === 'button');
  const imageChild = children.find((c) => c.type === 'image');

  // Merge hero-level (container) styles + highlight if drag is over
  const sectionStyles = {
    ...CustomTemplateHeroStyles.heroSection,
    ...(heroElement?.styles || {}), // user overrides
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
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
        {/* Caption (span) */}
        {captionChild && (
          <Span
            key={captionChild.id}
            id={captionChild.id}
            content={captionChild.content}
            styles={{
              ...CustomTemplateHeroStyles.caption,
              ...(captionChild.styles || {}),
            }}
          />
        )}

        {/* Heading */}
        {headingChild && (
          <Heading
            key={headingChild.id}
            id={headingChild.id}
            content={headingChild.content}
            styles={{
              ...CustomTemplateHeroStyles.heroTitle,
              ...(headingChild.styles || {}),
            }}
          />
        )}

        {/* Paragraph */}
        {paragraphChild && (
          <Paragraph
            key={paragraphChild.id}
            id={paragraphChild.id}
            content={paragraphChild.content}
            styles={{
              ...CustomTemplateHeroStyles.heroDescription,
              ...(paragraphChild.styles || {}),
            }}
          />
        )}

        {/* Buttons */}
        <div style={CustomTemplateHeroStyles.buttonContainer}>
          {buttonChildren.map((btn, index) => (
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

      {/* Right hero image */}
      {imageChild && (
        <div style={CustomTemplateHeroStyles.heroImageContainer}>
          <Image
            key={imageChild.id}
            id={imageChild.id}
            src={imageChild.content}
            styles={{
              ...CustomTemplateHeroStyles.heroImage,
              ...(imageChild.styles || {}),
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
          />
        </div>
      )}
    </section>
  );
};

export default HeroThree;
