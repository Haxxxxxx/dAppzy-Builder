// src/Elements/Structures/Navbars/ThreeColumnNavbar.js

import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import ConnectWalletButton from '../Web3Related/ConnectWalletButton';
import useElementDrop from '../../../utils/useElementDrop';
import RemovableWrapper from '../../../utils/RemovableWrapper';
import { defaultNavbarStyles } from './DefaultNavbarStyles';

const ThreeColumnNavbar = ({ uniqueId, children, onDropItem, contentListWidth }) => {
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
            <RemovableWrapper key={child.id} id={child.id}>
              <Image id={child.id} styles={{ ...child.styles, width: '40px', height: '40px' }} />
            </RemovableWrapper>
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
        <div style={defaultNavbarStyles.standardMenuContainer}>
          <ul style={defaultNavbarStyles.navList}>
            {children
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <RemovableWrapper key={child.id} id={child.id}>
                  <Span id={child.id} content={child.content} />
                </RemovableWrapper>
              ))}
          </ul>

          <div style={defaultNavbarStyles.buttonContainer}>
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
        </div>
      )}
    </nav>
  );
};

export default ThreeColumnNavbar;
