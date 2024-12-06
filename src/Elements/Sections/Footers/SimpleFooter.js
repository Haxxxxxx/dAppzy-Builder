import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { SimplefooterStyles } from './defaultFooterStyles.js';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);

const SimpleFooter = ({ uniqueId, children = [] }) => {
  const { simple } = structureConfigurations;

  // Merge default children with overrides
  const mergedChildren = simple.children.map((defaultChild, index) => {
    const overrideChild = children.find((child) => child.type === defaultChild.type);
    return overrideChild || { ...defaultChild, id: `${uniqueId}-footer-child-${index}` };
  });

  return (
    <footer style={SimplefooterStyles.simpleFooter}>
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

export default SimpleFooter;
