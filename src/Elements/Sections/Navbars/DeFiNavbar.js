import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
  import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';

const DeFiNavbar = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const { elements, updateStyles } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  const navbarElement = elements.find((el) => el.id === uniqueId);

  useEffect(() => {
    if (!navbarElement) return;
    const noCustomStyles = !navbarElement.styles || Object.keys(navbarElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(navbarElement.id, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        borderBottom: '1px solid #e5e7eb'
      });
    }
  }, [navbarElement, updateStyles]);

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
        ...(navbarElement?.styles || {}),
        borderBottom: isOverCurrent ? '2px solid blue' : '1px solid transparent',
      }}
      onClick={(e) => handleSelect(e)}
    >
      {/* Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {children.slice(0, 2).map((child) => (
          <React.Fragment key={child.id}>
            {child.type === 'image' && (
              <div style={{ position: 'relative', boxSizing: 'border-box' }}>
                <img
                  src={child.content}
                  alt="Logo"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
            {child.type === 'span' && (
              <Span
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  marginLeft: '12px',
                }}
              >
                {child.content}
              </Span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Connect Wallet Button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {children.slice(2).map((child) => (
          <React.Fragment key={child.id}>
            {child.type === 'connectWalletButton' && (
              <ConnectWalletButton
                id={child.id}
                content={child.content}
                styles={{
                  ...child.styles,
                  marginLeft: 'auto',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Compact Menu */}
      {isCompact && (
        <>
          <div
            style={{
              cursor: 'pointer',
              fontSize: '24px',
            }}
            onClick={toggleMenu}
          >
            ☰
          </div>
          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#1a1a1a',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                zIndex: 1000,
              }}
            >
              {children.slice(2).map((child) => (
                <React.Fragment key={child.id}>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      )}

      {/* Desktop Menu */}
      {!isCompact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {children.slice(2).map((child) => (
            <React.Fragment key={child.id}>
              {child.type === 'connectWalletButton' ? (
                <ConnectWalletButton
                  id={child.id}
                  content={child.content}
                  styles={child.styles}
                />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      )}
    </nav>
  );
};

export default DeFiNavbar; 