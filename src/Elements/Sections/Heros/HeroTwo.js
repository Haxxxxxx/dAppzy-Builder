import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const HeroTwo = ({ uniqueId }) => (
  <section style={{
    backgroundColor: '#6B7280',
    color: '#fff',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }}>
    <Span id={`${uniqueId}-hero-title`} content="Discover Your Potential" styles={{ fontSize: '3rem', fontWeight: 'bold' }} />
    <Span id={`${uniqueId}-hero-subtitle`} content="Join us today and start making an impact." styles={{ marginTop: '20px', fontSize: '1.5rem' }} />
    <Button id={`${uniqueId}-hero-button`} content="Join Now" styles={{ marginTop: '30px', backgroundColor: '#1F2937', padding: '12px 24px', border: 'none', color: '#fff' }} />
  </section>
);

export default HeroTwo;
