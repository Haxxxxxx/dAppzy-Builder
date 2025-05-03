import React, { useRef, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, LinkBlock } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';

const DeFiFooter = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const navRef = useRef(null);
  const { elements, updateStyles } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  const footerElement = elements.find((el) => el.id === uniqueId);

  useEffect(() => {
    if (!footerElement) return;
    const noCustomStyles = !footerElement.styles || Object.keys(footerElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(footerElement.id, {
        backgroundColor: '#1a1a1a',
        color: '#222',
        borderTop: '1px solid #333',
        padding: '0'
      });
    }
  }, [footerElement, updateStyles]);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <footer
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        ...(footerElement?.styles || {}),
        borderTop: isOverCurrent ? '2px solid blue' : '1px solid #333',
      }}
      onClick={(e) => handleSelect(e)}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '24px',
        alignItems: 'center', 
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {children[0] && children[0].type === 'image' && (
            <Image
              key={children[0].id}
              id={children[0].id}
              src={children[0].content}
              styles={{
                ...children[0].styles,
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
              handleOpenMediaPanel={handleOpenMediaPanel}
              handleDrop={handleImageDrop}
            />
          )}
          {children[1] && children[1].type === 'span' && (
            <Span
              key={children[1].id}
              id={children[1].id}
              content={children[1].content}
              styles={{
                ...children[1].styles,
                cursor: 'text',
                border: 'none',
                outline: 'none',
              }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {children[2] && children[2].type === 'link' && (
            <LinkBlock
              key={children[2].id}
              id={children[2].id}
              content={children[2].content}
              styles={{
                ...children[2].styles,
                textDecoration: 'none',
                cursor: 'text',
              }}
            />
          )}
          {children[3] && children[3].type === 'link' && (
            <LinkBlock
              key={children[3].id}
              id={children[3].id}
              content={children[3].content}
              styles={{
                ...children[3].styles,
                textDecoration: 'none',
                cursor: 'text',
              }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {children[4] && children[4].type === 'link' && (
            <LinkBlock
              key={children[4].id}
              id={children[4].id}
              content={children[4].content}
              styles={{
                ...children[4].styles,
                textDecoration: 'none',
                cursor: 'text',
              }}
            />
          )}
          {children[5] && children[5].type === 'link' && (
            <LinkBlock
              key={children[5].id}
              id={children[5].id}
              content={children[5].content}
              styles={{
                ...children[5].styles,
                textDecoration: 'none',
                cursor: 'text',
              }}
            />
          )}
          {children[6] && children[6].type === 'link' && (
            <LinkBlock
              key={children[6].id}
              id={children[6].id}
              content={children[6].content}
              styles={{
                ...children[6].styles,
                textDecoration: 'none',
                cursor: 'text',
              }}
            />
          )}
        </div>
      </div>
    </footer>
  );
};

export default DeFiFooter; 