import React, { useContext, useRef } from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import useElementDrop from '../../../utils/useElementDrop';
import withSelectable from '../../../utils/withSelectable';
const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const HeroTwo = ({ uniqueId, children, onDropItem }) => {
  const sectionRef = useRef(null);
  const { heroTwo } = structureConfigurations;
  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  const title = children?.find((child) => child.type === 'span' && child.content === heroTwo.children[0].content) || heroTwo.children[0];
  const subtitle = children?.find((child) => child.type === 'span' && child.content === heroTwo.children[1].content) || heroTwo.children[1];
  const button = children?.find((child) => child.type === 'button' && child.content === heroTwo.children[2].content) || heroTwo.children[2];

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
        <SelectableSpan id={title.id || `title-${uniqueId}`} content={title.content} styles={title.styles || { fontSize: '2rem', fontWeight: 'bold' }} />

        <SelectableSpan id={subtitle.id || `subtitle-${uniqueId}`} content={subtitle.content} styles={subtitle.styles || { fontSize: '1.25rem', margin: '16px 0' }} />

        <SelectableButton id={button.id || `button-${uniqueId}`} content={button.content} styles={button.styles || { padding: '10px 20px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '4px' }} />
    </section>
  );
};

export default HeroTwo;
