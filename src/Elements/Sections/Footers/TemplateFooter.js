import React, { useRef, useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { TemplateFooterStyles } from './defaultFooterStyles.js';
import { Image, Span, Div } from '../../SelectableElements';

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

  // Access elements & updateStyles from context
  const { elements, updateStyles } = useContext(EditableContext);

  // Make footer droppable
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem,
  });

  // Find the footer element in global state by ID
  const footerElement = elements.find((el) => el.id === uniqueId);

  // Apply default styles if none exist
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

  // Responsive breakpoint
  useEffect(() => {
    setIsCompact(contentListWidth < 768);
  }, [contentListWidth]);

  // Handle drag-and-drop image replacement
  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  // Merge local + custom + highlight if dragging
  const footerStyles = {
    ...TemplateFooterStyles.footer,
    ...(footerElement?.styles || {}),
    ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
    flexDirection: isCompact ? 'column' : 'row',
    textAlign: isCompact ? 'center' : 'left',
    alignItems: 'center',
  };

  // Separate children into different categories
  const navigationLinks = children.filter(child => 
    child.type === 'span' && child.styles?.fontSize === '1rem' && child.styles?.color === '#E5E7EB'
  );
  
  const brandingElements = children.filter(child => 
    child.type === 'span' && child.styles?.fontSize === '1.1rem' && child.styles?.fontWeight === 'bold'
  );
  
  const copyrightText = children.filter(child => 
    child.type === 'span' && child.styles?.fontSize === '0.9rem' && child.styles?.color === '#9CA3AF'
  );
  
  const socialImages = children.filter(child => child.type === 'image');

  return (
    <footer
      ref={(node) => {
        footerRef.current = node;
        drop(node);
      }}
      style={footerStyles}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {/* Navigation Links Section */}
      <Div
        id={`${uniqueId}-navigation`}
        styles={{
          ...TemplateFooterStyles.navigationLinks,
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0',
          padding: '0',
          whiteSpace: 'nowrap',
          flexWrap: 'nowrap',
        }}
      >
        {navigationLinks.map((child) => (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...TemplateFooterStyles.link,
              ...(child.styles || {}),
              whiteSpace: 'nowrap',
            }}
          />
        ))}
      </Div>

      {/* Branding Section */}
      <Div
        id={`${uniqueId}-branding`}
        styles={TemplateFooterStyles.branding}
      >
        {brandingElements.map((child) => (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...TemplateFooterStyles.branding,
              ...(child.styles || {}),
            }}
          />
        ))}
      </Div>

      {/* Social Media Section */}
      <Div
        id={`${uniqueId}-social`}
        styles={TemplateFooterStyles.socialIcons}
      >
        {socialImages.map((child) => (
          <Image
            key={child.id}
            id={child.id}
            src={child.content}
            styles={{
              ...TemplateFooterStyles.socialIcons,
              ...(child.styles || {}),
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        ))}
      </Div>

      {/* Copyright Section */}
      <Div
        id={`${uniqueId}-copyright`}
        styles={{
          width: '100%',
          textAlign: 'center',
          paddingTop: '16px',
          margin: '0',
        }}
      >
        {copyrightText.map((child) => (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
            styles={{
              ...TemplateFooterStyles.copyright,
              ...(child.styles || {}),
            }}
          />
        ))}
      </Div>
    </footer>
  );
};

export default TemplateFooter;
