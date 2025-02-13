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

  // 1) Access elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  const { drop } = useElementDrop({
    id: uniqueId,
    elementRef: ctaRef,
    onDropItem,
  });

  // 2) Find the CTA element in the global state by its ID
  const ctaElement = elements.find((el) => el.id === uniqueId);

  // 3) Apply default styles only if the styles object is empty
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

  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  return (
    <section
      ref={(node) => {
        ctaRef.current = node;
        drop(node);
      }}
      style={{
        ...ctaOneStyles.cta,
        ...(ctaElement?.styles || {}),
      }}
      onClick={(e) => handleSelect(e)}
    >
      <div style={ctaOneStyles.ctaContent}>
        {children
          .filter((child) => child?.type === 'title')
          .map((child) => (
            <Span key={child.id} id={child.id} content={child.content} styles={ctaOneStyles.ctaTitle} />
          ))}
        {children
          .filter((child) => child?.type === 'paragraph')
          .map((child) => (
            <Span key={child.id} id={child.id} content={child.content} styles={ctaOneStyles.ctaDescription} />
          ))}
        <div style={ctaOneStyles.buttonContainer}>
          {children
            .filter((child) => child?.type === 'button')
            .map((child, index) => (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={index === 0 ? ctaOneStyles.primaryButton : ctaOneStyles.secondaryButton}
              />
            ))}
        </div>
      </div>
     
    </section>
  );
};

export default CTAOne;
