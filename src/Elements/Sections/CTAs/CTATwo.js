// CTATwo.js
import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const CTATwo = ({ uniqueId }) => (
  <section style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  }}>
    <Span id={`${uniqueId}-cta-title`} content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum amet at molestie mattis." styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }} />
    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
      <Button id={`${uniqueId}-primary-button`} content="Primary Action" styles={{ padding: '12px 24px', backgroundColor: '#1a1aff', color: '#ffffff', fontWeight: 'bold', border: 'none' }} />
      <Button id={`${uniqueId}-secondary-button`} content="Secondary Action" styles={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#1a1aff', border: '2px solid #1a1aff', fontWeight: 'bold' }} />
    </div>
  </section>
);

export default CTATwo;
