// src/Elements/Structures/Navbars/TwoColumnNavbar.js

import React, { useRef, useState, useEffect, useContext } from 'react';
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

const TwoColumnNavbar = ({
  id,
  children,
  onDropItem,
  contentListWidth,
  handlePanelToggle,
}) => {
  const navRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { elements } = useContext(EditableContext);
  const navbarElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = navbarElement;

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id,
    elementRef: navRef,
    onDropItem,
  });

  useEffect(() => {
    setIsCompact(contentListWidth < 768); // Adjust breakpoint
  }, [contentListWidth]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

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
    >
      {/* Logo */}
      <div style={defaultNavbarStyles.logoContainer} className="navbar-logo-container">
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
              <SelectableImage id={child.id} styles={{ ...child.styles, width: '40px', height: '40px' }} />
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
        <div style={defaultNavbarStyles.standardMenuContainer} className="navbar-standard-menu-container">
          <ul style={defaultNavbarStyles.navList} className="navbar-nav-list">
            {children
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <>
                  <SelectableSpan id={child.id} content={child.content} />
                </>
              ))}
          </ul>

          <div style={defaultNavbarStyles.buttonContainer} className="navbar-button-container">
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

export default TwoColumnNavbar;
