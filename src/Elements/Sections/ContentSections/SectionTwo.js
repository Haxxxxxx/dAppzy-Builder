import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { customTemplateSectionStyles } from './defaultSectionStyles';
import { Heading, Paragraph, Button, Image } from '../../SelectableElements';

const SectionTwo = ({
  uniqueId,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  handleSelect,
}) => {
  const sectionRef = useRef(null);
  const { elements, updateStyles } = useContext(EditableContext);

  // Enable drop functionality for this section
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  const sectionElement = elements.find((el) => el.id === uniqueId);

  useEffect(() => {
    if (!sectionElement) return;
    const noCustomStyles =
      !sectionElement.styles || Object.keys(sectionElement.styles).length === 0;
    if (noCustomStyles) {
      updateStyles(sectionElement.id, { ...customTemplateSectionStyles.sectionTwoContainer });
    }
  }, [sectionElement, updateStyles]);

  const containerStyles = {
    ...customTemplateSectionStyles.sectionTwoContainer,
    ...(sectionElement?.styles || {}),
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
  };

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={containerStyles}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      <div style={customTemplateSectionStyles.imageColumn}>
        {children
          .filter((child) => child.type === 'image')
          .map((child) => (
            <Image
              key={child.id}
              id={child.id}
              src={child.content}
              styles={{ ...customTemplateSectionStyles.image, ...(child.styles || {}) }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={onDropItem}
            />
          ))}
      </div>
      <div style={customTemplateSectionStyles.textColumn}>
        {children
          .filter((child) => child.type === 'heading')
          .map((child) => (
            <Heading
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...customTemplateSectionStyles.heading, ...(child.styles || {}) }}
            />
          ))}
        {children
          .filter((child) => child.type === 'paragraph')
          .map((child) => (
            <Paragraph
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{ ...customTemplateSectionStyles.paragraph, ...(child.styles || {}) }}
            />
          ))}
        {children
          .filter((child) => child.type === 'button')
          .map((child, index) => (
            <Button
              key={child.id}
              id={child.id}
              content={child.content}
              styles={
                index === 0
                  ? { ...customTemplateSectionStyles.primaryButton, ...(child.styles || {}) }
                  : { ...customTemplateSectionStyles.secondaryButton, ...(child.styles || {}) }
              }
            />
          ))}
      </div>
    </section>
  );
};

export default SectionTwo;
