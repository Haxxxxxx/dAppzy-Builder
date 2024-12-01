import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const HeroTwo = ({ children }) => {
  // Dynamically find child elements by type
  const title = children?.find((child) => child.type === 'span' && child.content?.includes('Hero Title'));
  const subtitle = children?.find((child) => child.type === 'span' && child.content?.includes('Hero Subtitle'));
  const button = children?.find((child) => child.type === 'button');

  // Display warnings if critical children are missing
  if (!title || !subtitle || !button) {
    console.warn(`HeroTwo is missing required children:`, { title, subtitle, button });
    return <div style={{ color: 'red' }}>Incomplete Hero Section</div>;
  }
  
  return (
    <section
      style={{
        backgroundColor: '#6B7280',
        color: '#fff',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {title && <Span id={title.id} content={title.content} styles={title.styles} />}
      {subtitle && <Span id={subtitle.id} content={subtitle.content} styles={subtitle.styles} />}
      {button && <Button id={button.id} content={button.content} styles={button.styles} />}
    </section>
  );
};

export default HeroTwo;
