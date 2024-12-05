import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import withSelectable from '../../../utils/withSelectable';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const CTAOne = ({ uniqueId, children = [] }) => {
  const titleChild = children?.find((child) => child.id === `${uniqueId}-cta-title`) || {
    id: `${uniqueId}-cta-title`,
    content: 'Default Title',
    styles: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' },
  };
  const descriptionChild = children?.find((child) => child.id === `${uniqueId}-cta-description`) || {
    id: `${uniqueId}-cta-description`,
    content: 'Default description goes here.',
    styles: { fontSize: '1rem', marginBottom: '24px' },
  };
  const buttonChild = children?.find((child) => child.id === `${uniqueId}-cta-button`) || {
    id: `${uniqueId}-cta-button`,
    content: 'Default Button',
    styles: {
      padding: '12px 24px',
      backgroundColor: '#1a1aff',
      color: '#ffffff',
      fontWeight: 'bold',
      border: 'none',
    },
  };

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#f8f8f8',
        textAlign: 'center',
      }}
    >
      <SelectableSpan
        id={titleChild.id}
        content={titleChild.content}
        styles={titleChild.styles}
      />
      <SelectableSpan
        id={descriptionChild.id}
        content={descriptionChild.content}
        styles={descriptionChild.styles}
      />
      <SelectableButton
        id={buttonChild.id}
        content={buttonChild.content}
        styles={buttonChild.styles}
      />
    </section>
  );
};


export default CTAOne;
