// File: src/utils/htmlRenderUtils/RenderHeros/renderHero.js

import { CustomTemplateHeroStyles, defaultHeroStyles, heroTwoStyles } from '../../../Elements/Sections/Heros/defaultHeroStyles';

export function renderHero(heroElement, collectedStyles) {
  const { id, configuration, children = [], styles = {} } = heroElement;

  // 1. Pick base styles
  let baseHeroSection = {};
  let subStyles = {};

  if (configuration === 'heroThree' || configuration === 'customTemplate') {
    baseHeroSection = CustomTemplateHeroStyles.heroSection;
    subStyles = CustomTemplateHeroStyles;
  } else if (configuration === 'heroTwo') {
    baseHeroSection = heroTwoStyles.heroSection;
    subStyles = heroTwoStyles; // <--- now use heroTwo sub‐styles
  } else {
    // fallback: heroOne
    baseHeroSection = defaultHeroStyles.heroSection;
    subStyles = defaultHeroStyles;
  }

  // Parse children to produce HTML for caption, heading, paragraph, image and buttons
  let captionHtml = '';
  let headingHtml = '';
  let paragraphHtml = '';
  const buttonHtmls = [];
  let imageHtml = '';

  const buttonChildren = children.filter((c) => c.type === 'button');

  children.forEach((child) => {
    if (child.type === 'span' && !captionHtml) {
      captionHtml = `<span class="caption">${child.content || ''}</span>`;
    } else if (child.type === 'heading' && !headingHtml) {
      headingHtml = `<h1 class="heroTitle">${child.content || ''}</h1>`;
    } else if (child.type === 'paragraph' && !paragraphHtml) {
      paragraphHtml = `<p class="heroDescription">${child.content || ''}</p>`;
    } else if (child.type === 'image' && !imageHtml) {
      imageHtml = `
        <div class="heroImageContainer">
          <img class="heroImage" src="${child.content || ''}" alt="">
        </div>
      `;
    }
  });

  // Render buttons – first button as primary, subsequent ones as secondary.
  buttonChildren.forEach((btn, index) => {
    if (index === 0) {
      buttonHtmls.push(`<button class="primaryButton">${btn.content || ''}</button>`);
    } else {
      buttonHtmls.push(`<button class="secondaryButton">${btn.content || ''}</button>`);
    }
  });

  // 3. Merge sub‐styles
  const mergedStyles = {
    ...baseHeroSection,
    ...styles,
    '.heroContent': { ...subStyles.heroContent },
    '.caption': { ...subStyles.caption },
    '.heroTitle': { ...subStyles.heroTitle },
    '.heroDescription': { ...subStyles.heroDescription },
    '.buttonContainer': { ...subStyles.buttonContainer },
    '.primaryButton': { ...subStyles.primaryButton },
    '.secondaryButton': { ...subStyles.secondaryButton },
    '.heroImageContainer': { ...subStyles.heroImageContainer },
    '.heroImage': { ...subStyles.heroImage },
  };
  // Push the merged style rule into collectedStyles with a unique class name.
  const className = `${id}`;
  collectedStyles.push({
    className,
    styles: mergedStyles,
  });

  // Build and return the final HTML for this hero element.
  return `
    <section id="${className}" class="${className}">
      <div class="heroContent">
        ${captionHtml}
        ${headingHtml}
        ${paragraphHtml}
        <div class="buttonContainer">
          ${buttonHtmls.join('\n')}
        </div>
      </div>
      ${imageHtml}
    </section>
  `.trim();
}
