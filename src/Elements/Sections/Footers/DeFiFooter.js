import React, { useContext } from 'react';
import { useDrop } from 'react-dnd';
import { EditableContext } from '../../../context/EditableContext';
import { Span, Image, LinkBlock } from '../../SelectableElements';

const DeFiFooter = ({ id, children, styles: customStyles }) => {
  const { findElementById, elements } = useContext(EditableContext);
  const footerElement = findElementById(id, elements);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['image', 'span', 'link'],
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }));

  // Get the first child (image)
  const imageChild = children?.[0];
  // Get the second child (span)
  const spanChild = children?.[1];
  // Get all remaining children (links)
  const linkChildren = children?.slice(2) || [];

  return (
    <div style={{ position: 'relative', boxSizing: 'border-box' }}>
      <footer
        ref={drop}
        style={{
          ...footerElement?.styles,
          ...customStyles,
          borderTop: footerElement?.styles?.borderTop || '1px solid #e5e5e5',
          position: 'relative',
          padding: footerElement?.styles?.padding || '1rem',
          backgroundColor: footerElement?.styles?.backgroundColor || '#ffffff',
          color: footerElement?.styles?.color || '#1a1a1a',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '1rem'
          }}
        >
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
                    color: 'inherit'
                  }}
                />
              </div>
            )}
          </div>
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
                    display: 'inline-block'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeFiFooter; 