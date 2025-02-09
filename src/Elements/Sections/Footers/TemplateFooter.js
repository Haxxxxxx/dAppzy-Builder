import React, { useEffect, useState } from 'react';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { TemplateFooterStyles } from './defaultFooterStyles.js';
import { Image, Span } from '../../SelectableElements';

const TemplateFooter = ({ uniqueId, contentListWidth, children = [], handleSelect }) => {
  const [isCompact, setIsCompact] = useState(false);

  // Load the `template` configuration
  const { template } = structureConfigurations;

  // Merge default children with overrides
  const mergedChildren = template.children.map((defaultChild, index) => {
    const overrideChild = children.find((child) => child.id === `${uniqueId}-footer-child-${index}`);
    return overrideChild || { ...defaultChild, id: `${uniqueId}-footer-child-${index}` };
  });

  // Extract spans and images
  const spans = mergedChildren.filter((child) => child.type === 'span');
  const images = mergedChildren.filter((child) => child.type === 'image');

  // Organizing sections
  const navigationLinks = spans.slice(0, 3);
  const branding = spans[3];
  const copyright = spans[4];

  // Update `isCompact` state based on `contentListWidth`
  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust breakpoint as needed
    }
  }, [contentListWidth]);

  return (
    <footer
      style={{
        ...TemplateFooterStyles.footer,
        flexDirection: isCompact ? 'column' : 'row',
        textAlign: isCompact ? 'center' : 'left',
      }}
      onClick={(e) => handleSelect(e)}
    >
      {/* Left: Navigation Links */}
      <div style={TemplateFooterStyles.navigationLinks}>
        {navigationLinks.map((child) => (
          <Span
            key={child.id}
            id={child.id}
            content={child.content}
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
        {images.map((child) => (
          <Image key={child.id} id={child.id} src={child.content} styles={child.styles} />
        ))}
      </div>

      {/* Bottom: Copyright */}
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
