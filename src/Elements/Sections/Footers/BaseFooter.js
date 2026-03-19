import React, { useContext, useMemo, useRef, forwardRef } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { Div, Heading, Paragraph, Button, Span, LinkBlock, Icon, HFlexLayout } from '../../SelectableElements';

const FooterWithRef = forwardRef((props, ref) => (
  <footer {...props} ref={ref} />
));

const BaseFooter = forwardRef(({ handleSelect, uniqueId, defaultStyles }, ref) => {
  const footerRef = useRef(null);
  const { elements, findElementById, addNewElement } = useContext(EditableContext);

  const footerElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem: (item) => addNewElement(item.type, item.level || 1, null, uniqueId),
  });

  const renderFooterChildren = (parentId) => {
    const parent = findElementById(parentId, elements);
    if (!parent || !parent.children) return null;
    return parent.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;
      switch (child.type) {
        case 'hflex':
        case 'hflexLayout':
          return <HFlexLayout key={child.id} id={child.id} />;
        case 'icon':
          return <Icon key={child.id} id={child.id} styles={child.styles} />;
        case 'linkblock':
          return <LinkBlock key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'div':
          return (
            <Div key={child.id} id={child.id} styles={child.styles}>
              {renderFooterChildren(child.id)}
            </Div>
          );
        case 'heading':
          return <Heading key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'paragraph':
          return <Paragraph key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'span':
          return <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'button':
          return <Button key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        default:
          return null;
      }
    });
  };

  const mergedStyles = { ...defaultStyles.footerSection, ...(footerElement?.styles || {}) };

  return (
    <FooterWithRef
      id={uniqueId}
      style={{
        ...mergedStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
      }}
      ref={(node) => {
        footerRef.current = node;
        drop(node);
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
    >
      {renderFooterChildren(uniqueId)}
    </FooterWithRef>
  );
});

BaseFooter.displayName = 'BaseFooter';

export default BaseFooter;
