import React, { useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';

const HeroOne = ({ uniqueId, children }) => {
  const { findElementById } = useContext(EditableContext);

  // Retrieve children elements
  const backgroundImage = children?.find((child) => child.id === `${uniqueId}-background`);
  const heroTitle = children?.find((child) => child.id === `${uniqueId}-hero-title`);
  const heroSubtitle = children?.find((child) => child.id === `${uniqueId}-hero-subtitle`);
  const heroButton = children?.find((child) => child.id === `${uniqueId}-hero-button`);

  // Avoid rendering if any critical child is missing configuration
  if (!heroTitle || !heroSubtitle || !heroButton) {
    console.warn(`HeroOne component with ID ${uniqueId} is missing critical children.`);
    return null;
  }

  return (
    <section
      style={{
        backgroundColor: '#282c34',
        color: '#ffffff',
        padding: '40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <Image
          id={backgroundImage.id}
          src={backgroundImage.content || 'background-image-url'}
          styles={{
            width: '100%',
            height: 'auto',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        />
      )}

      {/* Hero Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Hero Title */}
        <Span
          id={heroTitle.id}
          content={heroTitle.content || 'Welcome to Our Website'}
          styles={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        />

        {/* Hero Subtitle */}
        <Span
          id={heroSubtitle.id}
          content={heroSubtitle.content || 'Building a better future together.'}
          styles={{
            margin: '16px 0',
            fontSize: '1.25rem',
          }}
        />

        {/* Hero Button */}
        <Button
          id={heroButton.id}
          content={heroButton.content || 'Get Started'}
          styles={{
            marginTop: '24px',
            padding: '10px 20px',
            backgroundColor: '#61dafb',
            border: 'none',
            color: '#000',
            borderRadius: '4px',
          }}
        />
      </div>
    </section>
  );
};

export default HeroOne;
