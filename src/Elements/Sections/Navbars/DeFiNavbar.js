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
  const [isDropHandled, setIsDropHandled] = useState(false);

  const {generateUniqueId, elements, updateStyles, setElements, findElementById, setSelectedElement, addNewElement } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem: (droppedItem) => {
      // Skip if drop was already handled by a drop zone
      if (isDropHandled || !droppedItem) return;
      
      const navbarElement = findElementById(uniqueId, elements);
      if (!navbarElement) return;
      
      // Add to the end of the navbar
      handleNavbarDrop(droppedItem, navbarElement.children?.length || 0);
    }
  });

  const { activeDrop, onDragStart, onDragOver, onDragEnd } = useReorderDrop(
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
  const handleNavbarDrop = (item, index, groupType) => {
    if (!item) return;

    // Get the current navbar element
    const navbarElement = findElementById(uniqueId, elements);
    if (!navbarElement) return;

    // Generate a unique ID for the new element
    const newId = generateUniqueId(item.type || 'element');

    // Add the new element
    const elementId = addNewElement(
      item.type,
      1,
      index,
      uniqueId,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: item.styles || {}
      }
    );

    // Update the parent element's children array while preserving existing elements
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === uniqueId) {
          // Create a new array for the children, maintaining existing ones
          const existingChildren = [...(el.children || [])];
          
          // Insert the new element ID at the specified index
          existingChildren.splice(index, 0, elementId);

          return {
            ...el,
            children: existingChildren
          };
        }
        return el;
      });

      return updatedElements;
    });

    // Select the new element
    setSelectedElement({ id: elementId, type: item.type });
  };

  // Modify the renderChildren function to properly handle the logo group
  const renderChildren = () => {
    if (!children || children.length === 0) return null;

    // Get the current navbar element
    const navbarElement = findElementById(uniqueId, elements);
    if (!navbarElement) return null;

    // Get all children elements
    const allChildren = navbarElement.children
      .map(childId => findElementById(childId, elements))
      .filter(Boolean);

    // Group children by their intended position
    const logoGroup = allChildren.filter(child => 
      child.type === 'image' || child.type === 'span'
    );
    const walletGroup = allChildren.filter(child => 
      child.type === 'button' || child.type === 'connectWalletButton'
    );

    return (
      <>
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {logoGroup.map((child, index) => (
            <React.Fragment key={child.id || `logo-group-${index}`}>
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
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDropHandled(true);
                    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
                    handleNavbarDrop(item, index);
                    // Reset the drop handled state after a short delay
                    setTimeout(() => setIsDropHandled(false), 100);
                  }}
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
                key={child.id || `logo-element-${index}`}
              >
                {child.type === 'image' && (
                  <Image
                    id={child.id}
                    key={child.id}
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
                    key={child.id}
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
            <React.Fragment key={child.id || `wallet-group-${index}`}>
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
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDropHandled(true);
                    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
                    handleNavbarDrop(item, logoGroup.length + index);
                    // Reset the drop handled state after a short delay
                    setTimeout(() => setIsDropHandled(false), 100);
                  }}
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
                key={child.id || `wallet-element-${index}`}
              >
                {child.type === 'connectWalletButton' ? (
                  <ConnectWalletButton
                    id={child.id}
                    key={child.id}
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
                    key={child.id}
                    content={child.content}
                    styles={child.styles}
                    onClick={(e) => handleElementClick(e, child.id)}
                  />
                ) : null}
              </span>
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
              key="menu-toggle"
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
                key="menu-content"
              >
                {walletGroup.map((child) => (
                  <React.Fragment key={child.id || `menu-item-${child.type}`}>
                    {child.type === 'connectWalletButton' ? (
                      <ConnectWalletButton
                        id={child.id}
                        key={child.id}
                        content={child.content}
                        styles={child.styles}
                        onClick={(e) => handleElementClick(e, child.id)}
                      />
                    ) : child.type === 'button' ? (
                      <Button
                        id={child.id}
                        key={child.id}
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
      // Ensure we're passing the full element data including its position in the navbar
      const navbarElement = findElementById(uniqueId, elements);
      const elementIndex = navbarElement?.children?.indexOf(elementId) ?? -1;
      
      setSelectedElement({
        ...element,
        parentId: uniqueId,
        index: elementIndex,
        navbarId: uniqueId
      });
    }
  };

  // Add this new function to handle element updates
  const handleElementUpdate = (elementId, updates) => {
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === elementId) {
          return {
            ...el,
            ...updates,
            // Preserve the parent-child relationship
            parentId: el.parentId,
            children: el.children
          };
        }
        return el;
      });

      // Ensure the navbar's children array is maintained
      const navbarElement = updatedElements.find(el => el.id === uniqueId);
      if (navbarElement) {
        const updatedNavbar = {
          ...navbarElement,
          children: navbarElement.children || []
        };
        return updatedElements.map(el => 
          el.id === uniqueId ? updatedNavbar : el
        );
      }

      return updatedElements;
    });
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