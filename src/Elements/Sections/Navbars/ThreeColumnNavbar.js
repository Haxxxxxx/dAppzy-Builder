import React, { useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import ConnectWalletButton from '../Web3Related/ConnectWalletButton';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultNavbarStyles } from './DefaultNavbarStyles';
import withSelectable from '../../../utils/withSelectable';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);
const SelectableConnectWalletButton = withSelectable(ConnectWalletButton);

const ThreeColumnNavbar = ({ uniqueId, children, onDropItem, contentListWidth, handleOpenMediaPanel }) => {
  const navRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  useEffect(() => {
    setIsCompact(contentListWidth < 768); // Adjust breakpoint
  }, [contentListWidth]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src); // Update the image's content dynamically
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
    >
      {/* Logo Section */}
      <div style={defaultNavbarStyles.logoContainer}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <SelectableImage
              key={child.id}
              id={child.id}
              src={child.content || 'Default Logo'}
              styles={{ ...child.styles, width: '40px', height: '40px' }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={handleImageDrop}
            />
          ))}
      </div>

      {/* Compact Menu */}
      {isCompact && (
        <>
          <div style={defaultNavbarStyles.compactMenuIcon} onClick={toggleMenu}>
            ☰
          </div>
          {isMenuOpen && (
            <div style={defaultNavbarStyles.compactMenu}>
              {children.map((child) => (
                <>
                  {child.type === 'span' && <SelectableSpan id={child.id} content={child.content} />}
                  {child.type === 'button' && <SelectableButton id={child.id} content={child.content} />}
                  {child.type === 'connectWalletButton' && (
                    <SelectableConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                  )}
                </>
              ))}
            </div>
          )}
        </>
      )}

      {/* Standard Menu */}
      {!isCompact && (
        <div style={defaultNavbarStyles.standardMenuContainer}>
          <ul style={defaultNavbarStyles.navList}>
            {children
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <SelectableSpan key={child.id} id={child.id} content={child.content} />
              ))}
          </ul>

          <div style={defaultNavbarStyles.buttonContainer}>
            {children
              .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton')
              .map((child) => (
                <>
                  {child.type === 'connectWalletButton' ? (
                    <SelectableConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                  ) : (
                    <SelectableButton id={child.id} content={child.content} />
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
