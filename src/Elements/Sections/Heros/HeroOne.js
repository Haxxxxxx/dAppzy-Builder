import React, { useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';

const HeroOne = ({ uniqueId, children }) => {
  const backgroundImage = children.find((child) => child.type === 'image');
  const heroTitle = children.find((child) => child.type === 'span' && child.content === 'Welcome to Our Website');
  const heroSubtitle = children.find((child) => child.type === 'span' && child.content === 'Building a better future together.');
  const heroButton = children.find((child) => child.type === 'button');

  if (!backgroundImage || !heroTitle || !heroSubtitle || !heroButton) {
    console.warn(`HeroOne component with ID ${uniqueId} is missing critical children.`, { backgroundImage, heroTitle, heroSubtitle, heroButton });
    return <div style={{ color: 'red' }}>Incomplete Hero Section</div>; // Display fallback
  }

  return (
    <section style={{ backgroundColor: '#282c34', color: '#ffffff', padding: '40px', textAlign: 'center', display:'flex', alignItems:'center',flexDirection:'column' }}>
      {backgroundImage && <Image id={backgroundImage.id} content={backgroundImage.content} />}
      {heroTitle && <Span id={heroTitle.id} content={heroTitle.content} />}
      {heroSubtitle && <Span id={heroSubtitle.id} content={heroSubtitle.content} />}
      {heroButton && <Button id={heroButton.id} content={heroButton.content} />}
    </section>
  );
};

export default HeroOne;
