import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { ctaOneStyles } from './defaultCtaStyles.js';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const CTAOne = ({ children = [], uniqueId, onDropItem, handleOpenMediaPanel,handleSelect }) => {
  const { ctaOne } = structureConfigurations;

  // Helper function to find a child or fallback to default
  const findChild = (type, defaultIndex) => {
    return (
      children.find((child) => child.type === type) ||
      ctaOne.children[defaultIndex] || // Fallback to default configuration
      {}
    );
  };

  // Retrieve content or fallbacks
  const ctaTitle = findChild('title', 0);
  const ctaDescription = findChild('paragraph', 1);
  const ctaButton = findChild('button', 2);

  return (
    <section style={ctaOneStyles.cta}      onClick={(e) => handleSelect(e)}  // if you need the event explicitly
>
      {/* Title */}
      {ctaTitle.content && (
        <SelectableSpan
          id={ctaTitle.id || `default-title-${uniqueId}`}
          content={ctaTitle.content}
          styles={ctaTitle.styles || ctaOneStyles.ctaTitle}
        />
      )}

      {/* Description */}
      {ctaDescription.content && (
        <SelectableSpan
          id={ctaDescription.id || `default-description-${uniqueId}`}
          content={ctaDescription.content}
          styles={ctaDescription.styles || ctaOneStyles.ctaDescription}
        />
      )}

      {/* Button */}
      {ctaButton.content && (
        <SelectableButton
          id={ctaButton.id || `default-button-${uniqueId}`}
          content={ctaButton.content}
          styles={ctaButton.styles || ctaOneStyles.primaryButton}
        />
      )}
    </section>
  );
};

export default CTAOne;
