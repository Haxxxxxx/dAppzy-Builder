import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { CustomTemplateNavbarStyles } from './DefaultNavbarStyles';
import { Image, Span, Button, ConnectWalletButton } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';


const CustomTemplateNavbar = ({
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

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        // 4) Merge your local default styles + the styles from state,
        //    so they actually render in the browser
        ...CustomTemplateNavbarStyles.nav,
        ...(navbarElement?.styles || {}),
      }}
      onClick={(e) => handleSelect(e)}  // if you need the event explicitly

    >
      {/* Logo and Title */}
      <div style={{ ...CustomTemplateNavbarStyles.logoContainer }}>
        {children[0] && children[0].type === 'image' && (
          <Image
            key={children[0].id}
            id={children[0].id}
            src={children[0].content || 'Default Logo'}
            styles={{
              ...children[0].styles,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        )}
        {children[1] && children[1].type === 'span' && (
          <Span
            key={children[1].id}
            id={children[1].id}
            content={children[1].content}
            styles={{
              ...children[1].styles,
              cursor: 'pointer',
            }}
          />
        )}
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
              {children.slice(2)
                .filter((child) => child?.type === 'span')
                .map((child) => (
                  <Span
                    key={child.id}
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              {children.slice(2)
                .filter(
                  (child) =>
                    child?.type === 'button' || child?.type === 'connectWalletButton'
                )
                .map((child) => (
                  <React.Fragment key={child.id}>
                    {child.type === 'connectWalletButton' ? (
                      <ConnectWalletButton
                        id={child.id}
                        content={child.content}
                        styles={{
                          ...child.styles,
                          cursor: 'pointer',
                        }}
                      />
                    ) : (
                      <Button
                        id={child.id}
                        content={child.content}
                        styles={{
                          ...child.styles,
                          cursor: 'pointer',
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
            </div>
          )}
        </>
      )}

      {/* Desktop Links and Buttons */}
      {!isCompact && (
        <>
          <div style={{ ...CustomTemplateNavbarStyles.standardMenuContainer }}>
            {children.slice(2)
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <Span
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
            {children.slice(2)
              .filter(
                (child) => child?.type === 'button' || child?.type === 'connectWalletButton'
              )
              .map((child) => (
                <React.Fragment key={child.id}>
                  {child.type === 'connectWalletButton' ? (
                    <ConnectWalletButton
                      id={child.id}
                      content={child.content}
                      styles={child.styles}
                    />
                  ) : (
                    <Button
                      id={child.id}
                      content={child.content}
                      styles={{
                        ...child.styles,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
          </div>
        </>
      )}
    </nav>
  );
};

export default CustomTemplateNavbar;
