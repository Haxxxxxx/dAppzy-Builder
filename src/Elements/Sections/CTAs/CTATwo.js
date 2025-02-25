import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { ctaTwoStyles } from '../../../Elements/Sections/CTAs/defaultCtaStyles';
import { Button, Span, Image } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';

const CTATwo = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
  configuration,
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

  // Choose your base style (here it's always ctaTwoStyles)
  const ctaStyles = ctaTwoStyles;

  // Apply default container styles if none exist
  useEffect(() => {
    if (!ctaElement) return;

    const noCustomStyles =
      !ctaElement.styles || Object.keys(ctaElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(ctaElement.id, {
        ...ctaStyles.cta,
      });
    }
  }, [ctaElement, updateStyles, configuration, ctaStyles]);

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
    ...ctaStyles.cta,
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
      <div style={ctaStyles.ctaContent}>
        {/* Render ALL title elements */}
        {children
          .filter((child) => child?.type === 'title')
          .map((child) => (
            <Span
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...ctaStyles.ctaTitle,
                ...(child.styles || {}),
              }}
            />
          ))}

        {/* (Optional) Render ALL paragraphs if you want them */}
        {children
          .filter((child) => child?.type === 'paragraph')
          .map((child) => (
            <Span
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...ctaStyles.ctaDescription,
                ...(child.styles || {}),
              }}
            />
          ))}

        {/* Render ALL buttons (first = primary, rest = secondary) */}
        <div style={ctaStyles.buttonContainer}>
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
                        ...ctaStyles.primaryButton,
                        ...(child.styles || {}),
                      }
                    : {
                        ...ctaStyles.secondaryButton,
                        ...(child.styles || {}),
                      }
                }
              />
            ))}
        </div>
      </div>

    </section>
  );
};

export default CTATwo;
