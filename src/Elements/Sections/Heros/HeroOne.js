import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Button, Heading, Paragraph } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultHeroStyles } from './defaultHeroStyles';

const HeroOne = ({   
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const heroRef = useRef(null);

  // Access global context
  const { elements, updateStyles } = useContext(EditableContext);

  // Memoize hero element to avoid recalculations
  const heroElement = useMemo(() => elements.find((el) => el.id === uniqueId), [elements, uniqueId]);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: heroRef,
    onDropItem,
  });

  // Apply default styles only once
  useEffect(() => {
    if (!heroElement || heroElement.styles?.applied) return;

    const noCustomStyles = !heroElement.styles || Object.keys(heroElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(heroElement.id, {
        ...defaultHeroStyles.hero,
        applied: true, // Add flag to mark as styled
      });
    }
  }, [heroElement, updateStyles]);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <section
      ref={(node) => {
        heroRef.current = node;
        drop(node);
      }}
      style={{
        ...defaultHeroStyles.hero,
        ...(heroElement?.styles || {}),
      }}
      onClick={(e) => handleSelect(e)}
    >
      <div style={defaultHeroStyles.heroContent}>
        {children
          .filter((child) => child?.type === 'heading')
          .map((child) => (
            <Heading
              key={child.id}
              id={child.id}
              content={child.content}
              styles={child.styles || defaultHeroStyles.heroTitle}
            />
          ))}

        {children
          .filter((child) => child?.type === 'paragraph')
          .map((child) => (
            <Paragraph
              key={child.id}
              id={child.id}
              content={child.content}
              styles={child.styles || defaultHeroStyles.heroDescription}
            />
          ))}

        <div style={defaultHeroStyles.buttonContainer}>
          {children
            .filter((child) => child?.type === 'button')
            .map((child) => (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={child.styles || defaultHeroStyles.primaryButton}
              />
            ))}
        </div>
      </div>

      <div style={defaultHeroStyles.heroImageContainer}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <Image
              key={child.id}
              id={child.id}
              src={child.content}
              styles={child.styles || defaultHeroStyles.heroImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={(item) => onDropItem(item, child.id)}
            />
          ))}
      </div>
    </section>
  );
};

export default HeroOne;
