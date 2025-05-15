import React, { useRef, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Span, Button, Image, LinkBlock, Anchor, Paragraph, Heading, List, ListItem, Blockquote, Code, Pre, Caption, Legend } from '../../SelectableElements';
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
        flexWrap: 'wrap',
        padding: '24px',
        backgroundColor: '#1a1a1a',
        color: '#fff',
      }}
      onClick={(e) => handleSelect(e)}
    >
      {resolvedChildren.map((child, index) => {
        if (!child) return null;

        const commonStyles = {
          cursor: 'text',
          border: 'none',
          outline: 'none',
          color: '#fff',
          flex: '0 0 auto',
        };

        switch (child.type) {
          case 'span':
            return (
              <Span
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                }}
              />
            );
          case 'button':
            return (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  backgroundColor: '#334155',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                }}
              />
            );
          case 'image':
            return (
              <Image
                key={child.id}
                id={child.id}
                src={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  width: '100%',
                  maxWidth: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  aspectRatio: '1/1',
                }}
                handleOpenMediaPanel={handleOpenMediaPanel}
                settings={child.settings || {}}
              />
            );
          case 'link':
          case 'linkBlock':
            return (
              <LinkBlock
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  color: '#60a5fa',
                  textDecoration: 'underline',
                }}
              />
            );
          case 'anchor':
            return (
              <Anchor
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  color: '#60a5fa',
                  textDecoration: 'underline',
                }}
              />
            );
          case 'paragraph':
            return (
              <Paragraph
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                }}
              />
            );
          case 'heading':
            return (
              <Heading
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                }}
              />
            );
          case 'list':
            return (
              <List
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                }}
              />
            );
          case 'listItem':
            return (
              <ListItem
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                }}
              />
            );
          case 'blockquote':
            return (
              <Blockquote
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  borderLeft: '4px solid #334155',
                  paddingLeft: '16px',
                  marginLeft: '0',
                }}
              />
            );
          case 'code':
            return (
              <Code
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  backgroundColor: '#334155',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              />
            );
          case 'pre':
            return (
              <Pre
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  backgroundColor: '#334155',
                  padding: '16px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                }}
              />
            );
          case 'caption':
            return (
              <Caption
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                }}
              />
            );
          case 'legend':
            return (
              <Legend
                key={child.id}
                id={child.id}
                content={child.content}
                styles={{
                  ...commonStyles,
                  ...child.styles,
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                }}
              />
            );
          default:
            return null;
        }
      })}
    </footer>
  );
};

export default SimpleFooter;
