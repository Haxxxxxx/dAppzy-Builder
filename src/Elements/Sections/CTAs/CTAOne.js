import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Span, Button, Image } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import { ctaOneStyles } from './defaultCtaStyles';

const CTAOne = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const ctaRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);

  // Access elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  // Make the CTA droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: ctaRef,
    onDropItem,
  });

  // Locate the CTA element in global state
  const ctaElement = elements.find((el) => el.id === uniqueId);

  // Apply default container styles if none exist
  useEffect(() => {
    if (!ctaElement) return;
    const noCustomStyles =
      !ctaElement.styles || Object.keys(ctaElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(ctaElement.id, {
        ...ctaOneStyles.cta,
      });
    }
  }, [ctaElement, updateStyles]);

  // Basic responsive toggle
  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  // Handle drag-and-drop image replacement
  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  const containerStyles = {
    ...ctaOneStyles.cta,
    ...(ctaElement?.styles || {}),
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
  };

  return (
    <section
      ref={(node) => {
        ctaRef.current = node;
        drop(node);
      }}
      style={containerStyles}
      onClick={(e) => handleSelect(e)}
    >
      {/* Main CTA content */}
      <div style={ctaOneStyles.ctaContent}>
        {/* Render ALL title elements */}
        {children
          .filter((child) => child?.type === 'title')
          .map((child) => (
            <Span
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...ctaOneStyles.ctaTitle,
                ...(child.styles || {}),
              }}
            />
          ))}

        {/* Render ALL paragraph elements */}
        {children
          .filter((child) => child?.type === 'paragraph')
          .map((child) => (
            <Span
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...ctaOneStyles.ctaDescription,
                ...(child.styles || {}),
              }}
            />
          ))}

        {/* Render ALL buttons (first = primary, rest = secondary) */}
        <div style={ctaOneStyles.buttonContainer}>
          {children
            .filter((child) => child?.type === 'button')
            .map((child, index) => (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={
                  index === 0
                    ? {
                        ...ctaOneStyles.primaryButton,
                        ...(child.styles || {}),
                      }
                    : {
                        ...ctaOneStyles.secondaryButton,
                        ...(child.styles || {}),
                      }
                }
              />
            ))}
        </div>
      </div>

      {/* Render ALL images (droppable) */}
      <div style={ctaOneStyles.ctaImage}>
      {children
        .filter((child) => child?.type === 'image')
        .map((child) => (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{
              ...ctaOneStyles.ctaImage,
              ...(child.styles || {}),
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        ))}
        </div>
    </section>
  );
};

export default CTAOne;
