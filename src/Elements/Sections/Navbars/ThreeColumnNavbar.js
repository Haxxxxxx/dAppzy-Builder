// src/components/Elements/Sections/Navbars/ThreeColumnNavbar.js
import React, { useRef, useState, useEffect, useContext } from 'react';
import { useDndIsDragging } from '../../../utils/useDndIsDragging';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, ConnectWalletButton, Anchor, LinkBlock } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import DropInsertionLine from '../../../components/DropInsertionLine';
import { defaultNavbarStyles } from './DefaultNavbarStyles';

const ThreeColumnNavbar = ({
  handleSelect,
  uniqueId,
  children,
  onDropItem,
  contentListWidth,
  handleOpenMediaPanel,
}) => {
  const navRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { elements, setElements, findElementById } = useContext(EditableContext);

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
    const element = elements.find(el => el.id === elementId);
    if (element) {
      handleSelect(e, element);
    }
  };

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        ...defaultNavbarStyles.nav,
        borderBottom: isOverCurrent ? '2px solid var(--purple, #5C4EFA)' : defaultNavbarStyles.nav.borderBottom,
      }}
      onClick={(e) => handleSelect(e)}
      onDragOver={(e) => reorderDragOver(e, uniqueId, null, false, navRef)}
      onDrop={(e) => { reorderDrop_(e, uniqueId); e.stopPropagation(); }}
      onDragLeave={reorderDragLeave}
    >
      {/* Logo Section */}
      <div style={defaultNavbarStyles.logoContainer}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <div
              key={child.id}
              draggable={!isDndDragging}
              onDragStart={(e) => reorderDragStart(e, child.id, uniqueId)}
              onDragEnd={reorderDragEnd}
              style={{
                cursor: !isDndDragging ? 'grab' : 'default',
                opacity: reorderDraggedId === child.id ? 0.4 : 1,
                transition: 'opacity 0.15s ease',
              }}
            >
              <Image
                id={child.id}
                src={child.content || 'Default Logo'}
                styles={{ width: '40px', height: '40px', objectFit: 'cover', ...child.styles }}
                handleOpenMediaPanel={handleOpenMediaPanel}
                handleDrop={handleImageDrop}
                onClick={(e) => handleElementClick(e, child.id)}
              />
            </div>
          ))}
      </div>

      {/* Compact Menu */}
      {isCompact && (
        <>
          <div
            style={defaultNavbarStyles.compactMenuIcon}
            onClick={toggleMenu}
          >
            ☰
          </div>
          {isMenuOpen && (
            <div style={defaultNavbarStyles.compactMenu}>
              {children.map((child, idx) => (
                <React.Fragment key={child.id}>
                  {showIndicator && dropIndicatorIndex === idx && (
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
                        styles={child.styles}
                        handleOpenMediaPanel={handleOpenMediaPanel}
                        onClick={(e) => handleElementClick(e, child.id)}
                      />
                    )}
                    {child.type === 'button' && (
                      <Button
                        id={child.id}
                        content={child.content}
                        styles={child.styles}
                        handleOpenMediaPanel={handleOpenMediaPanel}
                        onClick={(e) => handleElementClick(e, child.id)}
                      />
                    )}
                    {child.type === 'connectWalletButton' && (
                      <ConnectWalletButton
                        id={child.id}
                        content={child.content}
                        styles={child.styles}
                        handleOpenMediaPanel={handleOpenMediaPanel}
                        onClick={(e) => handleElementClick(e, child.id)}
                      />
                    )}
                    {child.type === 'anchor' && (
                      <Anchor
                        id={child.id}
                        content={child.content}
                        styles={child.styles}
                        handleOpenMediaPanel={handleOpenMediaPanel}
                        onClick={(e) => handleElementClick(e, child.id)}
                      />
                    )}
                    {(child.type === 'linkblock' || child.type === 'linkBlock') && (
                      <LinkBlock
                        id={child.id}
                        content={child.content}
                        styles={child.styles}
                        handleOpenMediaPanel={handleOpenMediaPanel}
                        onClick={(e) => handleElementClick(e, child.id)}
                      />
                    )}
                  </div>
                </React.Fragment>
              ))}
              {showIndicator && dropIndicatorIndex === children.length && (
                <DropInsertionLine />
              )}
            </div>
          )}
        </>
      )}

      {/* Standard Menu */}
      {!isCompact && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flex: 1,
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '16px'
          }}>
            {children
              .filter((child) => child?.type === 'span' || child?.type === 'anchor' || child?.type === 'linkblock' || child?.type === 'linkBlock')
              .map((child) => (
                <div
                  key={child.id}
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
                      styles={child.styles}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      onClick={(e) => handleElementClick(e, child.id)}
                    />
                  )}
                  {child.type === 'anchor' && (
                    <Anchor
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      onClick={(e) => handleElementClick(e, child.id)}
                    />
                  )}
                  {(child.type === 'linkblock' || child.type === 'linkBlock') && (
                    <LinkBlock
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      onClick={(e) => handleElementClick(e, child.id)}
                    />
                  )}
                </div>
              ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {children
              .filter((child) => child?.type === 'button' || child?.type === 'connectWalletButton')
              .map((child) => (
                <div
                  key={child.id}
                  draggable={!isDndDragging}
                  onDragStart={(e) => reorderDragStart(e, child.id, uniqueId)}
                  onDragEnd={reorderDragEnd}
                  style={{
                    cursor: !isDndDragging ? 'grab' : 'default',
                    opacity: reorderDraggedId === child.id ? 0.4 : 1,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      onClick={(e) => handleElementClick(e, child.id)}
                    />
                  ) : (
                    <Button
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                      handleOpenMediaPanel={handleOpenMediaPanel}
                      onClick={(e) => handleElementClick(e, child.id)}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default ThreeColumnNavbar;
