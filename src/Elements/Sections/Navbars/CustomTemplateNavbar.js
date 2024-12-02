import React, { useRef, useState, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import ConnectWalletButton from '../Web3Related/ConnectWalletButton'; // Import the ConnectWalletButton
import useElementDrop from '../../../utils/useElementDrop';
import RemovableWrapper from '../../../utils/RemovableWrapper';

const CustomTemplateNavbar = ({ uniqueId, contentListWidth, children, onDropItem }) => {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust the breakpoint as needed
    }
  }, [contentListWidth]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#ffffff',
        flexWrap: 'wrap',
        position: 'relative',
        borderBottom: isOverCurrent ? '2px solid blue' : '1px solid transparent',
        borderRadius: '4px',
      }}
    >
      {/* Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <RemovableWrapper key={child.id} id={child.id}>
              <Image id={child.id} styles={{ ...child.styles, width: '40px', height: '40px', borderRadius: '50%' }} />
            </RemovableWrapper>
          ))}
        {children
          .filter((child) => child?.type === 'span' && child?.content === '3S.Template')
          .map((child) => (
            <RemovableWrapper key={child.id} id={child.id}>
              <Span id={child.id} content={child.content} styles={{ fontSize: '1.5rem', cursor: 'pointer' }} />
            </RemovableWrapper>
          ))}
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
          {children
            .filter((child) => child?.type === 'span' && child?.content !== '3S.Template')
            .map((child) => (
              <RemovableWrapper key={child.id} id={child.id}>
                <Span id={child.id} content={child.content} styles={{ fontSize: '1rem', cursor: 'pointer' }} />
              </RemovableWrapper>
            ))}
          {children
            .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton') // Include ConnectWalletButton
            .map((child) => (
              <RemovableWrapper key={child.id} id={child.id}>
                {child.type === 'connectWalletButton' ? (
                  <ConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                ) : (
                  <Button
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      border: 'none',
                      padding: '12px 20px',
                      fontFamily: 'Roboto, sans-serif',
                      backgroundColor: child.styles?.backgroundColor || '#ffffff',
                      color: child.styles?.color || '#000',
                    }}
                  />
                )}
              </RemovableWrapper>
            ))}
        </div>
      )}

      {/* Desktop Links and Buttons */}
      {!isCompact && (
        <>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {children
              .filter((child) => child?.type === 'span' && child?.content !== '3S.Template')
              .map((child) => (
                <RemovableWrapper key={child.id} id={child.id}>
                  <Span id={child.id} content={child.content} styles={{ fontSize: '1rem', cursor: 'pointer' }} />
                </RemovableWrapper>
              ))}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {children
              .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton') // Include ConnectWalletButton
              .map((child) => (
                <RemovableWrapper key={child.id} id={child.id}>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton id={child.id} content={child.content} styles={child.styles} preventHeroModal={true} // Pass preventHeroModal as true
                    />
                  ) : (
                    <Button
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                        border: 'none',
                        padding: '16px 28px',
                        backgroundColor: child.styles?.backgroundColor || '#334155',
                        color: child.styles?.color || '#fff',
                      }}
                    />
                  )}
                </RemovableWrapper>
              ))}
          </div>
        </>
      )}
    </nav>
  );
};

export default CustomTemplateNavbar;
