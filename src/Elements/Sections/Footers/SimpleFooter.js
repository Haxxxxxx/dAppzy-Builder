import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';

// Import your default styles
import { SimplefooterStyles } from './defaultFooterStyles';

// Import your selectable elements
import { Span, Button, Image } from '../../SelectableElements';

const SimpleFooter = ({
  uniqueId,
  children = [],
  handleSelect,
  onDropItem,
}) => {
  const footerRef = useRef(null);

  // 1) Access global context for elements & style updates
  const { elements, updateStyles } = useContext(EditableContext);

  // 2) Make the footer droppable, if you want to drag new elements onto it
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem,
  });

  // 3) Find the footer element in global state
  const footerElement = elements.find((el) => el.id === uniqueId);

  // 4) Apply default styles if no custom styles exist yet
  useEffect(() => {
    if (!footerElement) return;

    const noCustomStyles =
      !footerElement.styles || Object.keys(footerElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(footerElement.id, {
        ...SimplefooterStyles.simpleFooter,
      });
    }
  }, [footerElement, updateStyles]);

  // 5) Render the footer
  return (
    <footer
      ref={(node) => {
        footerRef.current = node;
        drop(node);
      }}
      style={{
        // Merge your default style plus the element’s own styles
        ...SimplefooterStyles.simpleFooter,
        ...(footerElement?.styles || {}),
        border: isOverCurrent
          ? '2px solid blue'
          : SimplefooterStyles.simpleFooter.border,
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {/* Map over the children. 
          Because you already created them in addNewElement(...) with
          type: 'span', 'button', or 'image', just render them here. */}
      {children.map((child) => {
        switch (child.type) {
          case 'span':
            return (
              <Span
                key={child.id}
                id={child.id}
                content={child.content}
                styles={child.styles || SimplefooterStyles.companyInfo}
              />
            );
          case 'button':
            return (
              <Button
                key={child.id}
                id={child.id}
                content={child.content}
                styles={child.styles || SimplefooterStyles.socialButton}
              />
            );
          case 'image':
            return (
              <Image
                key={child.id}
                id={child.id}
                src={child.content}
                styles={child.styles || SimplefooterStyles.socialButton}
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
