import React, { useRef } from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { heroThreeStyles } from './defaultHeroStyles';
import useElementDrop from '../../../utils/useElementDrop';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);

const HeroThree = ({ uniqueId, children, onDropItem, handleOpenMediaPanel }) => {
  const heroRef = useRef(null);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem,
  });

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
    <section
      ref={(node) => {
        heroRef.current = node;
        drop(node); // This ensures the element is a valid drop target
      }}
      style={{
        ...heroThreeStyles.heroSection,
        outline: isOverCurrent ? '2px dashed #4D70FF' : 'none',
      }}
    >

      <div style={heroThreeStyles.heroContent}>
        {caption && (
          <SelectableSpan
            id={caption.id}
            content={caption.content}
            styles={{
              ...heroThreeStyles.caption,
              ...caption.styles
            }}
          />
        )}

        {heroTitle && (
          <SelectableSpan
            id={heroTitle.id}
            content={heroTitle.content}
            styles={{ ...heroThreeStyles.heroTitle,
              ...heroTitle.styles
             }}
          />
        )}
        {heroDescription && (
          <SelectableSpan
            id={heroDescription.id}
            content={heroDescription.content}
            styles={{ ...heroThreeStyles.heroDescription,
              ...heroDescription.styles
             }}
          />
        )}
        <div style={{ ...heroThreeStyles.buttonContainer }}>
          {primaryButton && (
            <SelectableButton
              id={primaryButton.id}
              content={primaryButton.content}
              styles={{ ...heroThreeStyles.primaryButton,
                ...primaryButton.styles
               }}
            />
          )}
          {secondaryButton && (
            <SelectableButton
              id={secondaryButton.id}
              content={secondaryButton.content}
              styles={{
                ...heroThreeStyles.secondaryButton,
                ...secondaryButton.styles // Merge child's dynamic styles
              }}
            />
          )}
        </div>
      </div>
      <div style={heroThreeStyles.heroImageContainer}>
        {heroImage && (
          <SelectableImage
            handleOpenMediaPanel={handleOpenMediaPanel}
            id={heroImage.id}
            styles={{ ...heroThreeStyles.heroImage,
              ...heroImage.styles
             }}
            handleDrop={handleImageDrop}
          />
        )}
      </div>
    </section>
  );
};

export default HeroThree;
