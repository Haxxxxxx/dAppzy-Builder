import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { heroThreeStyles } from './defaultHeroStyles';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);

const HeroThree = ({ children, onDropItem, handleOpenMediaPanel }) => {
  const caption = children?.find((child) => child.type === 'span' && child.content?.includes('CAPTION'));
  const heroTitle = children?.find((child) => child.type === 'span' && child.content?.includes('Lorem ipsum'));
  const heroDescription = children?.find((child) => child.type === 'span' && child.content?.includes('Rhoncus morbi'));
  const primaryButton = children?.find((child) => child.type === 'button' && child.content?.includes('Primary Action'));
  const secondaryButton = children?.find((child) => child.type === 'button' && child.content?.includes('Secondary Action'));
  const heroImage = children?.find((child) => child.type === 'image');

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <section style={heroThreeStyles.heroSection}>
      <div style={heroThreeStyles.heroContent}>
        {caption && <SelectableSpan id={caption.id} content={caption.content} styles={heroThreeStyles.caption} />}
        {heroTitle && <SelectableSpan id={heroTitle.id} content={heroTitle.content} styles={heroThreeStyles.heroTitle} />}
        {heroDescription && (
          <SelectableSpan id={heroDescription.id} content={heroDescription.content} styles={heroThreeStyles.heroDescription} />
        )}
        <div style={heroThreeStyles.buttonContainer}>
          {primaryButton && (
            <SelectableButton id={primaryButton.id} content={primaryButton.content} styles={heroThreeStyles.primaryButton} />
          )}
          {secondaryButton && (
            <SelectableButton id={secondaryButton.id} content={secondaryButton.content} styles={heroThreeStyles.secondaryButton} />
          )}
        </div>
      </div>
      <div style={heroThreeStyles.heroImageContainer}>
        {heroImage && (
          <SelectableImage
            id={heroImage.id}
            src={heroImage.content}
            styles={heroThreeStyles.heroImage}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        )}
      </div>
    </section>
  );
};

export default HeroThree;
