// src/utils/htmlRenderUtils/RenderHeros/renderHero.js

import {
  CustomTemplateHeroStyles,
  // ...others, e.g. heroTwoStyles, heroThreeStyles, etc.
} from '../../../Elements/Sections/Heros/defaultHeroStyles';
import { renderElementToHtml } from '../../htmlRender'; 
// Assume you have a helper that can convert a single child to raw HTML if needed

export function renderHero(heroElement, collectedStyles) {
  const {
    id,
    configuration,
    children = [],
    styles = {}, // user overrides at the hero level
  } = heroElement;

  // 1) Decide which base styles to use, depending on config
  //    (maybe your config is "customTemplate" or "heroThree")
  let baseHeroSection = {};
  if (configuration === 'heroThree' || configuration === 'customTemplate') {
    baseHeroSection = CustomTemplateHeroStyles.heroSection;
  } 
  // else if (configuration === 'heroTwo') ...
  // else if (configuration === 'heroOne') ...
  // fallback if needed

  // 2) Parse children to produce HTML (caption, heading, paragraph, multiple buttons, image)
  let captionHtml = '';
  let headingHtml = '';
  let paragraphHtml = '';
  const buttonHtmls = [];
  let imageHtml = '';

  // We'll store references so we can do "primary" or "secondary" for multiple buttons
  const buttonChildren = children.filter((c) => c.type === 'button');

  children.forEach((child, idx) => {
    if (child.type === 'span' && !captionHtml) {
      // We'll treat the first <span> as a "caption"
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
    // We'll handle buttons separately below
  });

  // Handle all buttons, applying "primaryButton" for the 1st, "secondaryButton" for subsequent
  buttonChildren.forEach((btn, index) => {
    if (index === 0) {
      buttonHtmls.push(`<button class="primaryButton">${btn.content || ''}</button>`);
    } else {
      buttonHtmls.push(`<button class="secondaryButton">${btn.content || ''}</button>`);
    }
  });

  // 3) Merge top-level + user-defined styles, plus sub-rules
  //    so your final <section> can do `.heroContent`, `.caption`, etc.
  const mergedStyles = {
    ...baseHeroSection,
    ...styles, // user overrides for the container
    '.heroContent': { ...CustomTemplateHeroStyles.heroContent },
    '.caption': { ...CustomTemplateHeroStyles.caption },
    '.heroTitle': { ...CustomTemplateHeroStyles.heroTitle },
    '.heroDescription': { ...CustomTemplateHeroStyles.heroDescription },
    '.buttonContainer': { ...CustomTemplateHeroStyles.buttonContainer },
    '.primaryButton': { ...CustomTemplateHeroStyles.primaryButton },
    '.secondaryButton': { ...CustomTemplateHeroStyles.secondaryButton },
    '.heroImageContainer': { ...CustomTemplateHeroStyles.heroImageContainer },
    '.heroImage': { ...CustomTemplateHeroStyles.heroImage },
  };

  // 4) Push into collectedStyles so your export can generate CSS
  const className = `${id}`;
  collectedStyles.push({
    className,
    styles: mergedStyles,
  });

  // 5) Build final HTML referencing those sub-rules
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
