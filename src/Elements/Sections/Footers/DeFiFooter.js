import React, { useContext } from 'react';
import { useDrop } from 'react-dnd';
import { Span, Image, LinkBlock } from '../../SelectableElements';
import { EditableContext } from '../../../context/EditableContext';

const DeFiFooter = ({ id, children, styles: customStyles, onDropItem }) => {
  const { findElementById, elements } = useContext(EditableContext);
  const footerElement = findElementById(id, elements);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['image', 'span', 'link'],
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      onDropItem(item, id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }));

  // Find children
  const imageChild = children?.find(child => child.type === 'image');
  const spanChild = children?.find(child => child.type === 'span');
  const linkChildren = children?.filter(child => child.type === 'link') || [];

  return (
    <div style={{ position: 'relative', boxSizing: 'border-box' }}>
    <footer
        ref={drop}
      style={{
        ...(footerElement?.styles || {}),
          ...Object.fromEntries(Object.entries(customStyles || {}).filter(([k]) => !(footerElement?.styles && k in footerElement.styles))),
          borderTop: (footerElement?.styles && footerElement.styles.borderTop) || (customStyles && customStyles.borderTop) || 'none',
          position: 'relative',
          padding: (footerElement?.styles && footerElement.styles.padding) || (customStyles && customStyles.padding) || '1rem',
          backgroundColor: (footerElement?.styles && footerElement.styles.backgroundColor) || (customStyles && customStyles.backgroundColor) || '#ffffff',
          color: (footerElement?.styles && footerElement.styles.color) || (customStyles && customStyles.color) || '#1a1a1a',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Left section wrapper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {imageChild && (
            <div style={{ position: 'relative', boxSizing: 'border-box' }}>
          <Image
                id={imageChild.id}
                content={imageChild.content}
            styles={{
                  ...imageChild.styles,
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  borderRadius: '8px'
            }}
          />
      </div>
          )}
          {spanChild && (
            <div style={{ position: 'relative', boxSizing: 'border-box' }}>
              <Span
                id={spanChild.id}
                content={spanChild.content}
            styles={{
                  ...spanChild.styles,
                  color: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: '400'
            }}
          />
            </div>
        )}
      </div>

        {/* Right section wrapper */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {linkChildren.map((child) => (
            <div key={child.id} style={{ position: 'relative', boxSizing: 'border-box' }}>
              <LinkBlock
                id={child.id}
                content={child.content}
                styles={{
                  ...child.styles,
                  color: 'inherit',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  display: 'inline-block'
                }}
              />
            </div>
          ))}
      </div>
    </footer>
    </div>
  );
};

export default DeFiFooter; 