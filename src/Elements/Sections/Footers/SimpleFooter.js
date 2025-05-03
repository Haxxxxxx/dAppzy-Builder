import React, { useRef, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Span, Button } from '../../SelectableElements';
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
        color: '#fff',
        padding: '24px',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      });
    }
  }, [footerElement, updateStyles]);

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
      <div style={{ position: 'relative', boxSizing: 'border-box' }}>
        {children[0] && children[0].type === 'span' && (
          <Span
            key={children[0].id}
            id={children[0].id}
            content={children[0].content}
            styles={{
              ...children[0].styles,
              cursor: 'text',
              border: 'none',
              outline: 'none',
            }}
          />
        )}
      </div>
      <div style={{ position: 'relative', boxSizing: 'border-box' }}>
        {children[1] && children[1].type === 'button' && (
          <Button
            key={children[1].id}
            id={children[1].id}
            content={children[1].content}
            styles={{
              ...children[1].styles,
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
        )}
      </div>
    </footer>
  );
};

export default SimpleFooter;
