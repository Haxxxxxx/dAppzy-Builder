import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { CustomTemplateNavbarStyles } from './DefaultNavbarStyles';
import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';

const CustomTemplateNavbar = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  label,
}) => {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // 1) Access elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  // 2) Find the Navbar element in the global state by its ID
  const navbarElement = elements.find((el) => el.id === uniqueId);

  // 3) Apply default styles only if we detect an empty `styles` object
  useEffect(() => {
    if (!navbarElement) return;
    const noCustomStyles =
      !navbarElement.styles || Object.keys(navbarElement.styles).length === 0;

    if (noCustomStyles) {
      // This merges your custom defaults into element.styles and saves them
      updateStyles(navbarElement.id, {
        ...CustomTemplateNavbarStyles.nav,
      });
    }
  }, [navbarElement, updateStyles]);

  useEffect(() => {
    setIsCompact(contentListWidth < 768); // Breakpoint logic
  }, [contentListWidth]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  if (!navbarElement) {
    return null; // Don't render if navbar element is not found
  }

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        ...CustomTemplateNavbarStyles.nav,
        ...(navbarElement?.styles || {}),
      }}
      onClick={(e) => handleSelect(e)}
      className="custom-template-navbar"
    >
      {/* Logo and Title */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          flex: '0 1 auto',
          minWidth: 'fit-content'
        }} 
        className="navbar-logo-container"
      >
        {children?.[0]?.type === 'image' && (
          <Image
            key={children[0].id}
            id={children[0].id}
            src={children[0].content || 'Default Logo'}
            styles={{
              ...children[0].styles,
              width: '100%',
              maxWidth: '40px',
              height: '40px',
              objectFit: 'cover',
              borderRadius: '4px',
              aspectRatio: '1/1',
              flex: '0 0 auto',
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
            settings={children[0].settings || {}}
            className="navbar-logo"
          />
        )}
        {children?.[1]?.type === 'span' && (
          <Span
            key={children[1].id}
            id={children[1].id}
            content={children[1].content}
            styles={{
              ...children[1].styles,
              cursor: 'pointer',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              flex: '0 1 auto',
              whiteSpace: 'nowrap',
            }}
            className="navbar-title"
          />
        )}
      </div>

      {/* Compact Menu */}
      {isCompact && (
        <>
          <div
            style={{
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '0.5rem',
              flex: '0 0 auto',
            }}
            onClick={toggleMenu}
            className="navbar-compact-menu-icon"
          >
            ☰
          </div>
          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                zIndex: 1000,
              }}
              className="navbar-compact-menu"
            >
              {children?.slice(2)
                .filter((child) => child?.type === 'span')
                .map((child, index) => (
                  <Span
                    key={`span-${child.id}-${index}`}
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      cursor: 'pointer',
                      padding: '0.5rem',
                      flex: '0 0 auto',
                    }}
                    className="navbar-link"
                  />
                ))}
              {children?.slice(2)
                .filter(
                  (child) =>
                    child?.type === 'button' || child?.type === 'connectWalletButton'
                )
                .map((child, index) => (
                  <React.Fragment key={`button-container-${child.id}-${index}`}>
                    {child.type === 'connectWalletButton' ? (
                      <ConnectWalletButton
                        key={`wallet-${child.id}-${index}`}
                        id={child.id}
                        content={child.content}
                        styles={{
                          ...child.styles,
                          cursor: 'pointer',
                          padding: '0.5rem',
                          flex: '0 0 auto',
                        }}
                        className="navbar-connect-wallet"
                      />
                    ) : (
                      <Button
                        key={`button-${child.id}-${index}`}
                        id={child.id}
                        content={child.content}
                        styles={{
                          ...child.styles,
                          cursor: 'pointer',
                          padding: '0.5rem',
                          flex: '0 0 auto',
                        }}
                        className="navbar-button"
                      />
                    )}
                  </React.Fragment>
                ))}
            </div>
          )}
        </>
      )}

      {/* Regular Menu */}
      {!isCompact && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flex: '1 1 auto',
            justifyContent: 'flex-end',
          }}
          className="navbar-menu"
        >
          {children?.slice(2)
            .filter((child) => child?.type === 'span')
            .map((child, index) => (
              <Span
                key={`span-${child.id}-${index}`}
                id={child.id}
                content={child.content}
                styles={{
                  ...child.styles,
                  cursor: 'pointer',
                  padding: '0.5rem',
                  flex: '0 0 auto',
                }}
                className="navbar-link"
              />
            ))}
          {children?.slice(2)
            .filter(
              (child) =>
                child?.type === 'button' || child?.type === 'connectWalletButton'
            )
            .map((child, index) => (
              <React.Fragment key={`button-container-${child.id}-${index}`}>
                {child.type === 'connectWalletButton' ? (
                  <ConnectWalletButton
                    key={`wallet-${child.id}-${index}`}
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      cursor: 'pointer',
                      padding: '0.5rem',
                      flex: '0 0 auto',
                    }}
                    className="navbar-connect-wallet"
                  />
                ) : (
                  <Button
                    key={`button-${child.id}-${index}`}
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      cursor: 'pointer',
                      padding: '0.5rem',
                      flex: '0 0 auto',
                    }}
                    className="navbar-button"
                  />
                )}
              </React.Fragment>
            ))}
        </div>
      )}
    </nav>
  );
};

export default CustomTemplateNavbar;
