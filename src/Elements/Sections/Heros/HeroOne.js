import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';

const HeroOne = ({ uniqueId }) => (
  <section style={{
    backgroundColor: '#282c34',
    color: '#ffffff',
    padding: '40px',
    textAlign: 'center',
  }}>
    <Image
      id={`${uniqueId}-background`}
      src="background-image-url"
      styles={{ width: '100%', height: 'auto', position: 'absolute', top: 0, left: 0 }}
    />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Span id={`${uniqueId}-hero-title`} content="Welcome to Our Website" styles={{ fontSize: '2.5rem', fontWeight: 'bold' }} />
      <Span id={`${uniqueId}-hero-subtitle`} content="Building a better future together." styles={{ margin: '16px 0', fontSize: '1.25rem' }} />
      <Button id={`${uniqueId}-hero-button`} content="Get Started" styles={{ marginTop: '24px', padding: '10px 20px' }} />
    </div>
  </section>
);

export default HeroOne;
