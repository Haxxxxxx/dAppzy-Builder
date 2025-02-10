import React, { useRef } from 'react';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import useElementDrop from '../../../utils/useElementDrop';
import { heroTwoStyles } from './defaultHeroStyles';
import { Heading, Paragraph, Button, Image } from '../../SelectableElements';

const HeroTwo = ({ uniqueId, children, onDropItem, handleSelect }) => {
  const sectionRef = useRef(null);
  const { heroTwo } = structureConfigurations;
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  const heading = children?.find((child) => child.type === 'heading' && child.content === heroTwo.children[0].content) || heroTwo.children[0];
  const subtitle = children?.find((child) => child.type === 'paragraph' && child.content === heroTwo.children[1].content) || heroTwo.children[1];
  const button = children?.find((child) => child.type === 'button' && child.content === heroTwo.children[2].content) || heroTwo.children[2];
  const image = children?.find((child) => child.type === 'image');

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  const sectionStyles = isOverCurrent
    ? { ...heroTwoStyles.heroSection, ...heroTwoStyles.heroSectionWithDrop }
    : heroTwoStyles.heroSection;

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={sectionStyles}
      onClick={(e) => handleSelect(e)}  // if you need the event explicitly

    >
      <Heading id={heading.id || `heading-${uniqueId}`} content={heading.content} styles={{...heroTwoStyles.heading}} />
      <Paragraph id={subtitle.id || `subtitle-${uniqueId}`} content={subtitle.content} styles={{...heroTwoStyles.description}} />
      {image && (
        <Image
          id={image.id}
          src={image.content}
          styles={heroTwoStyles.heroImage}
          handleOpenMediaPanel={null}
          handleDrop={handleImageDrop}
        />
      )}
      <Button id={button.id || `button-${uniqueId}`} content={button.content} styles={{...heroTwoStyles.buttonContainer}} />
    </section>
  );
};

export default HeroTwo;
