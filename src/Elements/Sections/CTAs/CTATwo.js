import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { ctaTwoStyles } from './defaultCtaStyles';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const CTATwo = ({ uniqueId, children = [] }) => {
  const { ctaTwo } = structureConfigurations;

  // Merge default children from structureConfigurations with any overrides
  const mergedChildren = ctaTwo.children.map((defaultChild, index) => {
    const overrideChild = children.find((child) => child.type === defaultChild.type);
    return overrideChild || { ...defaultChild, id: `${uniqueId}-cta-child-${index}` };
  });

  const titleChild = mergedChildren.find((child) => child.type === 'span');
  const [primaryButton, secondaryButton] = mergedChildren.filter((child) => child.type === 'button');

  return (
    <section style={ctaTwoStyles.cta}>
      {titleChild && (
        <SelectableSpan
          id={titleChild.id}
          content={titleChild.content}
          styles={ctaTwoStyles.ctaTitle}
        />
      )}
      <div style={ctaTwoStyles.buttonContainer}>
        {primaryButton && (
          <SelectableButton
            id={primaryButton.id}
            content={primaryButton.content}
            styles={ctaTwoStyles.primaryButton}
          />
        )}
        {secondaryButton && (
          <SelectableButton
            id={secondaryButton.id}
            content={secondaryButton.content}
            styles={ctaTwoStyles.secondaryButton}
          />
        )}
      </div>
    </section>
  );
};

export default CTATwo;
