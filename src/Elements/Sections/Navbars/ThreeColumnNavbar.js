import React, { useRef, useState, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import ConnectWalletButton from '../Web3Related/ConnectWalletButton'; // Import ConnectWalletButton
import useElementDrop from '../../../utils/useElementDrop';
import RemovableWrapper from '../../../utils/RemovableWrapper';

const ThreeColumnNavbar = ({ uniqueId, children, onDropItem, contentListWidth }) => {
  const navRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  useEffect(() => {
    setIsCompact(contentListWidth < 768); // Adjust breakpoint as needed
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
      {/* Logo Section */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <RemovableWrapper key={child.id} id={child.id}>
              <Image id={child.id} styles={{ ...child.styles, width: '40px', height: '40px' }} />
            </RemovableWrapper>
          ))}
      </div>

      {/* Compact Menu */}
      {isCompact && (
        <>
          <div style={{ cursor: 'pointer' }} onClick={toggleMenu}>
            ☰
          </div>
          {isMenuOpen && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '16px',
                backgroundColor: '#fff',
                width: '100%',
                position: 'absolute',
                top: '100%',
                left: 0,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                padding: '16px',
              }}
            >
              {children.map((child) => (
                <RemovableWrapper key={child.id} id={child.id}>
                  {child.type === 'span' && <Span id={child.id} content={child.content} />}
                  {child.type === 'button' && <Button id={child.id} content={child.content} />}
                  {child.type === 'connectWalletButton' && (
                    <ConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                  )}
                </RemovableWrapper>
              ))}
            </div>
          )}
        </>
      )}

      {/* Standard Menu */}
      {!isCompact && (
        <>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '16px', padding: 0, margin: 0 }}>
            {children
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <RemovableWrapper key={child.id} id={child.id}>
                  <Span id={child.id} content={child.content} />
                </RemovableWrapper>
              ))}
          </ul>

          <div style={{ display: 'flex', gap: '16px' }}>
            {children
              .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton')
              .map((child) => (
                <RemovableWrapper key={child.id} id={child.id}>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                  ) : (
                    <Button id={child.id} content={child.content} />
                  )}
                </RemovableWrapper>
              ))}
          </div>
        </>
      )}
    </nav>
  );
};

export default ThreeColumnNavbar;
