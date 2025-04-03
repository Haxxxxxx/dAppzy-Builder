// File: src/utils/htmlRenderUtils/RenderSections/renderSection.js

import {
  defaultSectionStyles,
  sectionTwoStyles,
  sectionThreeStyles,
  sectionFourStyles,
} from '../../../Elements/Sections/ContentSections/defaultSectionStyles';

/**
 * Unified render function for all section types.
 * The function groups children into parts (label/caption, heading, paragraph, buttons, image, features)
 * and then builds the HTML using the layout defined for each section type.
 * Only nonempty parts are output.
 */
export function renderSection(sectionElement, collectedStyles) {
  const { id, configuration, children = [], styles = {} } = sectionElement;

  // Define configuration mapping for each section type.
  // Each configuration defines:
  // - base: overall container style,
  // - subStyles: style rules for individual parts,
  // - layout: a function that returns the final HTML string using the available parts.
  const configMapping = {
    sectionOne: {
      base: defaultSectionStyles.sectionContainer,
      subStyles: {
        contentWrapper: defaultSectionStyles.contentWrapper,
        label: defaultSectionStyles.label,
        heading: defaultSectionStyles.heading,
        paragraph: defaultSectionStyles.paragraph,
        buttonContainer: defaultSectionStyles.buttonContainer,
        primaryButton: defaultSectionStyles.primaryButton,
        secondaryButton: defaultSectionStyles.secondaryButton,
        imageContainer: defaultSectionStyles.imageContainer,
        image: defaultSectionStyles.image,
      },
      layout: (parts) => `
        <section id="${id}" class="${id}">
          <div class="sectionContent">
            ${parts.label}
            ${parts.heading}
            ${parts.paragraph}
            ${parts.buttons ? `<div class="buttonContainer">${parts.buttons}</div>` : ''}
          </div>
          ${parts.image}
        </section>
      `.trim(),
    },
    sectionTwo: {
      base: sectionTwoStyles.sectionContainer,
      subStyles: {
        contentWrapper: sectionTwoStyles.contentWrapper,
        label: sectionTwoStyles.label,
        heading: sectionTwoStyles.heading,
        buttonContainer: sectionTwoStyles.buttonContainer,
        primaryButton: sectionTwoStyles.primaryButton,
        secondaryButton: sectionTwoStyles.secondaryButton,
      },
      layout: (parts) => `
        <section id="${id}" class="${id}">
          <div class="sectionContent">
            ${parts.label}
            ${parts.heading}
            ${parts.buttons ? `<div class="buttonContainer">${parts.buttons}</div>` : ''}
          </div>
        </section>
      `.trim(),
    },
    sectionThree: {
      base: sectionThreeStyles.sectionContainer,
      subStyles: {
        contentWrapper: sectionThreeStyles.contentWrapper,
        caption: sectionThreeStyles.caption,
        heading: sectionThreeStyles.heading,
        paragraph: sectionThreeStyles.paragraph,
      },
      layout: (parts) => `
        <section id="${id}" class="${id}">
          <div class="sectionContent">
            ${parts.caption}
            ${parts.heading}
            ${parts.paragraph}
          </div>
        </section>
      `.trim(),
    },
    sectionFour: {
      base: sectionFourStyles.sectionContainer,
      subStyles: {
        caption: sectionFourStyles.caption,
        heading: sectionFourStyles.heading,
        featuresContainer: sectionFourStyles.featuresContainer,
        featureItem: sectionFourStyles.featureItem,
        featureIcon: sectionFourStyles.featureIcon,
        featureHeading: sectionFourStyles.featureHeading,
        featureText: sectionFourStyles.featureText,
        primaryButton: sectionFourStyles.primaryButton,
      },
      layout: (parts) => `
        <section id="${id}" class="${id}">
          <div class="sectionContent">
            ${parts.caption}
            ${parts.heading}
            ${parts.features ? `<div class="featuresContainer">${parts.features}</div>` : ''}
            ${parts.button}
          </div>
        </section>
      `.trim(),
    },
  };

  // Determine current configuration; default to sectionOne.
  const config = configMapping[configuration] || configMapping['sectionOne'];

  // Group children into parts.
  const parts = {
    label: '',
    caption: '',
    heading: '',
    paragraph: '',
    buttons: '',
    button: '', // For SectionFour only (a single primary button)
    image: '',
    features: '',
  };

  children.forEach(child => {
    if (child.type === 'span') {
      if (configuration === 'sectionThree' || configuration === 'sectionFour') {
        if (!parts.caption) {
          parts.caption = `<span class="sectionCaption">${child.content || ''}</span>`;
        }
      } else if (!parts.label) {
        parts.label = `<span class="sectionLabel">${child.content || ''}</span>`;
      }
    } else if (child.type === 'heading') {
      if (!parts.heading) {
        parts.heading = `<h1 class="sectionHeading">${child.content || ''}</h1>`;
      }
    } else if (child.type === 'paragraph') {
      if (!parts.paragraph) {
        parts.paragraph = `<p class="sectionParagraph">${child.content || ''}</p>`;
      }
    } else if (child.type === 'button') {
      if (configuration === 'sectionFour') {
        if (!parts.button) {
          parts.button = `<button class="primaryButton">${child.content || ''}</button>`;
        }
      } else {
        // For sectionOne and sectionTwo, first button is primary, others secondary.
        if (!parts.buttons) {
          parts.buttons = `<button class="primaryButton">${child.content || ''}</button>`;
        } else {
          parts.buttons += `<button class="secondaryButton">${child.content || ''}</button>`;
        }
      }
    } else if (child.type === 'image') {
      if (!parts.image) {
        parts.image = `
          <div class="sectionImageContainer">
            <img class="sectionImage" src="${child.content || ''}" alt="">
          </div>
        `;
      }
    } else if (child.type === 'featureItem' && configuration === 'sectionFour') {
      let featureSubHtml = '';
      if (child.children && child.children.length > 0) {
        child.children.forEach(sub => {
          if (sub.type === 'icon') {
            featureSubHtml += `<div class="featureIcon"></div>`;
          } else if (sub.type === 'image') {
            featureSubHtml += `<div class="featureIcon"><img src="${sub.content || ''}" alt=""></div>`;
          } else if (sub.type === 'heading') {
            featureSubHtml += `<h3 class="featureHeading">${sub.content || ''}</h3>`;
          } else if (sub.type === 'paragraph') {
            featureSubHtml += `<p class="featureText">${sub.content || ''}</p>`;
          }
        });
      }
      parts.features += `<div class="featureItem">${featureSubHtml}</div>`;
    }
  });

  // Merge styles.
  const mergedStyles = {
    ...config.base,
    ...styles,
    '.sectionContent': { ...config.subStyles.contentWrapper },
    '.sectionLabel': { ...config.subStyles.label },
    '.sectionCaption': { ...config.subStyles.caption },
    '.sectionHeading': { ...config.subStyles.heading },
    '.sectionParagraph': { ...config.subStyles.paragraph },
    '.buttonContainer': { ...config.subStyles.buttonContainer },
    '.primaryButton': { ...config.subStyles.primaryButton },
    '.secondaryButton': { ...config.subStyles.secondaryButton },
    '.sectionImageContainer': { ...config.subStyles.imageContainer },
    '.sectionImage': { ...config.subStyles.image },
    '.featuresContainer': { ...config.subStyles.featuresContainer },
    '.featureItem': { ...config.subStyles.featureItem },
    '.featureIcon': { ...config.subStyles.featureIcon },
    '.featureHeading': { ...config.subStyles.featureHeading },
    '.featureText': { ...config.subStyles.featureText },
  };

  const className = `${id}`;
  collectedStyles.push({ className, styles: mergedStyles });

  // Return final HTML using the configuration's layout function.
  return config.layout(parts);
}
