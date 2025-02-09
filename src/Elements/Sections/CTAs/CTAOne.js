import React from "react";
import { structureConfigurations } from "../../../configs/structureConfigurations";
import { ctaOneStyles } from "./defaultCtaStyles.js";
import { Span, Button, Image } from "../../SelectableElements.js";

const CTAOne = ({ children = [], uniqueId, onDropItem, handleOpenMediaPanel, handleSelect }) => {
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
  const ctaTitle = findChild("title", 0);
  const ctaDescription = findChild("paragraph", 1);
  const ctaPrimaryButton = findChild("button", 2);
  const ctaSecondaryButton = findChild("button", 3);
  const ctaImage = findChild("image", 4);

  return (
    <section
      style={ctaOneStyles.cta}
      onClick={(e) => handleSelect(e)}
    >
      <div style={ctaOneStyles.ctaContent}>
        {/* Title */}
        {ctaTitle.content && (
          <Span
            id={ctaTitle.id || `default-title-${uniqueId}`}
            content={ctaTitle.content}
            styles={ctaTitle.styles || ctaOneStyles.ctaTitle}
          />
        )}

        {/* Description */}
        {ctaDescription.content && (
          <Span
            id={ctaDescription.id || `default-description-${uniqueId}`}
            content={ctaDescription.content}
            styles={ctaDescription.styles || ctaOneStyles.ctaDescription}
          />
        )}

        {/* Buttons */}
        <div style={ctaOneStyles.buttonContainer}>
          {ctaPrimaryButton.content && (
            <Button
              id={ctaPrimaryButton.id || `default-button-${uniqueId}`}
              content={ctaPrimaryButton.content}
              styles={ctaPrimaryButton.styles || ctaOneStyles.primaryButton}
            />
          )}

          {ctaSecondaryButton.content && (
            <Button
              id={ctaSecondaryButton.id || `default-secondary-button-${uniqueId}`}
              content={ctaSecondaryButton.content}
              styles={ctaSecondaryButton.styles || ctaOneStyles.secondaryButton}
            />
          )}
        </div>
      </div>

      {/* Optional Image */}
      {ctaImage.content && (
        <Image
          id={ctaImage.id || `default-image-${uniqueId}`}
          src={ctaImage.content}
          styles={ctaImage.styles || ctaOneStyles.ctaImage}
        />
      )}
    </section>
  );
};

export default CTAOne;
