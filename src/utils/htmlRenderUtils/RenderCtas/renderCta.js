import { defaultCtaStyles, ctaOneStyles, ctaTwoStyles } from '../../../Elements/Sections/CTAs/defaultCtaStyles';
import { renderElementToHtml } from '../../htmlRender';

export function renderCta(ctaElement, collectedStyles) {
  const { id, configuration, children = [], styles = {} } = ctaElement;

  // Select the correct CTA style configuration
  let ctaStyles = { ...defaultCtaStyles.cta }; // Default global CTA styles
  if (configuration === 'ctaOne') {
    ctaStyles = { ...ctaStyles, ...ctaOneStyles.ctaSection }; // Merge CTAOne styles properly
  } else if (configuration === 'ctaTwo') {
    ctaStyles = { ...ctaStyles, ...ctaTwoStyles.ctaSection }; // Merge CTA Two styles
  }

  // Categorizing children elements
  let titleHtml = '';
  let descriptionHtml = '';
  let buttonHtmls = [];
  let imageHtml = '';

  children.forEach((child) => {
    const childHtml = renderElementToHtml(child, collectedStyles);

    if (child.type === 'title' && !titleHtml) {
      titleHtml = `<h2 class="ctaHeading">${child.content}</h2>`;
    } else if (child.type === 'paragraph' && !descriptionHtml) {
      descriptionHtml = `<p class="ctaDescription">${child.content}</p>`;
    } else if (child.type === 'button') {
      // Determine button styles for ctaOne vs ctaTwo
      const buttonClass = `cta-${id}-button`;
      let buttonStyles = configuration === 'ctaOne' ? ctaOneStyles.buttonContainer : ctaTwoStyles.primaryButton;

      collectedStyles.push({
        className: buttonClass,
        styles: {
          ...buttonStyles, // Apply CTA-specific button styles
          ...child.styles, // Merge user-defined styles
        },
      });

      buttonHtmls.push(`<button class="${buttonClass}">${child.content}</button>`);
    } else if (child.type === 'image') {
      imageHtml = `<div class="ctaImageContainer">
        <img class="ctaImage" src="${child.content}" />
      </div>`;
    }
  });

  // Ensure styles merge correctly without overriding defaults
  const mergedStyles = {
    ...defaultCtaStyles.cta, // Apply global styles
    ...ctaStyles, // Apply CTA-specific styles
    ...styles, // Apply user-defined styles
    '.ctaSection': configuration === 'ctaTwo' ? ctaTwoStyles.ctaSection : ctaOneStyles.ctaSection,
    '.ctaHeading': configuration === 'ctaTwo' ? ctaTwoStyles.ctaTitle : ctaOneStyles.heading,
    '.ctaDescription': configuration === 'ctaTwo' ? ctaTwoStyles.ctaDescription : ctaOneStyles.description,
    '.buttonContainer': ctaTwoStyles.buttonContainer,
    '.ctaImageContainer': ctaTwoStyles.ctaImageContainer,
    '.ctaImage': ctaTwoStyles.ctaImage,
    '.ctaContent' : ctaTwoStyles.ctaContent,
  };

  collectedStyles.push({ className: `cta-${id}`, styles: mergedStyles });

  // **🔹 Conditionally render `ctaContent` only if needed**
  const ctaContentHtml =
    titleHtml || descriptionHtml || buttonHtmls.length > 0
      ? `
        <div class="ctaContent">
          ${titleHtml}
          ${descriptionHtml}
          <div class="buttonContainer">
            ${buttonHtmls.join('\n')}
          </div>
        </div>
      `
      : titleHtml + descriptionHtml + `<div class="buttonContainer">${buttonHtmls.join('\n')}</div>`;

  // Final HTML structure for the CTA section
  return `
    <section class="cta-${id}">
      <div class="ctaSection">
        ${ctaContentHtml}
        ${imageHtml}
      </div>
    </section>
  `.trim();
}
