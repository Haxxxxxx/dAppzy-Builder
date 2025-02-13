import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { ctaOneStyles, ctaTwoStyles } from '../../../Elements/Sections/CTAs/defaultCtaStyles';
import { Button, Span } from '../../SelectableElements';
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

  const { drop } = useElementDrop({
    id: uniqueId,
    elementRef: ctaRef,
    onDropItem,
  });

  // Find the CTA element in the global state by its ID
  const ctaElement = elements.find((el) => el.id === uniqueId);

  // Select the correct styles for the CTA configuration
  const ctaStyles = ctaTwoStyles;

  // Apply default styles only if the styles object is empty
  useEffect(() => {
    if (!ctaElement) return;
    const noCustomStyles =
      !ctaElement.styles || Object.keys(ctaElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(ctaElement.id, {
        ...ctaStyles.cta,
      });
    }
  }, [ctaElement, updateStyles, configuration]);

  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  // Find buttons separately
  const buttons = children.filter((child) => child?.type === 'button');
  const primaryButton = buttons[0] || null;
  const secondaryButton = buttons[1] || null;

  return (
    <section
      ref={(node) => {
        ctaRef.current = node;
        drop(node);
      }}
      style={{
        ...ctaStyles.cta,
        ...(ctaElement?.styles || {}),
      }}
      onClick={(e) => handleSelect(e)}
    >
      <div style={ctaStyles.ctaContent}>
        {children
          .filter((child) => child?.type === 'title')
          .map((child) => (
            <Span key={child.id} id={child.id} content={child.content} styles={ctaStyles.ctaTitle} />
          ))}

        <div style={ctaStyles.buttonContainer}>
          {primaryButton && (
            <Button
              key={primaryButton.id}
              id={primaryButton.id}
              content={primaryButton.content}
              styles={ctaStyles.primaryButton}
            />
          )}
          {secondaryButton && (
            <Button
              key={secondaryButton.id}
              id={secondaryButton.id}
              content={secondaryButton.content}
              styles={ctaStyles.secondaryButton}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default CTATwo;
