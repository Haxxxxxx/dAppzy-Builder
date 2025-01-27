import React from 'react';
import Span from '../../Typography/Span.js';
import Button from '../../Basic/Button.js';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { SimplefooterStyles } from './defaultFooterStyles.js';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);

const DetailedFooter = ({ uniqueId, children = [], handleSelect }) => {
  const { detailed } = structureConfigurations;

  // Merge default children with overrides
  const mergedChildren = detailed.children.map((defaultChild, index) => {
    const overrideChild = children.find((child) => child.type === defaultChild.type);
    return overrideChild || { ...defaultChild, id: `${uniqueId}-footer-child-${index}` };
  });

  return (
    <footer style={SimplefooterStyles.detailedFooter} onClick={(e) => handleSelect(e)}  // if you need the event explicitly
    >
      {mergedChildren.map((child) => {
        switch (child.type) {
          case 'span':
            return (
              <SelectableSpan
                key={child.id}
                id={child.id}
                content={child.content}
                styles={child.styles || SimplefooterStyles.companyInfo}
              />
            );
          case 'button':
            return (
              <SelectableButton
                key={child.id}
                id={child.id}
                content={child.content}
                styles={child.styles || SimplefooterStyles.socialButton}
              />
            );
          case 'image':
            return (
              <SelectableImage
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

export default DetailedFooter;
