import React, { useEffect, useState } from 'react';
import Span from '../../Texts/Span';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { TemplateFooterStyles } from './defaultFooterStyles.js';

const SelectableSpan = withSelectable(Span);
const SelectableImage = withSelectable(Image);

const TemplateFooter = ({ uniqueId, contentListWidth, children = [] }) => {
  const [isCompact, setIsCompact] = useState(false);

  // Load the `template` configuration
  const { template } = structureConfigurations;

  // Merge default children with overrides
  const mergedChildren = template.children.map((defaultChild, index) => {
    const overrideChild = children.find((child) => child.id === `${uniqueId}-footer-child-${index}`);
    return overrideChild || { ...defaultChild, id: `${uniqueId}-footer-child-${index}` };
  });

  // Split spans into two groups
  const spans = mergedChildren.filter((child) => child.type === 'span');
  const images = mergedChildren.filter((child) => child.type === 'image');

  const firstSpans = spans.slice(0, -2);
  const lastSpans = spans.slice(-2);

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
    >
      <div style={TemplateFooterStyles.templateSections}>
        {firstSpans.map((child) => (
          <SelectableSpan
            key={child.id}
            id={child.id}
            content={child.content}
            styles={child.styles || TemplateFooterStyles.span}
          />
        ))}
      </div>
      <div style={TemplateFooterStyles.middleSpans}>
        {lastSpans.map((child) => (
          <SelectableSpan
            key={child.id}
            id={child.id}
            content={child.content}
            styles={child.styles || TemplateFooterStyles.middleSpan}
          />
        ))}
      </div>
      <div style={TemplateFooterStyles.templateSocialIcons}>
        {images.map((child) => (
          <SelectableImage
            key={child.id}
            id={child.id}
            src={child.content}
            styles={child.styles || TemplateFooterStyles.socialIcon}
          />
        ))}
      </div>
    </footer>
  );
};

export default TemplateFooter;
