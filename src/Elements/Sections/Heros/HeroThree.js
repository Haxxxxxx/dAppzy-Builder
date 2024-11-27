// HeroThree.js
import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';

const HeroThree = ({ uniqueId, children }) => (
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
      <Span
        id={`${uniqueId}-caption`}
        content={children?.find((child) => child.id === `${uniqueId}-caption`)?.content || 'CAPTION'}
        styles={{
          fontWeight: 'bold',
          color: '#334155',
          marginBottom: '8px',
          display: 'block',
        }}
      />
      <Span
        id={`${uniqueId}-hero-title`}
        content={
          children?.find((child) => child.id === `${uniqueId}-hero-title`)?.content ||
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum amet at molestie mattis.'
        }
        styles={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}
      />
      <Span
        id={`${uniqueId}-hero-description`}
        content={
          children?.find((child) => child.id === `${uniqueId}-hero-description`)?.content ||
          'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.'
        }
        styles={{
          fontSize: '1rem',
          lineHeight: '1.5',
          marginBottom: '24px',
        }}
      />
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          id={`${uniqueId}-primary-button`}
          content={children?.find((child) => child.id === `${uniqueId}-primary-button`)?.content || 'Primary Action'}
          styles={{
            backgroundColor: '#334155',
            color: '#ffffff',
            padding: '12px 24px',
            fontWeight: 'bold',
            border: 'none',
          }}
        />
        <Button
          id={`${uniqueId}-secondary-button`}
          content={children?.find((child) => child.id === `${uniqueId}-secondary-button`)?.content || 'Secondary Action'}
          styles={{
            backgroundColor: 'transparent',
            color: '#334155',
            padding: '12px 24px',
            border: '2px solid #334155',
            fontWeight: 'bold',
          }}
        />
      </div>
    </div>
    <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px', textAlign: 'center', marginTop: '20px' }}>
      <Image
        id={`${uniqueId}-hero-image`}
        styles={{
          maxWidth: '100%',
          height: '400px',
          backgroundColor: '#334155',
        }}
      />
    </div>
  </section>
);

export default HeroThree;
