import React, { useRef, useState, useEffect, useContext } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';
import { EditableContext } from '../../../context/EditableContext';
import { CustomTemplateNavbarStyles } from './DefaultNavbarStyles';
import { Image, Span, Button, ConnectWalletButton, Anchor, LinkBlock } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import DropInsertionLine from '../../../components/DropInsertionLine';

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
  const { elements, updateStyles, setElements, findElementById } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  // Reorder drag & drop within this container
  const {
    isDragging: isReorderDragging,
    draggedId: reorderDraggedId,
    dropIndicatorIndex,
    dropIndicatorContainerId,
    onDragStart: reorderDragStart,
    onDragOver: reorderDragOver,
    onDrop: reorderDrop_,
    onDragEnd: reorderDragEnd,
    onDragLeave: reorderDragLeave,
  } = useReorderDrop(findElementById, elements, setElements);

  const isDndDragging = useDndIsDragging();

  const showIndicator = isReorderDragging && dropIndicatorContainerId === uniqueId;

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
        borderBottom: isOverCurrent ? '2px solid var(--purple, #5C4EFA)' : undefined,
      }}
      onClick={(e) => handleSelect(e)}
      onDragOver={(e) => reorderDragOver(e, uniqueId, null, false, navRef)}
      onDrop={(e) => { reorderDrop_(e, uniqueId); e.stopPropagation(); }}
      onDragLeave={reorderDragLeave}
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
          <div
            draggable={!isDndDragging}
            onDragStart={(e) => reorderDragStart(e, children[0].id, uniqueId)}
            onDragEnd={reorderDragEnd}
            style={{
              cursor: !isDndDragging ? 'grab' : 'default',
              opacity: reorderDraggedId === children[0].id ? 0.4 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
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
          </div>
        )}
        {children?.[1]?.type === 'span' && (
          <div
            draggable={!isDndDragging}
            onDragStart={(e) => reorderDragStart(e, children[1].id, uniqueId)}
            onDragEnd={reorderDragEnd}
            style={{
              cursor: !isDndDragging ? 'grab' : 'default',
              opacity: reorderDraggedId === children[1].id ? 0.4 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
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
              handleOpenMediaPanel={handleOpenMediaPanel}
              className="navbar-title"
            />
          </div>
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
              {children?.slice(2).map((child, index) => {
                if (!child) return null;
                const globalIdx = index + 2;
                return (
                  <React.Fragment key={`compact-${child.id}-${index}`}>
                    {showIndicator && dropIndicatorIndex === globalIdx && (
                      <DropInsertionLine />
                    )}
                    <div
                      draggable={!isDndDragging}
                      onDragStart={(e) => reorderDragStart(e, child.id, uniqueId)}
                      onDragEnd={reorderDragEnd}
                      style={{
                        cursor: !isDndDragging ? 'grab' : 'default',
                        opacity: reorderDraggedId === child.id ? 0.4 : 1,
                        transition: 'opacity 0.15s ease',
                      }}
                    >
                      {child.type === 'span' && (
                        <Span
                          id={child.id}
                          content={child.content}
                          styles={{
                            ...child.styles,
                            cursor: 'pointer',
                            padding: '0.5rem',
                            flex: '0 0 auto',
                          }}
                          handleOpenMediaPanel={handleOpenMediaPanel}
                          className="navbar-link"
                        />
                      )}
                      {child.type === 'connectWalletButton' && (
                        <ConnectWalletButton
                          id={child.id}
                          content={child.content}
                          styles={{
                            ...child.styles,
                            cursor: 'pointer',
                            padding: '0.5rem',
                            flex: '0 0 auto',
                          }}
                          handleOpenMediaPanel={handleOpenMediaPanel}
                          className="navbar-connect-wallet"
                        />
                      )}
                      {child.type === 'button' && (
                        <Button
                          id={child.id}
                          content={child.content}
                          styles={{
                            ...child.styles,
                            cursor: 'pointer',
                            padding: '0.5rem',
                            flex: '0 0 auto',
                          }}
                          handleOpenMediaPanel={handleOpenMediaPanel}
                          className="navbar-button"
                        />
                      )}
                      {child.type === 'anchor' && (
                        <Anchor
                          id={child.id}
                          content={child.content}
                          styles={{
                            ...child.styles,
                            cursor: 'pointer',
                            padding: '0.5rem',
                            flex: '0 0 auto',
                          }}
                          handleOpenMediaPanel={handleOpenMediaPanel}
                          className="navbar-anchor"
                        />
                      )}
                      {(child.type === 'linkblock' || child.type === 'linkBlock') && (
                        <LinkBlock
                          id={child.id}
                          content={child.content}
                          styles={{
                            ...child.styles,
                            cursor: 'pointer',
                            padding: '0.5rem',
                            flex: '0 0 auto',
                          }}
                          handleOpenMediaPanel={handleOpenMediaPanel}
                          className="navbar-linkblock"
                        />
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              {showIndicator && dropIndicatorIndex === children.length && (
                <DropInsertionLine />
              )}
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
          {children?.slice(2).map((child, index) => {
            if (!child) return null;
            const globalIdx = index + 2;
            return (
              <React.Fragment key={`regular-${child.id}-${index}`}>
                {showIndicator && dropIndicatorIndex === globalIdx && (
                  <DropInsertionLine />
                )}
                <div
                  draggable={!isDndDragging}
                  onDragStart={(e) => reorderDragStart(e, child.id, uniqueId)}
                  onDragEnd={reorderDragEnd}
                  style={{
                    cursor: !isDndDragging ? 'grab' : 'default',
                    opacity: reorderDraggedId === child.id ? 0.4 : 1,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  {child.type === 'span' && (
                    <Span
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flex: '0 0 auto',
                      }}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      className="navbar-link"
                    />
                  )}
                  {child.type === 'connectWalletButton' && (
                    <ConnectWalletButton
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flex: '0 0 auto',
                      }}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      className="navbar-connect-wallet"
                    />
                  )}
                  {child.type === 'button' && (
                    <Button
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flex: '0 0 auto',
                      }}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      className="navbar-button"
                    />
                  )}
                  {child.type === 'anchor' && (
                    <Anchor
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flex: '0 0 auto',
                      }}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      className="navbar-anchor"
                    />
                  )}
                  {(child.type === 'linkblock' || child.type === 'linkBlock') && (
                    <LinkBlock
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flex: '0 0 auto',
                      }}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      className="navbar-linkblock"
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
          {showIndicator && dropIndicatorIndex === children.length && (
            <DropInsertionLine />
          )}
        </div>
      )}
    </nav>
  );
};

export default CustomTemplateNavbar;
