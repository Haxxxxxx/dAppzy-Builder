// src/utils/htmlRenderUtils.js

import { defaultNavbarStyles, CustomTemplateNavbarStyles } from '../Elements/Sections/Navbars/DefaultNavbarStyles';

// Mapping component types to HTML tags
const typeToTagMap = {
  div: 'div',
  section: 'section',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  p: 'p',
  span: 'span',
  image: 'img',
  video: 'video',
  audio: 'audio',
  iframe: 'iframe',
  navbar: 'nav',
  hero: 'section',
  cta: 'section',
  footer: 'footer',
  button: 'button',
  input: 'input',
  form: 'form',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  table: 'table',
  tr: 'tr',
  td: 'td',
  anchor: 'a',
  textarea: 'textarea',
  select: 'select',
  option: 'option',
  label: 'label',
  fieldset: 'fieldset',
  legend: 'legend',
  progress: 'progress',
  meter: 'meter',
  blockquote: 'blockquote',
  code: 'code',
  pre: 'pre',
  hr: 'hr',
  caption: 'caption',
  date: 'input',
  twoColumn: 'nav',
  threeColumn: 'nav',
  customTemplate: 'nav',
};

// Map styles based on configuration
const stylesMap = {
  default: defaultNavbarStyles,
  customTemplate: CustomTemplateNavbarStyles,
};

// Utility function to extract file extension
export function getFileExtension(url) {
  if (!url || typeof url !== 'string') {
    console.warn(`Invalid URL provided to getFileExtension: ${url}. Using default 'png' extension.`);
    return 'png'; // Default extension or handle as needed
  }
  return url.split('.').pop().split(/\#|\?/)[0];
}

// Function to flatten styles into valid CSS strings
function flattenStyles(styles) {
  let cssString = '';

  Object.entries(styles || {}).forEach(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle nested styles or media queries
      cssString += `\n  ${key} {\n`;
      cssString += Object.entries(value)
        .map(
          ([nestedKey, nestedValue]) =>
            `    ${nestedKey.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${nestedValue};`
        )
        .join('\n');
      cssString += `\n  }`;
    } else {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssString += `${cssKey}: ${value};\n  `;
    }
  });

  return cssString.trim();
}

// Generate consolidated CSS for all collected styles
export function generateCss(collectedStyles) {
  const defaultStylesCss = Object.entries(stylesMap)
    .map(([config, styles]) => {
      return Object.entries(styles).map(([className, style]) => {
        const styleString = flattenStyles(style || {});
        return `.${config}-${className} {\n  ${styleString}\n}`;
      }).join('\n\n');
    })
    .join('\n\n');

  const elementStylesCss = collectedStyles
    .map(({ className, styles }) => {
      const styleString = flattenStyles(styles || {});
      return `.${className} {\n  ${styleString}\n}`;
    })
    .join('\n\n');

  return `${defaultStylesCss}\n\n${elementStylesCss}`;
}

// Function to build attribute strings for HTML elements
function buildAttributesString(type, attributes, src) {
  let attributesString = '';

  if (type === 'input' && attributes.type) {
    attributesString += ` type="${attributes.type}"`;
  }
  if (type === 'anchor' && attributes.href) {
    attributesString += ` href="${attributes.href}"`;
  }
  if (['img', 'video', 'audio', 'iframe', 'source'].includes(type) && src) {
    attributesString += ` src="${src}"`;
  }
  if (type === 'select' && attributes.multiple) {
    attributesString += ' multiple';
  }
  if (type === 'option' && attributes.value) {
    attributesString += ` value="${attributes.value}"`;
  }
  if (type === 'progress' && attributes.value && attributes.max) {
    attributesString += ` value="${attributes.value}" max="${attributes.max}"`;
  }
  if (type === 'meter' && attributes.value && attributes.min && attributes.max) {
    attributesString += ` value="${attributes.value}" min="${attributes.min}" max="${attributes.max}"`;
  }
  if (type === 'iframe' && attributes.frameborder) {
    attributesString += ` frameborder="${attributes.frameborder}"`;
  }
  if (type === 'date') {
    attributesString += ` type="date"`;
  }

  return attributesString;
}

