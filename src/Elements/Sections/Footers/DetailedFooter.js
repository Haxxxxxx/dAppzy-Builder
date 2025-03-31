import React, { useRef, useState, useEffect, useContext } from 'react';
import { DetailedFooterStyles } from './defaultFooterStyles.js';
import { Button, Span, Image } from '../../SelectableElements.js';
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const DetailedFooter = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const footerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Access elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  // Make footer droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem,
  });

  // Find the footer element in global state
  const footerElement = elements.find((el) => el.id === uniqueId);

  // Apply default styles if none exist
  useEffect(() => {
    if (!footerElement) return;
    const noCustomStyles =
      !footerElement.styles || Object.keys(footerElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(footerElement.id, {
        ...DetailedFooterStyles.footer,
      });
    }
  }, [footerElement, updateStyles]);

  // Track responsive state
  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  // Handle drag-and-drop image replacement
  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  // Merge local + custom + highlight if dragging
  const footerStyles = {
    ...DetailedFooterStyles.footer,
    ...(footerElement?.styles || {}),
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
  };

  return (
    <footer
      ref={(node) => {
        footerRef.current = node;
        drop(node);
      }}
      style={footerStyles}
      onClick={(e) => handleSelect(e)}
    >
      {/* Render ALL Spans */}
      {children
        .filter((child) => child.type === 'span')
        .map((child) => (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...DetailedFooterStyles.companyInfo,
              ...(child.styles || {}),
            }}
          />
        ))}

      {/* Render ALL Buttons */}
      {children
        .filter((child) => child.type === 'button')
        .map((child) => (
          <Button
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...DetailedFooterStyles.contactButton,
              ...(child.styles || {}),
            }}
          />
        ))}

      {/* Render ALL Images (droppable) */}
      {children
        .filter((child) => child.type === 'image')
        .map((child) => (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{
              ...DetailedFooterStyles.socialButton,
              ...(child.styles || {}),
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        ))}
    </footer>
  );
};

export default DetailedFooter;
