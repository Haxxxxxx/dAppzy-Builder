// CTAOne.js
import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const CTAOne = ({ uniqueId }) => (
  <section style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#f8f8f8',
    textAlign: 'center',
  }}>
    <Span id={`${uniqueId}-cta-title`} content="Get Started Today!" styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }} />
    <Span id={`${uniqueId}-cta-description`} content="Sign up now and take the first step towards a better future." styles={{ fontSize: '1rem', marginBottom: '24px' }} />
    <Button id={`${uniqueId}-cta-button`} content="Join Now" styles={{ padding: '12px 24px', backgroundColor: '#1a1aff', color: '#ffffff', fontWeight: 'bold', border: 'none' }} />
  </section>
);

export default CTAOne;
