import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { TemplateFooterStyles } from './defaultFooterStyles.js';
import { Image, Span } from '../../SelectableElements';

const TemplateFooter = ({
  uniqueId,
  contentListWidth,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  handleSelect,
}) => {
  const footerRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);

  // Access elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  // Make footer droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem,
  });

  // Find the footer element in global state by ID
  const footerElement = elements.find((el) => el.id === uniqueId);

  // Apply default styles if none exist
  useEffect(() => {
    if (!footerElement) return;

    const noCustomStyles =
      !footerElement.styles || Object.keys(footerElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(footerElement.id, {
        ...TemplateFooterStyles.footer,
      });
    }
  }, [footerElement, updateStyles]);

  // Responsive breakpoint
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
    ...TemplateFooterStyles.footer,
    ...(footerElement?.styles || {}),
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
    flexDirection: isCompact ? 'column' : 'row',
    textAlign: isCompact ? 'center' : 'left',
  };

  return (
    <footer
      ref={(node) => {
        footerRef.current = node;
        drop(node);
      }}
      style={footerStyles}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
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
              ...TemplateFooterStyles.link,
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
              ...TemplateFooterStyles.socialIcons,
              ...(child.styles || {}),
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        ))}
    </footer>
  );
};

export default TemplateFooter;
