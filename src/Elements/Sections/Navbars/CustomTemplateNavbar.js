import React, { useState, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const CustomTemplateNavbar = ({ uniqueId, contentListWidth, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Adjust compact mode based on contentListWidth
  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust the breakpoint as needed
    }
  }, [contentListWidth]);

  // Toggle menu visibility in compact mode
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Separate children into categories for rendering
  const logo = children?.find((child) => child.type === 'image');
  const title = children?.find((child) => child.content === '3S.Template'); // Find the title span
  const links = children?.filter(
    (child) => child.type === 'span' && child.content !== '3S.Template' // Exclude the title span
  );
  const buttons = children?.filter((child) => child.type === 'button');

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#ffffff',
        flexWrap: 'wrap',
        position: 'relative',
      }}
    >
      {/* Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {logo && (
          <Image
            id={logo.id}
            src={logo.content || 'default-logo.png'}
            styles={{ width: '40px', height: '40px', borderRadius: '50%' }}
          />
        )}
        {title && (
          <Span
            id={title.id}
            content={title.content}
            styles={{
              marginLeft: '8px',
              fontSize: '1.5rem',
              cursor: 'pointer', // Ensure pointer cursor for better UI feedback
            }}
          />
        )}
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

      {/* Compact Menu */}
      {isCompact && isMenuOpen && (
        <div
          style={{
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
          }}
        >
          {links?.map((link) => (
            <Span
              key={link.id}
              id={link.id}
              content={link.content || 'Link'}
              styles={{ fontSize: '1rem', cursor: 'pointer' }}
            />
          ))}
          {buttons?.map((button) => (
            <Button
              key={button.id}
              id={button.id}
              content={button.content || 'Button'}
              styles={{
                border: 'none',
                padding: '12px 20px',
                height: 'auto',
                fontFamily: 'Roboto, sans-serif',
                width: '100%',
                backgroundColor: button.styles?.backgroundColor || '#ffffff',
                color: button.styles?.color || '#000',
              }}
            />
          ))}
        </div>
      )}

      {/* Desktop Links and Buttons */}
      {!isCompact && (
        <>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              color: 'var(--CoolGray-90, #21272A)',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '100%',
              marginTop: '0',
            }}
          >
            {links?.map((link) => (
              <Span
                key={link.id}
                id={link.id}
                content={link.content || 'Link'}
                styles={{ fontSize: '1rem', cursor: 'pointer' }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '0',
            }}
          >
            {buttons?.map((button) => (
              <Button
                key={button.id}
                id={button.id}
                content={button.content || 'Button'}
                styles={{
                  border: 'none',
                  padding: '16px 28px',
                  height: '48px',
                  fontFamily: 'Roboto, sans-serif',
                  backgroundColor: button.styles?.backgroundColor || '#334155',
                  color: button.styles?.color || '#fff',
                }}
              />
            ))}
          </div>
        </>
      )}
    </nav>
  );
};

export default CustomTemplateNavbar;
