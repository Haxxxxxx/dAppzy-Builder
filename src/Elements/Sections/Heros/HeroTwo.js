import React, { useContext, useRef } from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import useElementDrop from '../../../utils/useElementDrop';
import RemovableWrapper from '../../../utils/RemovableWrapper';
import { EditableContext } from '../../../context/EditableContext';

const HeroTwo = ({ uniqueId, children, onDropItem }) => {
  const sectionRef = useRef(null);
  const { heroTwo } = structureConfigurations;
  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // Find child elements or use defaults from the configuration
  const title =
    children?.find((child) => child.type === 'span' && child.content === heroTwo.children[0].content) ||
    heroTwo.children[0];

  const subtitle =
    children?.find((child) => child.type === 'span' && child.content === heroTwo.children[1].content) ||
    heroTwo.children[1];

  const button =
    children?.find((child) => child.type === 'button' && child.content === heroTwo.children[2].content) ||
    heroTwo.children[2];

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={{
        backgroundColor: '#6B7280',
        color: '#fff',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: '8px',
        border: isOverCurrent ? '2px dashed blue' : 'none',
      }}
    >
      {/* Render Title */}
      <RemovableWrapper id={title.id || `title-${uniqueId}`}>
        <Span
          id={title.id || `title-${uniqueId}`}
          content={title.content}
          styles={title.styles || { fontSize: '2rem', fontWeight: 'bold' }}
        />
      </RemovableWrapper>

      {/* Render Subtitle */}
      <RemovableWrapper id={subtitle.id || `subtitle-${uniqueId}`}>
        <Span
          id={subtitle.id || `subtitle-${uniqueId}`}
          content={subtitle.content}
          styles={subtitle.styles || { fontSize: '1.25rem', margin: '16px 0' }}
        />
      </RemovableWrapper>

      {/* Render Button */}
      <RemovableWrapper id={button.id || `button-${uniqueId}`}>
        <Button
          id={button.id || `button-${uniqueId}`}
          content={button.content}
          styles={button.styles || { padding: '10px 20px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '4px' }}
        />
      </RemovableWrapper>
    </section>
  );
};

export default HeroTwo;
