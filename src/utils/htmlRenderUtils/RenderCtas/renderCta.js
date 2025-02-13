import { ctaOneStyles, ctaTwoStyles } from '../../../Elements/Sections/CTAs/defaultCtaStyles';
import { renderElementToHtml } from '../../htmlRender';

export function renderCta(ctaElement, collectedStyles) {
  const { id, configuration, children = [], styles = {} } = ctaElement;

  // Select the correct CTA style configuration
  let ctaStyles = configuration === 'ctaTwo' ? ctaTwoStyles : ctaOneStyles;

  let titleHtml = '';
  let descriptionHtml = '';
  let buttonHtmls = [];
  let imageHtml = '';

  // Categorize elements properly
  const titleElement = children.find((child) => child.type === 'title');
  const paragraphElement = children.find((child) => child.type === 'paragraph');
  const buttons = children.filter((child) => child.type === 'button');
  const imageElement = children.find((child) => child.type === 'image');

  // Handle Title
  if (titleElement) {
    const titleClass = `cta-${id}-title`;
    collectedStyles.push({
      className: titleClass,
      styles: { ...ctaStyles.ctaTitle, ...titleElement.styles },
    });
    titleHtml = `<h2 class="${titleClass}">${titleElement.content}</h2>`;
  }

  // Handle Paragraph
  if (paragraphElement) {
    const descriptionClass = `cta-${id}-description`;
    collectedStyles.push({
      className: descriptionClass,
      styles: { ...ctaStyles.ctaDescription, ...paragraphElement.styles },
    });
    descriptionHtml = `<p class="${descriptionClass}">${paragraphElement.content}</p>`;
  }

  // Handle Primary and Secondary Buttons
  if (buttons.length > 0) {
    const primaryButton = buttons[0];
    const secondaryButton = buttons[1];

    if (primaryButton) {
      const primaryButtonClass = `cta-${id}-primary-button`;
      collectedStyles.push({
        className: primaryButtonClass,
        styles: { ...ctaStyles.primaryButton, ...primaryButton.styles },
      });
      buttonHtmls.push(`<button class="${primaryButtonClass}">${primaryButton.content}</button>`);
    }

    if (secondaryButton) {
      const secondaryButtonClass = `cta-${id}-secondary-button`;
      collectedStyles.push({
        className: secondaryButtonClass,
        styles: { ...ctaStyles.secondaryButton, ...secondaryButton.styles },
      });
      buttonHtmls.push(`<button class="${secondaryButtonClass}">${secondaryButton.content}</button>`);
    }
  }

  // Handle Image
  if (imageElement) {
    const imageClass = `cta-${id}-image`;
    collectedStyles.push({
      className: imageClass,
      styles: { ...ctaStyles.ctaImage, ...imageElement.styles },
    });
    imageHtml = `
      <div class="ctaImageContainer">
        <img class="${imageClass}" src="${imageElement.content}" />
      </div>
    `;
  }

  // Merge styles properly to avoid overrides
  const mergedStyles = {
    ...ctaStyles.cta,
    ...styles,
    '.ctaSection': ctaStyles.ctaSection,
    '.ctaContent': ctaStyles.ctaContent,
    '.buttonContainer': ctaStyles.buttonContainer,
  };

  collectedStyles.push({ className: `cta-${id}`, styles: mergedStyles });

  // Final HTML structure for the CTA section
  return `
    <section class="cta-${id}">
      <div class="ctaSection">
        <div class="ctaContent">
          ${titleHtml}
          ${descriptionHtml}
          <div class="buttonContainer">
            ${buttonHtmls.join('\n')}
          </div>
        </div>
        ${imageHtml}
      </div>
    </section>
  `.trim();
}
