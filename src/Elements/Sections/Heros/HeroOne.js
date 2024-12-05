import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);

const HeroOne = ({ uniqueId, children }) => {
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
        <SelectableImage id={backgroundImage.id} content={backgroundImage.content} />

        <SelectableSpan id={heroTitle.id} content={heroTitle.content} />

        <SelectableSpan id={heroSubtitle.id} content={heroSubtitle.content} />

        <SelectableButton id={heroButton.id} content={heroButton.content} />
    </section>
  );
};

export default HeroOne;
