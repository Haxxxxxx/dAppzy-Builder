import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import withSelectable from '../../../utils/withSelectable';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const CTATwo = ({ uniqueId, children }) => {
  const titleChild = children?.find((child) => child.id === `${uniqueId}-cta-title`);
  const primaryButton = children?.find((child) => child.id === `${uniqueId}-primary-button`);
  const secondaryButton = children?.find((child) => child.id === `${uniqueId}-secondary-button`);

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
      }}
    >
      {titleChild && (
        <SelectableSpan
          id={titleChild.id}
          content={titleChild.content}
          styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}
        />
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        {primaryButton && (
          <SelectableButton
            id={primaryButton.id}
            content={primaryButton.content}
            styles={{
              padding: '12px 24px',
              backgroundColor: '#1a1aff',
              color: '#ffffff',
              fontWeight: 'bold',
              border: 'none',
            }}
          />
        )}
        {secondaryButton && (
          <SelectableButton
            id={secondaryButton.id}
            content={secondaryButton.content}
            styles={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#1a1aff',
              border: '2px solid #1a1aff',
              fontWeight: 'bold',
            }}
          />
        )}
      </div>
    </section>
  );
};

export default CTATwo;
