import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { SimplefooterStyles } from './defaultFooterStyles';
import { Span, Button, Image } from '../../SelectableElements';

const SimpleFooter = ({
  uniqueId,
  children = [],
  handleSelect,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const footerRef = useRef(null);

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
        ...SimplefooterStyles.simpleFooter,
      });
    }
  }, [footerElement, updateStyles]);

  // Handle drag-and-drop image replacement
  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  // Merge local + custom + highlight if dragging
  const footerStyles = {
    ...SimplefooterStyles.simpleFooter,
    ...(footerElement?.styles || {}),
    border: isOverCurrent
      ? '2px solid blue'
      : SimplefooterStyles.simpleFooter.border,
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
              ...SimplefooterStyles.companyInfo,
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
              ...SimplefooterStyles.socialButton,
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
              ...SimplefooterStyles.socialButton,
              ...(child.styles || {}),
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        ))}
    </footer>
  );
};

export default SimpleFooter;
