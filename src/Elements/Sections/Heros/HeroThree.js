import React, { useRef } from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { heroThreeStyles } from './defaultHeroStyles';
import useElementDrop from '../../../utils/useElementDrop';
import Heading from '../../Texts/Heading';
import Paragraph from '../../Texts/Paragraph';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);
const SelectableHeading = withSelectable(Heading);
const SelectableParagraph = withSelectable(Paragraph);


const HeroThree = ({ uniqueId, children, onDropItem, handleOpenMediaPanel, handleSelect }) => {
  const heroRef = useRef(null);
  const { heroThree } = structureConfigurations;

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem,
  });

  // Helper function to merge styles
  const mergeStyles = (defaultStyles, childStyles) => ({
    ...defaultStyles,
    ...childStyles,
  });

  // Find or use defaults for each child
  const caption = children?.find((child) => child.type === 'span') || heroThree.children[0];
  const title = children?.find((child) => child.type === 'heading') || heroThree.children[1];
  const description = children?.find((child) => child.type === 'paragraph') || heroThree.children[2];
  const primaryButton = children?.find((child) => child.type === 'button' && child.content === 'Primary Action') || heroThree.children[3];
  const secondaryButton = children?.find((child) => child.type === 'button' && child.content === 'Secondary Action') || heroThree.children[4];
  const image = children?.find((child) => child.type === 'image');

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  const sectionStyles = isOverCurrent
    ? { ...heroThreeStyles.heroSection, outline: '2px dashed #4D70FF' }
    : heroThreeStyles.heroSection;

  return (
    <section
      ref={(node) => {
        heroRef.current = node;
        drop(node);
      }}
      style={heroThreeStyles.heroSection}
      onClick={(e) => handleSelect(e)}  // if you need the event explicitly

    >
      <div style={heroThreeStyles.heroContent}>
      {caption && (
        <SelectableSpan
          id={caption.id || `caption-${uniqueId}`}
          content={caption.content}
          styles={mergeStyles(heroThreeStyles.caption, caption.styles)}
        />
      )}

      {title && (
        <SelectableHeading
          id={title.id || `title-${uniqueId}`}
          content={title.content}
          styles={mergeStyles(heroThreeStyles.heroTitle, title.styles)}
        />
      )}

      {description && (
        <SelectableParagraph
          id={description.id || `description-${uniqueId}`}
          content={description.content}
          styles={mergeStyles(heroThreeStyles.heroDescription, description.styles)}
        />
      )}

      <div style={{...heroThreeStyles.buttonContainer}}>
        {primaryButton && (
          <SelectableButton
            id={primaryButton.id || `primary-button-${uniqueId}`}
            content={primaryButton.content}
            styles={mergeStyles(heroThreeStyles.primaryButton, primaryButton.styles)}
          />
        )}
        {secondaryButton && (
          <SelectableButton
            id={secondaryButton.id || `secondary-button-${uniqueId}`}
            content={secondaryButton.content}
            styles={mergeStyles(heroThreeStyles.secondaryButton, secondaryButton.styles)}
          />
        )}
      </div>
      </div>

      {image && (
        <SelectableImage
          id={image.id || `image-${uniqueId}`}
          src={image.content}
          styles={mergeStyles(heroThreeStyles.heroImage, image.styles)}
          handleDrop={handleImageDrop}
          handleOpenMediaPanel={handleOpenMediaPanel}
        />
      )}
    </section>
  );
};

export default HeroThree;
