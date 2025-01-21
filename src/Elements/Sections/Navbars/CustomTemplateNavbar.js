import React, { useRef, useState, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import ConnectWalletButton from '../Web3Related/ConnectWalletButton';
import useElementDrop from '../../../utils/useElementDrop';
import { CustomTemplateNavbarStyles } from './DefaultNavbarStyles';
import withSelectable from '../../../utils/withSelectable';
import { saveToLocalStorage } from '../../../utils/LeftBarUtils/storageUtils';
const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);
const SelectableConnectWalletButton = withSelectable(ConnectWalletButton);

const CustomTemplateNavbar = ({ uniqueId, contentListWidth, children, onDropItem, handleOpenMediaPanel }) => {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  useEffect(() => {
    setIsCompact(contentListWidth < 768); // Adjust breakpoint
  }, [contentListWidth]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const navbarData = {
      id: uniqueId,
      type: 'navbar',
      styles: CustomTemplateNavbarStyles.nav,
      children: children.map((child) => ({
        id: child.id,
        type: child.type,
        content: child.content,
        styles: child.styles,
      })),
    };
    saveToLocalStorage(uniqueId, navbarData);
  }, [children, uniqueId]);
  
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
        ...CustomTemplateNavbarStyles.nav, // Apply specific styles
      }}
    >
      {/* Logo and Title */}
      <div style={{ ...CustomTemplateNavbarStyles.logoContainer }}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <SelectableImage
              key={child.id}
              id={child.id}
              src={child.content || 'Default Logo'}
              styles={{
                ...child.styles,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
              }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={handleImageDrop}
            />
          ))}
        {children
          .filter((child) => child?.type === 'span' && child?.content === '3S.Template')
          .map((child) => (
            <SelectableSpan
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...child.styles,
                cursor: 'pointer',
              }}            />
          ))}
      </div>

      {/* Compact Menu */}
      {isCompact && (
        <>
          <div
            style={{
              ...CustomTemplateNavbarStyles.compactMenuIcon,
            }}
            onClick={toggleMenu}
          >
            ☰
          </div>
          {isMenuOpen && (
            <div
              style={{
                ...CustomTemplateNavbarStyles.compactMenu,
              }}
            >
              {children
                .filter((child) => child?.type === 'span' && child?.content !== '3S.Template')
                .map((child) => (
                  <SelectableSpan
                    key={child.id}
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      cursor: 'pointer',
                    }}                  />
                ))}
              {children
                .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton')
                .map((child) => (
                  <>
                    {child.type === 'connectWalletButton' ? (
                      <SelectableConnectWalletButton
                        key={child.id}
                        id={child.id}
                        content={child.content}
                        styles={{
                          ...child.styles,
                          cursor: 'pointer',
                        }}                      />
                    ) : (
                      <SelectableButton
                        key={child.id}
                        id={child.id}
                        content={child.content}
                        styles={{
                          ...child.styles,
                          cursor: 'pointer',
                        }}                      />
                    )}
                  </>
                ))}
            </div>
          )}
        </>
      )}

      {/* Desktop Links and Buttons */}
      {!isCompact && (
        <>
          <div style={{ ...CustomTemplateNavbarStyles.standardMenuContainer }}>
            {children
              .filter((child) => child?.type === 'span' && child?.content !== '3S.Template')
              .map((child) => (
                <SelectableSpan
                  key={child.id}
                  id={child.id}
                  content={child.content}
                  styles={{
                    ...child.styles,
                    cursor: 'pointer',
                  }}
                />
              ))}

          </div>

          <div style={{ ...CustomTemplateNavbarStyles.buttonContainer }}>
            {children
              .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton')
              .map((child) => (
                <>
                  {child.type === 'connectWalletButton' ? (
                    <SelectableConnectWalletButton
                      key={child.id}
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                    />
                  ) : (
                    <SelectableButton
                      key={child.id}
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                        border: 'none',
                        padding: '10px 20px',
                        backgroundColor: child.styles?.backgroundColor || '#334155',
                        color: child.styles?.color || '#fff',
                      }}
                    />
                  )}
                </>
              ))}
          </div>
        </>
      )}
    </nav>
  );
};

export default CustomTemplateNavbar;

