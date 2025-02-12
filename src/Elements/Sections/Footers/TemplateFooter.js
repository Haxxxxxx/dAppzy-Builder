import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { TemplateFooterStyles } from './defaultFooterStyles.js';
import { Image, Span } from '../../SelectableElements';

/**
 * A "TemplateFooter" component that:
 *  - Finds the footer element in global state by id.
 *  - Merges default styles from TemplateFooterStyles (if none are set).
 *  - Groups children into navigationLinks, branding, socialIcons, etc.
 *  - Supports a compact layout on small screens, just like the navbars.
 */
const TemplateFooter = ({
  uniqueId,
  contentListWidth,
  children = [],
  onDropItem,
  handleOpenMediaPanel,
  handleSelect,
}) => {
  const footerRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);

  // 1) Access "elements" and "updateStyles" from context
  const { elements, updateStyles } = useContext(EditableContext);

  // 2) DnD drop logic for placing new items into the footer
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem,
  });

  // 3) Find the footer element in global state by its ID
  const footerElement = elements.find((el) => el.id === uniqueId);

  // 4) If the footer has no custom styles yet, apply the default style from TemplateFooterStyles
  useEffect(() => {
    if (!footerElement) return;

    const noCustomStyles =
      !footerElement.styles || Object.keys(footerElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(footerElement.id, {
        ...TemplateFooterStyles.footer,
      });
    }
  }, [footerElement, updateStyles]);

  // 5) Handle responsive layout
  useEffect(() => {
    setIsCompact(contentListWidth < 768); // Adjust this breakpoint as needed
  }, [contentListWidth]);

  // 6) Group the children for a "template" layout (navigation, branding, social icons, etc.)
  const spanChildren = children.filter((child) => child.type === 'span');
  const imageChildren = children.filter((child) => child.type === 'image');

  // For example, let's say the first 3 spans are "navigationLinks,"
  // the 4th is "branding," the 5th is "copyright."
  const navigationLinks = spanChildren.slice(0, 3);
  const branding = spanChildren[3];
  const copyright = spanChildren[4];
  const socialIcons = imageChildren; // all images

  // 7) Render
  return (
    <footer
      ref={(node) => {
        footerRef.current = node;
        drop(node);
      }}
      // Merge the default style object with the user's custom styles
      style={{
        ...TemplateFooterStyles.footer,
        ...(footerElement?.styles || {}),
        // highlight the drop area if something is hovering
        border: isOverCurrent ? '2px solid blue' : TemplateFooterStyles.footer.border,
        flexDirection: isCompact ? 'column' : 'row',
        textAlign: isCompact ? 'center' : 'left',
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {/* Left: Navigation Links */}
      <div style={TemplateFooterStyles.navigationLinks}>
        {navigationLinks.map((child) => (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            // If child.styles is defined, merge it; otherwise use some default link style
            styles={child.styles || TemplateFooterStyles.link}
          />
        ))}
      </div>

      {/* Center: Branding */}
      <div style={TemplateFooterStyles.branding}>
        {branding && (
          <Span
            key={branding.id}
            id={branding.id}
            content={branding.content}
            styles={branding.styles || TemplateFooterStyles.brandingText}
          />
        )}
      </div>

      {/* Right: Social Icons */}
      <div style={TemplateFooterStyles.socialIcons}>
        {socialIcons.map((child) => (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={child.styles}
            handleOpenMediaPanel={handleOpenMediaPanel}
            // If you want a drop handler for images, pass it in:
            handleDrop={(droppedItem) => {
              if (droppedItem.mediaType === 'image') {
                onDropItem(child.id, droppedItem.src);
              }
            }}
          />
        ))}
      </div>

      {/* Bottom: Copyright (only visible if isCompact) */}
      {isCompact && copyright && (
        <div style={TemplateFooterStyles.copyright}>
          <Span
            key={copyright.id}
            id={copyright.id}
            content={copyright.content}
            styles={copyright.styles || TemplateFooterStyles.copyrightText}
          />
        </div>
      )}
    </footer>
  );
};

export default TemplateFooter;
