import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { defaultHeroStyles } from './defaultHeroStyles';
import Heading from '../../Texts/Heading';
import Paragraph from '../../Texts/Paragraph';
import { structureConfigurations } from '../../../configs/structureConfigurations';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);
const SelectableHeading = withSelectable(Heading);
const SelectableParagraph = withSelectable(Paragraph);

const HeroOne = ({ children = [], onDropItem, handleOpenMediaPanel,handleSelect }) => {
  const { heroOne } = structureConfigurations;

  // Helper function to find a child or fallback to default content
  const findChild = (type, defaultIndex) => {
    return (
      children.find((child) => child.type === type) ||
      heroOne.children[defaultIndex] || // Fallback to default configuration
      {}
    );
  };

  // Retrieve content or fallbacks
  const heroImage = findChild('image', 0);
  const heroTitle = findChild('title', 1);
  const heroDescription = findChild('paragraph', 2);
  const primaryButton = findChild('button', 3);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <section style={defaultHeroStyles.hero}       onClick={(e) => handleSelect(e)}  // if you need the event explicitly
>
      <div style={defaultHeroStyles.heroContent}>
        {/* Title */}
        {heroTitle.content && (
          <SelectableHeading
            id={heroTitle.id || 'default-title'}
            content={heroTitle.content}
            styles={defaultHeroStyles.heroTitle}
          />
        )}

        {/* Description */}
        {heroDescription.content && (
          <SelectableParagraph
            id={heroDescription.id || 'default-description'}
            content={heroDescription.content}
            styles={defaultHeroStyles.heroDescription}
          />
        )}

        {/* Buttons */}
        <div style={defaultHeroStyles.buttonContainer}>
          {primaryButton.content && (
            <SelectableButton
              id={primaryButton.id || 'default-primary-button'}
              content={primaryButton.content}
              styles={defaultHeroStyles.primaryButton}
            />
          )}
        </div>
      </div>

      {/* Hero Image */}
      <div style={defaultHeroStyles.heroImageContainer}>
        {heroImage.content && (
          <SelectableImage
            id={heroImage.id || 'default-hero-image'}
            src={heroImage.content}
            styles={defaultHeroStyles.heroImage}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        )}
      </div>
    </section>
  );
};

export default HeroOne;
