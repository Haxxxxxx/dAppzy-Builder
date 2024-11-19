import React, { useState, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const CustomTemplateNavbar = ({ uniqueId, contentListWidth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  console.log('Current contentListWidth:', contentListWidth);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Update isCompact state based on contentListWidth
  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust the breakpoint to fit your needs
    }
  }, [contentListWidth]);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#ffffff',
      flexWrap: 'wrap',
      position: 'relative',
    }}>
      {/* Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          id={`${uniqueId}-logo`}
          src="http://bafybeiar3s4oejrrcgzsghcdiupg5ey62rkfs5db6dzc6wj32yaymu6fiq.ipfs.localhost:8080"
          styles={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
        <Span id={`${uniqueId}-title`} content="3S.Template" styles={{ marginLeft: '8px', fontSize: '1.5rem' }} />
      </div>

      {/* Hamburger Menu Icon for Compact View */}
      {isCompact && (
        <div
          style={{
            display: 'flex',
            cursor: 'pointer',
            marginLeft: 'auto',
            fontSize: '1.5rem',
            color: '#000',
          }}
          onClick={toggleMenu}
        >
          ☰
        </div>
      )}

      {/* Links and Buttons - Compact Menu */}
      {isCompact && isMenuOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          marginTop: '16px',
          backgroundColor: '#ffffff',
          padding: '16px',
          position: 'absolute',
          top: '100%',
          left: '0',
          zIndex: '10',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <Span id={`${uniqueId}-link1`} content="Link" />
          <Span id={`${uniqueId}-link2`} content="Link" />
          <Span id={`${uniqueId}-link3`} content="Link" />
          <Span id={`${uniqueId}-link4`} content="Link" />
          <Button
            id={`${uniqueId}-button1`}
            content="Button Text"
            styles={{
              border: 'none',
              padding: '12px 20px',
              height: 'auto',
              fontFamily: 'Roboto, sans-serif',
              width: '100%',
            }}
          />
          <Button
            id={`${uniqueId}-button2`}
            content="Button Text"
            styles={{
              backgroundColor: 'var(--dark-grey, #334155)',
              color: '#fff',
              padding: '12px 20px',
              border: 'none',
              height: 'auto',
              fontFamily: 'Roboto, sans-serif',
              width: '100%',
            }}
          />
        </div>
      )}

      {/* Desktop Links and Buttons */}
      {!isCompact && (
        <>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            color: 'var(--CoolGray-90, #21272A)',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '100%',
            marginTop: '0',
          }}>
            <Span id={`${uniqueId}-link1`} content="Link" />
            <Span id={`${uniqueId}-link2`} content="Link" />
            <Span id={`${uniqueId}-link3`} content="Link" />
            <Span id={`${uniqueId}-link4`} content="Link" />
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '0',
          }}>
            <Button
              id={`${uniqueId}-button1`}
              content="Button Text"
              styles={{
                border: 'none',
                padding: '16px 28px',
                height: '48px',
                fontFamily: 'Roboto, sans-serif',
              }}
            />
            <Button
              id={`${uniqueId}-button2`}
              content="Button Text"
              styles={{
                backgroundColor: 'var(--dark-grey, #334155)',
                color: '#fff',
                padding: '16px 28px',
                border: 'none',
                height: '48px',
                fontFamily: 'Roboto, sans-serif',
              }}
            />
          </div>
        </>
      )}
    </nav>
  );
};

export default CustomTemplateNavbar;
