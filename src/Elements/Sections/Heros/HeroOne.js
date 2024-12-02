import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import RemovableWrapper from '../../../utils/RemovableWrapper';

const HeroOne = ({ uniqueId, children }) => {
  // Find children or set defaults
  const backgroundImage = children.find((child) => child.type === 'image') || {
    id: `placeholder-image-${uniqueId}`,
    content: '/placeholder-image.png',
  };

  const heroTitle = children.find((child) => child.type === 'span' && child.content === 'Welcome to Our Website') || {
    id: `placeholder-title-${uniqueId}`,
    content: 'Welcome to Our Website',
  };

  const heroSubtitle = children.find((child) => child.type === 'span' && child.content === 'Building a better future together.') || {
    id: `placeholder-subtitle-${uniqueId}`,
    content: 'Building a better future together.',
  };

  const heroButton = children.find((child) => child.type === 'button') || {
    id: `placeholder-button-${uniqueId}`,
    content: 'Learn More',
  };

  return (
    <section
      style={{
        backgroundColor: '#282c34',
        color: '#ffffff',
        padding: '40px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Background Image */}
      <RemovableWrapper id={backgroundImage.id}>
        <Image id={backgroundImage.id} content={backgroundImage.content} />
      </RemovableWrapper>

      {/* Hero Title */}
      <RemovableWrapper id={heroTitle.id}>
        <Span id={heroTitle.id} content={heroTitle.content} />
      </RemovableWrapper>

      {/* Hero Subtitle */}
      <RemovableWrapper id={heroSubtitle.id}>
        <Span id={heroSubtitle.id} content={heroSubtitle.content} />
      </RemovableWrapper>

      {/* Hero Button */}
      <RemovableWrapper id={heroButton.id}>
        <Button id={heroButton.id} content={heroButton.content} />
      </RemovableWrapper>
    </section>
  );
};

export default HeroOne;
