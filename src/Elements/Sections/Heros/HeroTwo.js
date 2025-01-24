import React, { useRef } from 'react';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import useElementDrop from '../../../utils/useElementDrop';
import withSelectable from '../../../utils/withSelectable';
import { heroTwoStyles } from './defaultHeroStyles';
import Heading from '../../Texts/Heading';
import Paragraph from '../../Texts/Paragraph';

const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);
const SelectableHeading = withSelectable(Heading);
const SelectableParagraph = withSelectable(Paragraph);

const HeroTwo = ({ uniqueId, children, onDropItem, handleSelect }) => {
  const sectionRef = useRef(null);
  const { heroTwo } = structureConfigurations;
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  const title = children?.find((child) => child.type === 'title' && child.content === heroTwo.children[0].content) || heroTwo.children[0];
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
      <SelectableHeading id={title.id || `title-${uniqueId}`} content={title.content} styles={title.styles || heroTwoStyles.title} />
      <SelectableParagraph id={subtitle.id || `subtitle-${uniqueId}`} content={subtitle.content} styles={subtitle.styles || heroTwoStyles.subtitle} />
      {image && (
        <SelectableImage
          id={image.id}
          src={image.content}
          styles={heroTwoStyles.heroImage}
          handleOpenMediaPanel={null}
          handleDrop={handleImageDrop}
        />
      )}
      <SelectableButton id={button.id || `button-${uniqueId}`} content={button.content} styles={button.styles || heroTwoStyles.button} />
    </section>
  );
};

export default HeroTwo;
