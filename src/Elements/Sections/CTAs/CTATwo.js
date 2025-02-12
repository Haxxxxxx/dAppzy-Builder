import React from 'react';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { ctaTwoStyles } from './defaultCtaStyles';
import { Button, Span } from '../../SelectableElements';

const CTATwo = ({ children = [], uniqueId, onDropItem, handleOpenMediaPanel, handleSelect }) => {
  const { ctaTwo } = structureConfigurations;


  const findChild = (type, defaultIndex) => {
    return (
      children.find((child) => child.type === type) ||
      ctaTwo.children[defaultIndex] || // Fallback to default configuration
      {}
    );
  };

  const titleChild = findChild('title', 0);
  const primaryButton = findChild('button', 1);
  const secondaryButton = findChild('button', 2);

  return (
    <section style={ctaTwoStyles.cta} onClick={(e) => handleSelect(e)}  // if you need the event explicitly
    >
      {titleChild && (
        <Span
          id={titleChild.id}
          content={titleChild.content}
          styles={ctaTwoStyles.ctaTitle}
        />
      )}
      <div style={ctaTwoStyles.buttonContainer}>
        {primaryButton && (
          <Button
            id={primaryButton.id}
            content={primaryButton.content}
            styles={ctaTwoStyles.primaryButton}
          />
        )}
        {secondaryButton && (
          <Button
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
