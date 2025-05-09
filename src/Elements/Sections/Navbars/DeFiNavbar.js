import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';

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

  const { elements, updateStyles, setElements, findElementById, setSelectedElement, addNewElement } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem: (droppedItem) => handleNavbarDrop(droppedItem, uniqueId),
  });

  const { activeDrop, onDragStart, onDragOver, onDrop, onDragEnd } = useReorderDrop(
    findElementById,
    elements,
    setElements
  );

  const navbarElement = elements.find((el) => el.id === uniqueId);

  // Add this useEffect after the other useEffect hooks
  useEffect(() => {
    if (!navbarElement) return;

    // Find all buttons in the navbar
    const navbarButtons = children?.filter(child => 
      child.type === 'button' || child.type === 'connectWalletButton'
    ) || [];

    // If we have any buttons, use the first one's styles as the template
    if (navbarButtons.length > 0) {
      const templateStyles = navbarButtons[0].styles || {
        backgroundColor: '#5C4EFA',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#4A3ED9'
        }
      };

      // Update styles for all buttons to match the template
      navbarButtons.forEach(button => {
        if (JSON.stringify(button.styles) !== JSON.stringify(templateStyles)) {
          updateStyles(button.id, templateStyles);
        }
      });
    }
  }, [children, navbarElement, updateStyles]);

  // Handle dropping new elements
  const handleNavbarDrop = (droppedItem, parentId = uniqueId) => {
    console.log('handleNavbarDrop called with:', droppedItem, parentId);
    
    if (droppedItem.id) {
      console.log('Item already has an ID, skipping');
      return;
    }

    // Default button configuration
    const defaultButtonConfig = {
      content: 'New Button',
      type: 'button',
      styles: {
        backgroundColor: '#5C4EFA',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'inline-block',
        textAlign: 'center',
        textDecoration: 'none',
        outline: 'none',
        boxShadow: 'none',
        margin: '0',
        width: 'auto',
        height: 'auto',
        lineHeight: '1.5',
        fontFamily: 'inherit',
        '&:hover': {
          backgroundColor: '#4a3ed9'
        }
      }
    };

    // Find existing buttons to get their styles
    const existingButtons = children?.filter(child => child.type === 'button' || child.type === 'connectWalletButton');
    const buttonStyles = existingButtons?.[0]?.styles || defaultButtonConfig.styles;

    console.log('Adding new element:', droppedItem.type);
    const newId = addNewElement(
      droppedItem.type,
      droppedItem.level || 1,
      null,
      parentId
    );

    // If the dropped element is a button, apply the existing button styles and ensure all required properties
    if (droppedItem.type === 'button') {
      console.log('Processing button element');
      setElements((prev) =>
        prev.map((el) => {
          if (el.id === newId) {
            return {
              ...el,
              content: el.content || defaultButtonConfig.content,
              type: 'button',
              styles: { ...buttonStyles },
              configuration: el.configuration || '',
              className: el.className || '',
              attributes: el.attributes || {},
              dataAttributes: el.dataAttributes || {},
              events: el.events || {},
              children: el.children || []
            };
          }
          return el;
        })
      );
    }

    // Update parent element's children array
    setElements((prev) =>
      prev.map((el) =>
        el.id === parentId
          ? { ...el, children: [...(el.children || []), newId] }
          : el
      )
    );

    console.log('Element added successfully with ID:', newId);
  };

  // Render children with drag and drop support
  const renderChildren = () => {
    if (!children || children.length === 0) return null;

    // Group children by their intended position
    const logoGroup = children.slice(0, 2);
    const walletGroup = children.slice(2);

    return (
      <>
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {logoGroup.map((child, index) => (
            <React.Fragment key={child.id}>
              {activeDrop && activeDrop.containerId === uniqueId && activeDrop.index === index && (
                <div
                  className="drop-placeholder"
                  style={{
                    padding: '8px',
                    border: '2px dashed #5C4EFA',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    backgroundColor: 'transparent',
                    width: '100%',
                    margin: '5px',
                    fontFamily: 'Montserrat',
                  }}
                  onDragOver={(e) => onDragOver(e, uniqueId, index)}
                  onDrop={(e) => onDrop(e, uniqueId)}
                >
                  Drop here – element will be dropped here
                </div>
              )}
              <span
                draggable
                onDragStart={(e) => onDragStart(e, child.id)}
                onDragOver={(e) => onDragOver(e, uniqueId, index)}
                onDragEnd={onDragEnd}
                style={{ display: 'inline-block' }}
              >
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
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Connect Wallet Button and Other Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {walletGroup.map((child, index) => (
            <React.Fragment key={child.id}>
              {activeDrop && activeDrop.containerId === uniqueId && activeDrop.index === logoGroup.length + index && (
                <div
                  className="drop-placeholder"
                  style={{
                    padding: '8px',
                    border: '2px dashed #5C4EFA',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    backgroundColor: 'transparent',
                    width: '100%',
                    margin: '5px',
                    fontFamily: 'Montserrat',
                  }}
                  onDragOver={(e) => onDragOver(e, uniqueId, logoGroup.length + index)}
                  onDrop={(e) => onDrop(e, uniqueId)}
                >
                  Drop here – element will be dropped here
                </div>
              )}
              <span
                draggable
                onDragStart={(e) => onDragStart(e, child.id)}
                onDragOver={(e) => onDragOver(e, uniqueId, logoGroup.length + index)}
                onDragEnd={onDragEnd}
                style={{ display: 'inline-block' }}
              >
                {child.type === 'connectWalletButton' ? (
                  <ConnectWalletButton
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      marginLeft: 'auto',
                    }}
                    onClick={(e) => handleElementClick(e, child.id)}
                  />
                ) : child.type === 'button' ? (
                  <Button
                    id={child.id}
                    content={child.content}
                    styles={child.styles}
                    onClick={(e) => handleElementClick(e, child.id)}
                  />
                ) : null}
              </span>
            </React.Fragment>
          ))}
          {activeDrop && activeDrop.containerId === uniqueId && (
            <div
              style={{ height: '40px', width: '100%' }}
              onDragOver={(e) => onDragOver(e, uniqueId, children.length)}
              onDrop={(e) => onDrop(e, uniqueId)}
            >
              {activeDrop.index === children.length && (
                <div
                  className="drop-placeholder"
                  style={{
                    padding: '8px',
                    border: '2px dashed #5C4EFA',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    backgroundColor: 'transparent',
                    width: '100%',
                    margin: '5px',
                    fontFamily: 'Montserrat',
                  }}
                >
                  Drop here – element will be dropped here
                </div>
              )}
            </div>
          )}
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
                    ) : child.type === 'button' ? (
                      <Button
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