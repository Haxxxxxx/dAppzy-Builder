import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { heroThreeStyles } from './defaultHeroStyles';
import { Heading, Paragraph, Button, Image, Span } from '../../SelectableElements';

/**
 * A "HeroThree" component that merges heroThreeStyles for layout and child styling.
 */
const HeroThree = ({
  uniqueId,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  handleSelect,
}) => {
  const heroRef = useRef(null);

  // 1) Access context
  const { elements, updateStyles } = useContext(EditableContext);

  // 2) Make the hero droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem,
  });

  // 3) Find the hero element in state
  const heroElement = elements.find((el) => el.id === uniqueId);

  // 4) If no custom styles exist, apply heroThreeStyles.heroSection
  useEffect(() => {
    if (!heroElement) return;

    const noCustomStyles =
      !heroElement.styles || Object.keys(heroElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(heroElement.id, {
        ...heroThreeStyles.heroSection,
      });
    }
  }, [heroElement, updateStyles]);

  // 5) Identify children for layout
  const captionChild = children.find((c) => c.type === 'span');
  const headingChild = children.find((c) => c.type === 'heading');
  const paragraphChild = children.find((c) => c.type === 'paragraph');
  const buttonChildren = children.filter((c) => c.type === 'button');
  const imageChild = children.find((c) => c.type === 'image');

  // 6) Merge hero-level + highlight if drag is over
  const sectionStyles = {
    ...heroThreeStyles.heroSection,
    ...(heroElement?.styles || {}),
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
      <div style={heroThreeStyles.heroContent}>
        {captionChild && (
          <Span
            key={captionChild.id}
            id={captionChild.id}
            content={captionChild.content}
            styles={captionChild.styles || heroThreeStyles.caption}
          />
        )}

        {headingChild && (
          <Heading
            key={headingChild.id}
            id={headingChild.id}
            content={headingChild.content}
            styles={headingChild.styles || heroThreeStyles.heroTitle}
          />
        )}

        {paragraphChild && (
          <Paragraph
            key={paragraphChild.id}
            id={paragraphChild.id}
            content={paragraphChild.content}
            styles={paragraphChild.styles || heroThreeStyles.heroDescription}
          />
        )}

        {/* Button container */}
        <div style={heroThreeStyles.buttonContainer}>
          {buttonChildren.map((btn, index) => (
            <Button
              key={btn.id}
              id={btn.id}
              content={btn.content}
              styles={
                index === 0
                  ? (heroThreeStyles.primaryButton)
                  : (heroThreeStyles.secondaryButton)
              }
            />
          ))}
        </div>
      </div>

      {/* Right hero image */}
      {imageChild && (
        <div style={heroThreeStyles.heroImageContainer}>
          <Image
            key={imageChild.id}
            id={imageChild.id}
            src={imageChild.content}
            styles={heroThreeStyles.heroImage}
            handleOpenMediaPanel={handleOpenMediaPanel}
          />
        </div>
      )}
    </section>
  );
};

export default HeroThree;
