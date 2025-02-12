import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { heroTwoStyles } from './defaultHeroStyles';
import { Heading, Paragraph, Button, Image } from '../../SelectableElements';

const HeroTwo = ({
  uniqueId,
  children = [],
  onDropItem,
  handleSelect,
  handleOpenMediaPanel,
}) => {
  const sectionRef = useRef(null);

  // 1) Grab elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  // 2) Make this hero droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // 3) Find the hero element in global state
  const heroElement = elements.find((el) => el.id === uniqueId);

  // 4) If no custom styles exist yet, apply `heroTwoStyles.heroSection`
  useEffect(() => {
    if (!heroElement) return;

    const noCustomStyles =
      !heroElement.styles || Object.keys(heroElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(heroElement.id, {
        ...heroTwoStyles.heroSection, // your default background, color, etc.
      });
    }
  }, [heroElement, updateStyles]);

  // 5) Identify children by type for layout
  const headingChild = children.find((c) => c.type === 'heading');
  const paragraphChild = children.find((c) => c.type === 'paragraph');
  const imageChild = children.find((c) => c.type === 'image');
  const buttonChild = children.find((c) => c.type === 'button');

  // 6) Merge hero-level + highlight if dragging over
  const sectionStyles = {
    ...heroTwoStyles.heroSection,
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
  };

  // 7) Render
  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={sectionStyles}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {/* Heading */}
      {headingChild && (
        <Heading
          id={headingChild.id}
          content={headingChild.content}
          styles={heroTwoStyles.heroTitle}
        />
      )}

      {/* Paragraph */}
      {paragraphChild && (
        <Paragraph
          id={paragraphChild.id}
          content={paragraphChild.content}
          styles={heroTwoStyles.heroDescription}
        />
      )}
      {/* Button */}
      {buttonChild && (
        <Button
          id={buttonChild.id}
          content={buttonChild.content}
          styles={heroTwoStyles.primaryButton}
        />
      )}
    </section>
  );
};

export default HeroTwo;
