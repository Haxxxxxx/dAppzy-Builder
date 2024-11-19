import React, { useEffect, useState } from 'react';
import Span from '../../Texts/Span';
import Image from '../../Media/Image';

const TemplateFooter = ({ uniqueId, contentListWidth }) => {
  const [isCompact, setIsCompact] = useState(false);

  // Update isCompact state based on contentListWidth
  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust the breakpoint as needed
    }
  }, [contentListWidth]);

  return (
    <footer
      style={{
        backgroundColor: '#4B5563',
        color: '#D1D5DB',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: isCompact ? 'center' : 'stretch',
        textAlign: isCompact ? 'center' : 'left',
      }}
    >
      {isCompact ? (
        // Compact Display Layout
        <>
          {/* Links Section */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <Span id={`${uniqueId}-section-1`} content="Eleven" />
            <Span id={`${uniqueId}-section-2`} content="Twelve" />
            <Span id={`${uniqueId}-section-3`} content="Thirteen" />
          </div>

          {/* Logo and Title Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <Image
              id={`${uniqueId}-logo`}
              src="http://bafybeiar3s4oejrrcgzsghcdiupg5ey62rkfs5db6dzc6wj32yaymu6fiq.ipfs.localhost:8080"
              styles={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
            <Span
              id={`${uniqueId}-template-title`}
              content="3S Template"
              styles={{ fontSize: '1rem', fontWeight: 'bold' }}
            />
          </div>

          {/* Social Media Icons */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <Image src="social-youtube-icon.png" styles={{ width: '24px', height: '24px' }} />
            <Image src="social-facebook-icon.png" styles={{ width: '24px', height: '24px' }} />
            <Image src="social-twitter-icon.png" styles={{ width: '24px', height: '24px' }} />
            <Image src="social-instagram-icon.png" styles={{ width: '24px', height: '24px' }} />
            <Image src="social-linkedin-icon.png" styles={{ width: '24px', height: '24px' }} />
          </div>

          {/* Footer Rights Section */}
          <Span
            id={`${uniqueId}-template-rights`}
            content="CompanyName @ 202X. All rights reserved."
            styles={{ fontSize: '0.875rem' }}
          />
        </>
      ) : (
        // Normal Display Layout
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Links Section */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <Span id={`${uniqueId}-section-1`} content="Eleven" />
              <Span id={`${uniqueId}-section-2`} content="Twelve" />
              <Span id={`${uniqueId}-section-3`} content="Thirteen" />
            </div>

            {/* Logo and Title Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <Image
                  id={`${uniqueId}-logo`}
                  src="http://bafybeiar3s4oejrrcgzsghcdiupg5ey62rkfs5db6dzc6wj32yaymu6fiq.ipfs.localhost:8080"
                  styles={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <Span id={`${uniqueId}-template-title`} content="3S Template" styles={{ fontSize: '1.5rem', fontWeight: 'bold' }} />
              </div>
            </div>

            {/* Social Media Icons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Image src="social-youtube-icon.png" styles={{ width: '24px', height: '24px' }} />
              <Image src="social-facebook-icon.png" styles={{ width: '24px', height: '24px' }} />
              <Image src="social-twitter-icon.png" styles={{ width: '24px', height: '24px' }} />
              <Image src="social-instagram-icon.png" styles={{ width: '24px', height: '24px' }} />
              <Image src="social-linkedin-icon.png" styles={{ width: '24px', height: '24px' }} />
            </div>
          </div>

          {/* Footer Rights Section */}
          <Span
            id={`${uniqueId}-template-rights`}
            content="CompanyName @ 202X. All rights reserved."
            styles={{ marginTop: '16px', fontSize: '0.875rem', alignSelf: 'center' }}
          />
        </>
      )}
    </footer>
  );
};

export default TemplateFooter;
