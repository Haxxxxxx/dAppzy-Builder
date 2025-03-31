import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { sectionFourStyles } from './defaultSectionStyles';
import { Heading, Paragraph, Button, Image, Span, Icon } from '../../SelectableElements';

const SectionFour = ({
  uniqueId,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  handleSelect,
}) => {
  const sectionRef = useRef(null);
  const { elements, updateStyles } = useContext(EditableContext);

  // Enable drag-and-drop on this section
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // Find the corresponding element in global state
  const sectionElement = elements.find((el) => el.id === uniqueId);

  // Apply default styles if none exist
  useEffect(() => {
    if (!sectionElement) return;
    const noCustomStyles =
      !sectionElement.styles || Object.keys(sectionElement.styles).length === 0;
    if (noCustomStyles) {
      updateStyles(sectionElement.id, { ...sectionFourStyles.sectionContainer });
    }
  }, [sectionElement, updateStyles]);

  // Merge default container style with any custom style and highlight when dragging over
  const containerStyles = {
    ...sectionFourStyles.sectionContainer,
    ...(sectionElement?.styles || {}),
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
  };

  // Filter out "featureItem" children for the 4-icon row
  const featureItems = children.filter((child) => child.type === 'featureItem');

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={containerStyles}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e); // Mark this section as selected
      }}
    >
      {/* Caption (span) */}
      {children
        .filter((child) => child.type === 'span')
        .map((child) => (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...sectionFourStyles.caption, ...(child.styles || {}) }}
          />
        ))}

      {/* Main Heading */}
      {children
        .filter((child) => child.type === 'heading')
        .map((child) => (
          <Heading
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{ ...sectionFourStyles.heading, ...(child.styles || {}) }}
          />
        ))}

      {/* Feature Items Row (icons/images + text) */}
      <div style={sectionFourStyles.featuresContainer}>
        {featureItems.map((item) => (
          <div key={item.id} style={sectionFourStyles.featureItem}>
            {/* Render each sub-child inside this feature item */}
            {item.children?.map((sub) => {
              if (sub.type === 'icon') {
                // For a custom Icon element
                return (
                  <Icon
                    key={sub.id}
                    id={sub.id}
                    styles={{ ...sectionFourStyles.featureIcon, ...(sub.styles || {}) }}
                  />
                );
              } else if (sub.type === 'image') {
                // For an image-based icon
                return (
                  <Image
                    key={sub.id}
                    id={sub.id}
                    src={sub.content}
                    styles={{ ...sectionFourStyles.featureIcon, ...(sub.styles || {}) }}
                    handleOpenMediaPanel={handleOpenMediaPanel}
                    handleDrop={onDropItem}
                  />
                );
              } else if (sub.type === 'heading') {
                // Optional sub-heading for the feature
                return (
                  <Heading
                    key={sub.id}
                    id={sub.id}
                    content={sub.content}
                    styles={{ ...sectionFourStyles.featureHeading, ...(sub.styles || {}) }}
                  />
                );
              } else if (sub.type === 'paragraph') {
                // Description text
                return (
                  <Paragraph
                    key={sub.id}
                    id={sub.id}
                    content={sub.content}
                    styles={{ ...sectionFourStyles.featureText, ...(sub.styles || {}) }}
                  />
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      {/* Primary Button (if any) */}
      {children.filter((child) => child.type === 'button').length > 0 && (
        <div style={{ marginTop: '24px' }}>
          {children
            .filter((child) => child.type === 'button')
            .map((child) => (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{ ...sectionFourStyles.primaryButton, ...(child.styles || {}) }}
              />
            ))}
        </div>
      )}
    </section>
  );
};

export default SectionFour;
