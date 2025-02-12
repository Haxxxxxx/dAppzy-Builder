import React, { useRef, useState, useEffect, useContext } from 'react';
import { DetailedFooterStyles } from './defaultFooterStyles.js';
import { Button, Span, Image } from '../../SelectableElements.js';
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const DetailedFooter = ({ handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const footerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // 1) Access elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem,
  });

  // 2) Find the Navbar element in the global state by its ID
  const footerElement = elements.find((el) => el.id === uniqueId);
  // 3) Apply default styles only if we detect an empty `styles` object
  useEffect(() => {
    if (!footerElement) return;
    const noCustomStyles =
      !footerElement.styles || Object.keys(footerElement.styles).length === 0;

    if (noCustomStyles) {
      // This merges your custom defaults into element.styles and saves them
      updateStyles(footerElement.id, {
        ...DetailedFooterStyles.nav,
      });
    }
  }, [footerElement, updateStyles]);

  useEffect(() => {
    setIsCompact(contentListWidth < 768); // Breakpoint logic
  }, [contentListWidth]);


  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <footer       ref={(node) => {
            footerRef.current = node;
            drop(node);
          }}
          style={{
            // 4) Merge your local default styles + the styles from state,
            //    so they actually render in the browser
            ...DetailedFooterStyles.nav,
            ...(footerElement?.styles || {}),
          }}
          onClick={(e) => handleSelect(e)}  // if you need the event explicitly
    >
      {children.map((child) => {
        switch (child.type) {
          case 'span':
            return (
              <Span
                key={child.id}
                id={child.id}
                content={child.content}
                styles={child.styles || DetailedFooterStyles.companyInfo}
              />
            );
          case 'button':
            return (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={child.styles || DetailedFooterStyles.socialButton}
              />
            );
          case 'image':
            return (
              <Image
                key={child.id}
                id={child.id}
                src={child.content}
                styles={child.styles || DetailedFooterStyles.socialButton}
              />
            );
          default:
            return null;
        }
      })}
    </footer>
  );
};

export default DetailedFooter;
