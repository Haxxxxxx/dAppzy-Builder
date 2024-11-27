import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const CTAOne = ({ uniqueId, children }) => {
  const titleChild = children?.find((child) => child.id === `${uniqueId}-cta-title`);
  const descriptionChild = children?.find((child) => child.id === `${uniqueId}-cta-description`);
  const buttonChild = children?.find((child) => child.id === `${uniqueId}-cta-button`);

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
      {(
        <Span
          id={`${uniqueId}-cta-title`}
          content={titleChild}
          styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}
        />
      )}
      {(
        <Span
          id={`${uniqueId}-cta-description`}
          content={descriptionChild}
          styles={{ fontSize: '1rem', marginBottom: '24px' }}
        />
      )}
      {(
        <Button
          id={`${uniqueId}-cta-button`}
          content={buttonChild}
          styles={{
            padding: '12px 24px',
            backgroundColor: '#1a1aff',
            color: '#ffffff',
            fontWeight: 'bold',
            border: 'none',
          }}
        />
      )}
    </section>
  );
};

export default CTAOne;
