import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { heroTwoStyles } from './defaultHeroStyles';
import { Heading, Paragraph, Button, Image } from '../../SelectableElements';

const HeroTwo = ({
  uniqueId,
  children = [],
  onDropItem,
  handleSelect,
  handleOpenMediaPanel,
}) => {
  const sectionRef = useRef(null);

  // 1) Access global editable context
  const { elements, updateStyles } = useContext(EditableContext);

  // 2) Make hero droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // 3) Find this hero's corresponding element object in global state
  const heroElement = elements.find((el) => el.id === uniqueId);

  // 4) Apply default styles if none exist
  useEffect(() => {
    if (!heroElement) return;

    const noCustomStyles =
      !heroElement.styles || Object.keys(heroElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(heroElement.id, {
        ...heroTwoStyles.heroSection,
      });
    }
  }, [heroElement, updateStyles]);

  // 5) Merge global hero styles + highlight on drag
  const sectionStyles = {
    ...heroTwoStyles.heroSection,
    ...(heroElement?.styles || {}), // user-defined or dynamically-updated
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
  };

  // 6) Handle image drops (if you want images to be replaceable via drag-and-drop)
  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={sectionStyles}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {/* Render ALL Headings */}
      {children
        .filter((child) => child.type === 'heading')
        .map((child) => (
          <Heading
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...heroTwoStyles.heroTitle,
              ...(child.styles || {}),
            }}
          />
        ))}

      {/* Render ALL Paragraphs */}
      {children
        .filter((child) => child.type === 'paragraph')
        .map((child) => (
          <Paragraph
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...heroTwoStyles.heroDescription,
              ...(child.styles || {}),
            }}
          />
        ))}

      {/* Render ALL Images */}
      {children
        .filter((child) => child.type === 'image')
        .map((child) => (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{ ...(child.styles || {}) }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
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
              ...heroTwoStyles.primaryButton,
              ...(child.styles || {}),
            }}
          />
        ))}
    </section>
  );
};

export default HeroTwo;
