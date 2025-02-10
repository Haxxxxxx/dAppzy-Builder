import React, { useRef } from 'react';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { heroThreeStyles } from './defaultHeroStyles';
import useElementDrop from '../../../utils/useElementDrop';

import { Heading, Paragraph, Button, Image, Span} from '../../SelectableElements';

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

  // Extract elements or fallback to default structure
  const caption = children?.find((child) => child.type === 'span') || heroThree.children[0];
  const title = children?.find((child) => child.type === 'heading') || heroThree.children[1];
  const description = children?.find((child) => child.type === 'paragraph') || heroThree.children[2];
  const primaryButton = children?.find((child) => child.type === 'button' && child.content === 'Primary Action') || heroThree.children[3];
  const secondaryButton = children?.find((child) => child.type === 'button' && child.content === 'Secondary Action') || heroThree.children[4];
  const image = children?.find((child) => child.type === 'image') || heroThree.children[5];

  return (
    <section
      ref={(node) => {
        heroRef.current = node;
        drop(node);
      }}
      style={isOverCurrent ? { ...heroThreeStyles.heroSection, outline: '2px dashed #4D70FF' } : heroThreeStyles.heroSection}
      onClick={(e) => handleSelect(e)}
    >
      <div style={heroThreeStyles.heroContent}>
        {caption && (
          <Span
            id={caption.id || `caption-${uniqueId}`}
            content={caption.content}
            styles={mergeStyles(heroThreeStyles.caption)}
          />
        )}

        {title && (
          <Heading
            id={title.id || `title-${uniqueId}`}
            content={title.content}
            styles={mergeStyles(heroThreeStyles.heroTitle)}
          />
        )}

        {description && (
          <Paragraph
            id={description.id || `description-${uniqueId}`}
            content={description.content}
            styles={mergeStyles(heroThreeStyles.heroDescription)}
          />
        )}

        <div style={heroThreeStyles.buttonContainer}>
          {primaryButton && (
            <Button
              id={primaryButton.id || `primary-button-${uniqueId}`}
              content={primaryButton.content}
              styles={mergeStyles(heroThreeStyles.primaryButton)}
            />
          )}
          {secondaryButton && (
            <Button
              id={secondaryButton.id || `secondary-button-${uniqueId}`}
              content={secondaryButton.content}
              styles={mergeStyles(heroThreeStyles.secondaryButton)}
            />
          )}
        </div>
      </div>

      {image && (
        <div style={heroThreeStyles.heroImageContainer}>
          <Image
            id={image.id || `image-${uniqueId}`}
            src={image.content}
            styles={mergeStyles(heroThreeStyles.heroImage)}
            handleOpenMediaPanel={handleOpenMediaPanel}
          />
        </div>
      )}
    </section>
  );
};

export default HeroThree;
