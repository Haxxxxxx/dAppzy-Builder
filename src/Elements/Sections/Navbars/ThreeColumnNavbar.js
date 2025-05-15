// src/components/Elements/Sections/Navbars/ThreeColumnNavbar.js
import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultNavbarStyles } from './DefaultNavbarStyles';

const ThreeColumnNavbar = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  contentListWidth,
  handleOpenMediaPanel,
}) => {
  const navRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        ...defaultNavbarStyles.nav,
        borderBottom: isOverCurrent ? '2px solid blue' : defaultNavbarStyles.nav.borderBottom,
      }}
      onClick={(e) => handleSelect(e)}
    >
      {/* Logo Section */}
      <div style={defaultNavbarStyles.logoContainer}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <Image
              key={child.id}
              id={child.id}
              src={child.content || 'Default Logo'}
              styles={child.styles}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={handleImageDrop}
            />
          ))}
      </div>

      {/* Compact Menu */}
      {isCompact && (
        <>
          <div
            style={defaultNavbarStyles.compactMenuIcon}
            onClick={toggleMenu}
          >
            ☰
          </div>
          {isMenuOpen && (
            <div style={defaultNavbarStyles.compactMenu}>
              {children.map((child) => (
                <>
                  {child.type === 'span' && <Span id={child.id} content={child.content} styles={child.styles} />}
                  {child.type === 'button' && <Button id={child.id} content={child.content} styles={child.styles} />}
                  {child.type === 'connectWalletButton' && (
                    <ConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                  )}
                </>
              ))}
            </div>
          )}
        </>
      )}

      {/* Standard Menu */}
      {!isCompact && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flex: 1,
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '16px'
          }}>
            {children
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />
              ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {children
              .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton')
              .map((child) => (
                <>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                  ) : (
                    <Button id={child.id} content={child.content} styles={child.styles} />
                  )}
                </>
              ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default ThreeColumnNavbar;
