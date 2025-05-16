import React, { useRef, useState, useEffect, useContext, useMemo } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';

const DeFiNavbar = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const dropHandledRef = useRef(false);

  const {generateUniqueId, elements, updateStyles, setElements, findElementById, setSelectedElement, addNewElement } = useContext(EditableContext);
  
  // Memoize navbar element
  const navbarElement = useMemo(() => findElementById(uniqueId, elements), [uniqueId, elements, findElementById]);

  // Base styles for different element types
  const baseStyles = useMemo(() => ({
    button: {
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
    },
    connectWalletButton: {
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
    },
    image: {
      width: '40px',
      height: '40px',
      borderRadius: '4px',
      objectFit: 'cover',
      aspectRatio: '1/1',
    },
    span: {
      color: '#1a1a1a',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      cursor: 'pointer',
    }
  }), []);

  // Handle initial styles setup
  useEffect(() => {
    if (!navbarElement) return;
    const noCustomStyles = !navbarElement.styles || Object.keys(navbarElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(navbarElement.id, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexWrap: 'wrap',
        gap: '1rem',
      });
    }
  }, [navbarElement?.id, updateStyles]);

  // Handle compact mode
  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem: (droppedItem) => {
      if (dropHandledRef.current || !droppedItem) return;
      handleNavbarDrop(droppedItem, navbarElement?.children?.length || 0);
    }
  });

  const { activeDrop, onDragStart, onDragOver, onDragEnd } = useReorderDrop(
    findElementById,
    elements,
    setElements
  );

  // Handle dropping new elements
  const handleNavbarDrop = (item, index) => {
    if (!item || dropHandledRef.current || !navbarElement) return;

    if (item.type === 'navbar') {
      console.warn('Cannot add a navbar inside another navbar');
      return;
    }

    // Check for duplicate elements before proceeding
    const existingElements = navbarElement.children
      .map(childId => findElementById(childId, elements))
      .filter(Boolean);

    if (item.type === 'button' || item.type === 'connectWalletButton') {
      const hasDuplicate = existingElements.some(el => 
        el.type === item.type && el.content === item.content
      );
      if (hasDuplicate) {
        console.warn(`A ${item.type} with this content already exists in the navbar`);
        return;
      }
    }

    // Set drop handled flag to prevent multiple drops
    dropHandledRef.current = true;

    // Generate a unique ID with timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 6);
    const newId = `${item.type}-${timestamp}-${randomStr}`;

    // Create the new element using addNewElement
    const elementId = addNewElement(
      item.type,
      1,
      index,
      uniqueId,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: {
          ...baseStyles[item.type],
          ...item.styles
        }
      }
    );

    // Update the navbar's children array
    setElements(prevElements => {
      return prevElements.map(el => {
        if (el.id === uniqueId) {
          const existingChildren = [...(el.children || [])];
          // Only add the element if it's not already in the children array
          if (!existingChildren.includes(elementId)) {
            existingChildren.splice(index, 0, elementId);
          }
          return { ...el, children: existingChildren };
        }
        return el;
      });
    });

    // Select the new element
    setSelectedElement({ 
      id: elementId, 
      type: item.type,
      parentId: uniqueId,
      index: index
    });

    // Reset drop handled flag after a short delay
    setTimeout(() => {
      dropHandledRef.current = false;
    }, 100);
  };

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  const handleElementClick = (e, elementId) => {
    e.stopPropagation();
    const element = findElementById(elementId, elements);
    if (element) {
      const elementIndex = navbarElement?.children?.indexOf(elementId) ?? -1;
      setSelectedElement({
        ...element,
        parentId: uniqueId,
        index: elementIndex,
        navbarId: uniqueId
      });
    }
  };

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  // Memoize the filtered children to prevent unnecessary re-renders
  const filteredChildren = useMemo(() => {
    if (!navbarElement?.children) return [];
    return navbarElement.children
      .map(childId => findElementById(childId, elements))
      .filter(child => child && (child.type === 'button' || child.type === 'connectWalletButton'));
  }, [navbarElement?.children, elements, findElementById]);

  if (!navbarElement) {
    return null;
  }

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
      className="defi-navbar"
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
            id={children[0].id}
            src={children[0].content || 'Default Logo'}
            styles={{
              ...baseStyles.image,
              ...children[0].styles
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
            onClick={(e) => handleElementClick(e, children[0].id)}
            className="navbar-logo"
          />
        )}
        {children?.[1]?.type === 'span' && (
          <Span
            id={children[1].id}
            content={children[1].content}
            styles={{
              ...baseStyles.span,
              ...children[1].styles
            }}
            onClick={(e) => handleElementClick(e, children[1].id)}
            className="navbar-title"
          />
        )}
      </div>

      {/* Standard Menu */}
      {!isCompact && (
        <div 
          style={{ 
            display: 'flex', 
            gap: '1rem',
            flex: '0 1 auto',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }} 
          className="navbar-buttons"
        >
          {filteredChildren.map((child, index) => (
            <React.Fragment key={`${child.type}-${child.id}-${index}`}>
              {child.type === 'connectWalletButton' ? (
                <ConnectWalletButton
                  id={child.id}
                  content={child.content}
                  styles={{
                    ...baseStyles.connectWalletButton,
                    ...child.styles,
                    flex: '0 0 auto',
                  }}
                  onClick={(e) => handleElementClick(e, child.id)}
                  className="navbar-connect-wallet"
                />
              ) : (
                <Button
                  id={child.id}
                  content={child.content}
                  styles={{
                    ...baseStyles.button,
                    ...child.styles,
                    flex: '0 0 auto',
                  }}
                  onClick={(e) => handleElementClick(e, child.id)}
                  className="navbar-button"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

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
              {filteredChildren.map((child, index) => (
                <React.Fragment key={`${child.type}-${child.id}-${index}`}>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...baseStyles.connectWalletButton,
                        ...child.styles,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flex: '0 0 auto',
                      }}
                      onClick={(e) => handleElementClick(e, child.id)}
                      className="navbar-connect-wallet"
                    />
                  ) : (
                    <Button
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...baseStyles.button,
                        ...child.styles,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flex: '0 0 auto',
                      }}
                      onClick={(e) => handleElementClick(e, child.id)}
                      className="navbar-button"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default DeFiNavbar; 