// Function to render Navbar elements to HTML
export function renderNavbarElement(element, collectedStyles) {
  const { id, children = [], configuration = 'default' } = element;
  const configStyles =
    configuration === 'customTemplate'
      ? CustomTemplateNavbarStyles
      : defaultNavbarStyles;

  // Define separate class names
  const elementClassName = `element-${id}`;
  const configClassName = `${configuration}-nav`;

  // Collect styles for each class independently
  collectedStyles.push({
    className: elementClassName,
    styles: configStyles.nav,
  });

  collectedStyles.push({
    className: configClassName,
    styles: configStyles.nav,
  });

  // Generate logo HTML
  const logoHtml = children
    .filter((child) => child.type === 'image')
    .map((child) => {
      const logoElementClass = `element-${child.id}`;
      const logoConfigClass = `${configuration}-logoContainer`;
      collectedStyles.push({
        className: logoElementClass,
        styles: configStyles.logoContainer,
      });
      collectedStyles.push({
        className: logoConfigClass,
        styles: configStyles.logoContainer,
      });

      const imageFilename = `${child.id}.${getFileExtension(child.src)}`;
      return `<img class="${logoElementClass} ${logoConfigClass}" src="images/${imageFilename}" alt="${child.content || 'Logo'}">`;
    })
    .join('');

  // Generate navigation links HTML
  const navItemsHtml = children
    .filter((child) => child.type === 'span')
    .map((child) => {
      const navElementClass = `element-${child.id}`;
      const navConfigClass = `${configuration}-navList`;
      collectedStyles.push({
        className: navElementClass,
        styles: configStyles.navList,
      });
      collectedStyles.push({
        className: navConfigClass,
        styles: configStyles.navList,
      });
      return `<li><a href="#" class="${navElementClass} ${navConfigClass}">${child.content}</a></li>`;
    })
    .join('');

  // Generate buttons HTML
  const buttonItemsHtml = children
    .filter((child) => child.type === 'button')
    .map((child) => {
      const buttonElementClass = `element-${child.id}`;
      const buttonConfigClass = `${configuration}-buttonContainer`;
      collectedStyles.push({
        className: buttonElementClass,
        styles: configStyles.buttonContainer,
      });
      collectedStyles.push({
        className: buttonConfigClass,
        styles: configStyles.buttonContainer,
      });
      return `<button class="${buttonElementClass} ${buttonConfigClass}">${child.content}</button>`;
    })
    .join('');

  // Return the complete HTML for the navbar
  return `<nav class="${elementClassName} ${configClassName}">
    <div class="${configuration}-logoContainer">${logoHtml}</div>
    <ul class="${configuration}-navList">${navItemsHtml}</ul>
    <div class="${configuration}-buttonContainer">${buttonItemsHtml}</div>
  </nav>`;
}

// Async function to render Navbar elements with Base64 images (Optional)
export async function renderNavbarElementAsync(element, collectedStyles) {
  const { id, children = [], configuration = 'default' } = element;
  const configStyles =
    configuration === 'customTemplate'
      ? CustomTemplateNavbarStyles
      : defaultNavbarStyles;

  // Define separate class names
  const elementClassName = `element-${id}`;
  const configClassName = `${configuration}-nav`;

  // Collect styles for each class independently
  collectedStyles.push({
    className: elementClassName,
    styles: configStyles.nav,
  });

  collectedStyles.push({
    className: configClassName,
    styles: configStyles.nav,
  });

  // Generate logo HTML with async image conversion (Not recommended if using separate assets)
  const logoHtmlPromises = children
    .filter((child) => child.type === 'image')
    .map(async (child) => {
      const logoElementClass = `element-${child.id}`;
      const logoConfigClass = `${configuration}-logoContainer`;
      collectedStyles.push({
        className: logoElementClass,
        styles: configStyles.logoContainer,
      });
      collectedStyles.push({
        className: logoConfigClass,
        styles: configStyles.logoContainer,
      });

      const base64 = await convertImageToBase64(child.src);
      return `<img class="${logoElementClass} ${logoConfigClass}" src="${base64}" alt="${child.content || 'Logo'}">`;
    });

  const logoHtml = (await Promise.all(logoHtmlPromises)).join('');

  // Generate navigation links HTML
  const navItemsHtml = children
    .filter((child) => child.type === 'span')
    .map((child) => {
      const navElementClass = `element-${child.id}`;
      const navConfigClass = `${configuration}-navList`;
      collectedStyles.push({
        className: navElementClass,
        styles: configStyles.navList,
      });
      collectedStyles.push({
        className: navConfigClass,
        styles: configStyles.navList,
      });
      return `<li><a href="#" class="${navElementClass} ${navConfigClass}">${child.content}</a></li>`;
    })
    .join('');

  // Generate buttons HTML
  const buttonItemsHtml = children
    .filter((child) => child.type === 'button')
    .map((child) => {
      const buttonElementClass = `element-${child.id}`;
      const buttonConfigClass = `${configuration}-buttonContainer`;
      collectedStyles.push({
        className: buttonElementClass,
        styles: configStyles.buttonContainer,
      });
      collectedStyles.push({
        className: buttonConfigClass,
        styles: configStyles.buttonContainer,
      });
      return `<button class="${buttonElementClass} ${buttonConfigClass}">${child.content}</button>`;
    })
    .join('');

  // Return the complete HTML for the navbar
  return `<nav class="${elementClassName} ${configClassName}">
    <div class="${configuration}-logoContainer">${logoHtml}</div>
    <ul class="${configuration}-navList">${navItemsHtml}</ul>
    <div class="${configuration}-buttonContainer">${buttonItemsHtml}</div>
  </nav>`;
}

// Function to convert image to Base64 (if needed)
export async function convertImageToBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${url}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error('Problem parsing input file.'));
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return '';
  }
}

// Render generic elements to HTML
export function renderElementToHtml(element, collectedStyles) {
  const { id, type, styles, content, src, attributes = {}, configuration } = element;
  const tag = typeToTagMap[type];

  if (!tag) {
    console.warn(`No HTML tag mapping found for type: ${type}`);
    return '';
  }

  const className = `element-${id}`;
  collectedStyles.push({
    className,
    styles,
  });

  let attributesString = `class="${className}"`;
  attributesString += buildAttributesString(type, attributes, src);

  const selfClosingTags = ['img', 'input', 'hr', 'br', 'meta', 'link', 'source'];

  if (type === 'navbar') {
    return renderNavbarElement(element, collectedStyles);
  }

  const childrenElements = element.children || [];
  const childrenHtml = childrenElements
    .map((childElement) => renderElementToHtml(childElement, collectedStyles))
    .join('');

  if (selfClosingTags.includes(tag)) {
    return `<${tag} ${attributesString} />`;
  } else {
    return `<${tag} ${attributesString}>${content || ''}${childrenHtml}</${tag}>`;
  }
}
