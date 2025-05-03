import { ctaOneStyles, ctaTwoStyles } from '../../../Elements/Sections/CTAs/defaultCtaStyles';

export function renderCta(element, collectedStyles) {
  const { id, styles = {}, children = [], configuration = 'ctaOne' } = element;

  // Select the appropriate style based on configuration
  const ctaStyles = configuration === 'ctaTwo' ? ctaTwoStyles : ctaOneStyles;

  // Initialize HTML parts
  let titleHtml = '';
  let descriptionHtml = '';
  let imageHtml = '';
  const buttonHtmls = [];

  // Extract elements
  const title = children.find(c => c.type === 'title' || c.type === 'heading');
  const description = children.find(c => c.type === 'paragraph');
  const buttons = children.filter(c => c.type === 'button');
  const imageElement = children.find(c => c.type === 'image');

  // Generate title HTML
  if (title) {
    const titleClass = `cta-${id}-title`;
    collectedStyles.push({
      className: titleClass,
      styles: { ...ctaStyles.ctaTitle, ...title.styles },
    });
    titleHtml = `<h2 class="${titleClass}">${title.content || ''}</h2>`;
  }

  // Generate description HTML
  if (description) {
    const descriptionClass = `cta-${id}-description`;
    collectedStyles.push({
      className: descriptionClass,
      styles: { ...ctaStyles.ctaDescription, ...description.styles },
    });
    descriptionHtml = `<p class="${descriptionClass}">${description.content || ''}</p>`;
  }

  // Handle Primary and Secondary Buttons
  if (buttons.length > 0) {
    buttons.forEach((button, index) => {
      const buttonContent = typeof button.content === 'object' ? button.content.text : button.content;
      if (index === 0) {
        const primaryButtonClass = `cta-${id}-primary-button`;
        collectedStyles.push({
          className: primaryButtonClass,
          styles: { ...ctaStyles.primaryButton, ...button.styles },
        });
        buttonHtmls.push(`<button class="${primaryButtonClass}">${buttonContent || ''}</button>`);
      } else {
        const secondaryButtonClass = `cta-${id}-secondary-button`;
        collectedStyles.push({
          className: secondaryButtonClass,
          styles: { ...ctaStyles.secondaryButton, ...button.styles },
        });
        buttonHtmls.push(`<button class="${secondaryButtonClass}">${buttonContent || ''}</button>`);
      }
    });
  }

  // Handle Image
  if (imageElement) {
    const imageClass = `cta-${id}-image`;
    collectedStyles.push({
      className: imageClass,
      styles: { ...ctaStyles.ctaImage, ...imageElement.styles },
    });
    const src = imageElement.src || imageElement.content?.src || (typeof imageElement.content === 'string' ? imageElement.content : '');
    if (src) {
      imageHtml = `
        <div class="ctaImageContainer">
          <img class="${imageClass}" src="${src}" alt="${imageElement.alt || ''}">
        </div>
      `;
    }
  }

  // Merge styles properly to avoid overrides
  const mergedStyles = {
    ...ctaStyles.cta,
    ...styles,
    '.ctaSection': ctaStyles.ctaSection || {},
    '.ctaContent': ctaStyles.ctaContent,
    '.buttonContainer': ctaStyles.buttonContainer,
  };

  collectedStyles.push({ className: `${id}`, styles: mergedStyles });

  // Final HTML structure for the CTA section
  return `
    <section id="${id}" class="${id}">
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
