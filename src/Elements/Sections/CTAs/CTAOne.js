import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { ctaOneStyles } from './defaultCtaStyles.js';
const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const CTAOne = ({ uniqueId, children = [] }) => {
  const { ctaOne } = structureConfigurations;

  const mergedChildren = ctaOne.children.map((defaultChild, index) => {
    const overrideChild = children.find((child) => child.type === defaultChild.type);
    return overrideChild || { ...defaultChild, id: `${uniqueId}-cta-child-${index}` };
  });

  const [titleChild, descriptionChild, buttonChild] = mergedChildren;

  return (
    <section style={ctaOneStyles.cta}>
      {titleChild && (
        <SelectableSpan
          id={titleChild.id}
          content={titleChild.content}
          styles={ctaOneStyles.ctaTitle}
        />
      )}
      {descriptionChild && (
        <SelectableSpan
          id={descriptionChild.id}
          content={descriptionChild.content}
          styles={ctaOneStyles.ctaDescription}
        />
      )}
      {buttonChild && (
        <SelectableButton
          id={buttonChild.id}
          content={buttonChild.content}
          styles={ctaOneStyles.primaryButton}
        />
      )}
    </section>
  );
};

export default CTAOne;
