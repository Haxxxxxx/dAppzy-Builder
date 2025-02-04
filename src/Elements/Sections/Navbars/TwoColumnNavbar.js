import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultNavbarStyles } from './DefaultNavbarStyles';


const TwoColumnNavbar = ({
  id,
  children,
  onDropItem,
  contentListWidth,
  handleOpenMediaPanel,
  handleSelect
}) => {
  const navRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { elements } = useContext(EditableContext);
  const navbarElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = navbarElement;

  const { isOverCurrent, drop } = useElementDrop({
    id,
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
        ...styles, // Merge navbar's styles from state
      }}
      onClick={(e) => handleSelect(e)}  // if you need the event explicitly
    >
      {/* Logo */}
      <div style={defaultNavbarStyles.logoContainer} className="navbar-logo-container">
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <Image
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
          <div style={defaultNavbarStyles.compactMenuIcon} onClick={toggleMenu} className="navbar-compact-menu-icon">
            ☰
          </div>
          {isMenuOpen && (
            <div style={defaultNavbarStyles.compactMenu} className="navbar-compact-menu">
              {children.map((child) => (
                <>
                  {child.type === 'span' && <Span id={child.id} content={child.content} />}
                  {child.type === 'button' && <Button id={child.id} content={child.content} />}
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
        <div style={defaultNavbarStyles.standardMenuContainer} className="navbar-standard-menu-container">
          <ul style={defaultNavbarStyles.navList} className="navbar-nav-list">
            {children
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <Span key={child.id} id={child.id} content={child.content} />
              ))}
          </ul>

          <div style={defaultNavbarStyles.buttonContainer} className="navbar-button-container">
            {children
              .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton')
              .map((child) => (
                <>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton id={child.id} content={child.content} styles={child.styles} />
                  ) : (
                    <Button id={child.id} content={child.content} />
                  )}
                </>
              ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default TwoColumnNavbar;
