import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import RemovableWrapper from '../../../utils/RemovableWrapper';

const HeroThree = ({ children, onDropItem }) => {
  // Dynamically resolve children elements
  const caption = children?.find((child) => child.type === 'span' && child.content?.includes('CAPTION'));
  const heroTitle = children?.find((child) => child.type === 'span' && child.content?.includes('Lorem ipsum'));
  const heroDescription = children?.find((child) => child.type === 'span' && child.content?.includes('Rhoncus morbi'));
  const primaryButton = children?.find((child) => child.type === 'button' && child.content?.includes('Primary Action'));
  const secondaryButton = children?.find((child) => child.type === 'button' && child.content?.includes('Secondary Action'));
  const heroImage = children?.find((child) => child.type === 'image');

  if (!heroTitle || !heroDescription || !primaryButton || !heroImage) {
    console.warn('HeroThree is missing one or more critical children:', {
      caption,
      heroTitle,
      heroDescription,
      primaryButton,
      secondaryButton,
      heroImage,
    });
    return <div style={{ color: 'red' }}>Incomplete Hero Section</div>; // Fallback message
  }

  return (
    <section
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px', display: 'flex', flexDirection: 'column' }}>
        {caption && (
          <RemovableWrapper id={caption.id}>
            <Span
              id={caption.id}
              content={caption.content}
              styles={{
                fontWeight: 'bold',
                color: '#334155',
                marginBottom: '8px',
                display: 'block',
              }}
            />
          </RemovableWrapper>
        )}
        {heroTitle && (
          <RemovableWrapper id={heroTitle.id}>
            <Span
              id={heroTitle.id}
              content={heroTitle.content}
              styles={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            />
          </RemovableWrapper>
        )}
        {heroDescription && (
          <RemovableWrapper id={heroDescription.id}>
            <Span
              id={heroDescription.id}
              content={heroDescription.content}
              styles={{
                fontSize: '1rem',
                lineHeight: '1.5',
                marginBottom: '24px',
              }}
            />
          </RemovableWrapper>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          {primaryButton && (
            <RemovableWrapper id={primaryButton.id}>
              <Button
                id={primaryButton.id}
                content={primaryButton.content}
                styles={{
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  border: 'none',
                }}
              />
            </RemovableWrapper>
          )}
          {secondaryButton && (
            <RemovableWrapper id={secondaryButton.id}>
              <Button
                id={secondaryButton.id}
                content={secondaryButton.content}
                styles={{
                  backgroundColor: 'transparent',
                  color: '#334155',
                  padding: '12px 24px',
                  border: '2px solid #334155',
                  fontWeight: 'bold',
                }}
              />
            </RemovableWrapper>
          )}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px', textAlign: 'center', marginTop: '20px' }}>
        {heroImage && (
          <RemovableWrapper id={heroImage.id}>
            <Image
              id={heroImage.id}
              styles={{
                maxWidth: '100%',
                height: '400px',
                backgroundColor: '#334155',
              }}
            />
          </RemovableWrapper>
        )}
      </div>
    </section>
  );
};

export default HeroThree;
