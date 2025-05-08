import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
  import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';

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

  const { elements, updateStyles, setElements, findElementById, setSelectedElement } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  const { activeDrop, onDragStart, onDragOver, onDrop, onDragEnd } = useReorderDrop(
    findElementById,
    elements,
    setElements
  );

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
        backgroundColor: '#1a1a1a',
        color: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        borderBottom: 'none'
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

  const handleElementClick = (e, elementId) => {
    e.stopPropagation();
    const element = findElementById(elementId, elements);
    if (element) {
      setSelectedElement(element);
    }
  };

  const renderChildren = () => {
    if (!children || children.length === 0) return null;

    // Group children by their intended position
    const logoGroup = children.slice(0, 2);
    const walletGroup = children.slice(2);

  return (
      <>
      {/* Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {logoGroup.map((child) => (
          <React.Fragment key={child.id}>
            {child.type === 'image' && (
                <Image
                  id={child.id}
                  src={child.content}
                  styles={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                  onClick={(e) => handleElementClick(e, child.id)}
                  handleOpenMediaPanel={handleOpenMediaPanel}
                  handleDrop={(item) => handleImageDrop(item, child.id)}
                />
            )}
            {child.type === 'span' && (
              <Span
                  id={child.id}
                  content={child.content}
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  marginLeft: '12px',
                }}
                  onClick={(e) => handleElementClick(e, child.id)}
                />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Connect Wallet Button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
          {walletGroup.map((child) => (
          <React.Fragment key={child.id}>
            {child.type === 'connectWalletButton' && (
              <ConnectWalletButton
                id={child.id}
                content={child.content}
                styles={{
                  ...child.styles,
                  marginLeft: 'auto',
                }}
                  onClick={(e) => handleElementClick(e, child.id)}
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
                color: '#fff',
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
                {walletGroup.map((child) => (
                <React.Fragment key={child.id}>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                        onClick={(e) => handleElementClick(e, child.id)}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      )}
      </>
    );
  };

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        ...(navbarElement?.styles || {}),
        borderBottom: isOverCurrent ? '2px solid #5C4EFA' : '1px solid transparent',
        position: 'relative',
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e, uniqueId);
      }}
    >
      {renderChildren()}
    </nav>
  );
};

export default DeFiNavbar; 