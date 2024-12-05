import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';

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
        {caption && <SelectableSpan id={caption.id} content={caption.content} styles={{ fontWeight: 'bold', color: '#334155', marginBottom: '8px' }} />}
        {heroTitle && <SelectableSpan id={heroTitle.id} content={heroTitle.content} styles={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px' }} />}
        {heroDescription && <SelectableSpan id={heroDescription.id} content={heroDescription.content} styles={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '24px' }} />}
        <div style={{ display: 'flex', gap: '12px' }}>
          {primaryButton && (
            <SelectableButton
              id={primaryButton.id}
              content={primaryButton.content}
              styles={{ backgroundColor: '#334155', color: '#ffffff', padding: '12px 24px', fontWeight: 'bold', border: 'none' }}
            />
          )}
          {secondaryButton && (
            <SelectableButton
              id={secondaryButton.id}
              content={secondaryButton.content}
              styles={{ backgroundColor: 'transparent', color: '#334155', padding: '12px 24px', border: '2px solid #334155', fontWeight: 'bold' }}
            />
          )}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px', textAlign: 'center', marginTop: '20px' }}>
        {heroImage && <SelectableImage handleOpenMediaPanel={handleOpenMediaPanel} id={heroImage.id} styles={{ maxWidth: '100%', height: '400px', backgroundColor: '#334155' }} />}
      </div>
    </section>
  );
};

export default HeroThree;
