import React, { useRef, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Span, Button, Image, LinkBlock } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';

const SimpleFooter = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const navRef = useRef(null);
  const { elements, updateStyles, findElementById } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  const footerElement = findElementById(uniqueId, elements);

  useEffect(() => {
    if (!footerElement) return;
    const noCustomStyles = !footerElement.styles || Object.keys(footerElement.styles).length === 0;
    if (noCustomStyles) {
      updateStyles(footerElement.id, {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '24px',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      });
    }
  }, [footerElement, updateStyles]);

  // Always resolve children from state
  const resolvedChildren = (footerElement?.children || [])
    .map(childId => findElementById(childId, elements))
    .filter(Boolean);

  return (
    <footer
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        ...(footerElement?.styles || {}),
        borderTop: isOverCurrent ? '2px solid blue' : '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
      onClick={(e) => handleSelect(e)}
    >
      {resolvedChildren.map((child) => {
        if (!child) return null;
        if (child.type === 'span') {
          return (
            <Span
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...child.styles,
                cursor: 'text',
                border: 'none',
                outline: 'none',
              }}
            />
          );
        }
        if (child.type === 'button') {
          return (
            <Button
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...child.styles,
                backgroundColor: '#334155',
                color: '#ffffff',
                padding: '12px 24px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'text',
                borderRadius: '4px',
                outline: 'none',
              }}
            />
          );
        }
        if (child.type === 'image') {
          return (
            <Image
              key={child.id}
              id={child.id}
              src={child.content}
              styles={{
                ...child.styles,
                objectFit: 'cover',
                borderRadius: '8px',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              handleOpenMediaPanel={handleOpenMediaPanel}
            />
          );
        }
        if (child.type === 'link') {
          return (
            <LinkBlock
              key={child.id}
              id={child.id}
              content={child.content}
              styles={{
                ...child.styles,
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.9rem',
                cursor: 'text',
              }}
            />
          );
        }
        return null;
      })}
    </footer>
  );
};

export default SimpleFooter;
