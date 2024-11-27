import React, { useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const HeroTwo = ({ uniqueId, children }) => {
  const { findElementById, elements } = useContext(EditableContext);

  // Find relevant child elements
  const title = children?.find((child) => child.id === `${uniqueId}-hero-title`);
  const subtitle = children?.find((child) => child.id === `${uniqueId}-hero-subtitle`);
  const button = children?.find((child) => child.id === `${uniqueId}-hero-button`);

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
