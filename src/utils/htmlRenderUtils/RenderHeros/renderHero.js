import { defaultHeroStyles, heroTwoStyles, heroThreeStyles } from '../../../Elements/Sections/Heros/defaultHeroStyles';
import { renderElementToHtml } from '../../htmlRender';

export function renderHero(heroElement, collectedStyles) {
  const { id, configuration, children = [], styles = {} } = heroElement;

  // Select the correct hero style configuration
  let heroStyles = { ...defaultHeroStyles.hero }; // Default global hero styles
  if (configuration === 'heroTwo') {
    heroStyles = { ...heroStyles, ...heroTwoStyles.heroSection }; // Merge heroTwo styles properly
  } else if (configuration === 'heroThree') {
    heroStyles = { ...heroStyles, ...heroThreeStyles.heroSection }; // Merge heroThree styles
  }

  // Categorizing children elements
  let captionHtml = '';
  let headingHtml = '';
  let descriptionHtml = '';
  let buttonHtmls = [];
  let imageHtml = '';

  children.forEach((child) => {
    const childHtml = renderElementToHtml(child, collectedStyles);

    if (child.type === 'span' && !captionHtml) {
      captionHtml = `<span class="caption">${child.content}</span>`;
    } else if (child.type === 'heading' && !headingHtml) {
      headingHtml = `<h1 class="heroHeading">${child.content}</h1>`;
    } else if (child.type === 'paragraph' && !descriptionHtml) {
      descriptionHtml = `<p class="heroDescription">${child.content}</p>`;
    } else if (child.type === 'button') {
      // Determine button styles for heroTwo vs heroThree
      const buttonClass = `hero-${id}-button`;
      let buttonStyles = configuration === 'heroTwo' ? heroTwoStyles.buttonContainer : heroThreeStyles.primaryButton;

      collectedStyles.push({
        className: buttonClass,
        styles: {
          ...buttonStyles, // Apply hero-specific button styles
          ...child.styles, // Merge user-defined styles
        },
      });

      buttonHtmls.push(`<button class="${buttonClass}">${child.content}</button>`);
    } else if (child.type === 'image') {
      imageHtml = `<div class="heroImageContainer">
        <img class="heroImage" src="${child.content}" />
      </div>`;
    }
  });

  // Check if the default hero includes an image
  const defaultHasImage = configuration === 'heroThree' ? !!heroThreeStyles.heroImage : !!heroTwoStyles.heroImage;

  // Ensure styles merge correctly without overriding defaults
  const mergedStyles = {
    ...defaultHeroStyles.hero, // Apply global styles
    ...heroStyles, // Apply hero-specific styles
    ...styles, // Apply user-defined styles
    '.heroSection': configuration === 'heroThree' ? heroThreeStyles.heroSection : heroTwoStyles.heroSection,
    '.heroHeading': configuration === 'heroThree' ? heroThreeStyles.heroTitle : heroTwoStyles.heading,
    '.heroDescription': configuration === 'heroThree' ? heroThreeStyles.heroDescription : heroTwoStyles.description,
    '.caption': heroThreeStyles.caption,
    '.buttonContainer': heroThreeStyles.buttonContainer,
    '.heroImageContainer': heroThreeStyles.heroImageContainer,
    '.heroImage': heroThreeStyles.heroImage,
    '.heroContent' : heroThreeStyles.heroContent,
  };

  collectedStyles.push({ className: `hero-${id}`, styles: mergedStyles });

  // **🔹 Conditionally render `heroContent` only if default has an image**
  const heroContentHtml =
    defaultHasImage && (captionHtml || headingHtml || descriptionHtml || buttonHtmls.length > 0)
      ? `
        <div class="heroContent">
          ${captionHtml}
          ${headingHtml}
          ${descriptionHtml}
          <div class="buttonContainer">
            ${buttonHtmls.join('\n')}
          </div>
        </div>
      `
      : captionHtml + headingHtml + descriptionHtml + `<div class="buttonContainer">${buttonHtmls.join('\n')}</div>`;

  // Final HTML structure for the hero section
  return `
    <section class="hero-${id}">
      <div class="heroSection">
        ${heroContentHtml}
        ${imageHtml}
      </div>
    </section>
  `.trim();
}
