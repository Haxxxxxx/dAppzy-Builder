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

// Function to flatten styles into valid CSS strings
function flattenStyles(styles) {
  return Object.entries(styles || {})
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join('\n  ');
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

function renderNavbarElement(element, collectedStyles) {
  const { id, children = [], configuration = 'default' } = element;
  const configStyles =
    configuration === 'customTemplate'
      ? CustomTemplateNavbarStyles
      : defaultNavbarStyles;

  // Add a prefix for the class name based on the configuration
  const classPrefix = configuration === 'customTemplate' ? 'customTemplate' : 'default';
  const className = `element-${id} ${classPrefix}-nav`;

  collectedStyles.push({
    className,
    styles: configStyles.nav,
  });

  // Generate logo HTML
  const logoHtml = children
    .filter((child) => child.type === 'image')
    .map((child) => {
      const logoClassName = `element-${child.id} ${classPrefix}-logoContainer`;
      collectedStyles.push({
        className: logoClassName,
        styles: configStyles.logoContainer,
      });
      return `<img class="${logoClassName}" src="${child.src}" alt="${child.content || 'Logo'}">`;
    })
    .join('');

  // Generate navigation links HTML
  const navItemsHtml = children
    .filter((child) => child.type === 'span')
    .map((child) => {
      const navClassName = `element-${child.id} ${classPrefix}-navList`;
      collectedStyles.push({
        className: navClassName,
        styles: configStyles.navList,
      });
      return `<li><a href="#" class="${navClassName}">${child.content}</a></li>`;
    })
    .join('');

  // Generate buttons HTML
  const buttonItemsHtml = children
    .filter((child) => child.type === 'button')
    .map((child) => {
      const buttonClassName = `element-${child.id} ${classPrefix}-buttonContainer`;
      collectedStyles.push({
        className: buttonClassName,
        styles: configStyles.buttonContainer,
      });
      return `<button class="${buttonClassName}">${child.content}</button>`;
    })
    .join('');

  // Return the complete HTML for the navbar
  return `<nav class="${className}">
    <div class="${classPrefix}-logoContainer">${logoHtml}</div>
    <ul class="${classPrefix}-navList">${navItemsHtml}</ul>
    <div class="${classPrefix}-buttonContainer">${buttonItemsHtml}</div>
  </nav>`;
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
  const childrenElements = element.children || [];

  if (type === 'navbar') {
    return renderNavbarElement(element, collectedStyles);
  }

  const childrenHtml = childrenElements
    .map((childElement) => renderElementToHtml(childElement, collectedStyles))
    .join('');

  if (selfClosingTags.includes(tag)) {
    return `<${tag} ${attributesString} />`;
  } else {
    return `<${tag} ${attributesString}>${content || ''}${childrenHtml}</${tag}>`;
  }
}

  

function renderHeroElement(element, collectedStyles) {
    const { id, styles, configuration, children = [] } = element;
    const className = `element-${id}`;
    let attributes = `class="hero ${className}"`;
  
    // Collect styles
    collectedStyles.push({
      className,
      styles,
    });
  
    let heroHtml = '';
  
    if (configuration === 'heroOne') {
      // Generate HTML for HeroOne
      const headingChild = children.find(child => child.type === 'span' && child.content === 'Welcome to Our Website');
      const paragraphChild = children.find(child => child.type === 'span' && child.content === 'Building a better future together.');
      const buttonChild = children.find(child => child.type === 'button');
      const imageChild = children.find(child => child.type === 'image');
  
      const headingHtml = headingChild ? renderElementToHtml(headingChild, collectedStyles) : '';
      const paragraphHtml = paragraphChild ? renderElementToHtml(paragraphChild, collectedStyles) : '';
      const buttonHtml = buttonChild ? renderElementToHtml(buttonChild, collectedStyles) : '';
      const imageHtml = imageChild ? renderElementToHtml(imageChild, collectedStyles) : '';
  
      heroHtml = `<div class="hero-one">
        ${imageHtml}
        ${headingHtml}
        ${paragraphHtml}
        ${buttonHtml}
      </div>`;
    } else if (configuration === 'heroTwo') {
      // Handle HeroTwo similarly
    } else {
      // Default hero layout
      const heroContentHtml = children.map(childElement => renderElementToHtml(childElement, collectedStyles)).join('');
      heroHtml = `<div class="hero-default">
        ${heroContentHtml}
      </div>`;
    }
  
    return `<section ${attributes}>${heroHtml}</section>`;
}
  
// Function to render CTA element
function renderCtaElement(element, collectedStyles) {
  const { id, styles, children = [], configuration } = element;
  const className = `element-${id}`;
  let attributes = `class="cta ${className}"`;

  // Collect styles
  collectedStyles.push({
    className,
    styles,
  });

  let ctaHtml = '';

  if (configuration === 'ctaOne') {
    // Generate HTML for CTA One
    const headingChild = children.find(child => child.type === 'heading');
    const buttonChild = children.find(child => child.type === 'button');

    const headingHtml = headingChild ? renderElementToHtml(headingChild, collectedStyles) : '';
    const buttonHtml = buttonChild ? renderElementToHtml(buttonChild, collectedStyles) : '';

    ctaHtml = `<div class="cta-one">
      ${headingHtml}
      ${buttonHtml}
    </div>`;
  } else {
    // Default CTA layout
    const ctaContentHtml = children.map(childElement => renderElementToHtml(childElement, collectedStyles)).join('');
    ctaHtml = `<div class="cta-default">
      ${ctaContentHtml}
    </div>`;
  }

  return `<section ${attributes}>${ctaHtml}</section>`;
}

// Function to render footer element
function renderFooterElement(element, collectedStyles) {
  const { id, styles, children = [], configuration } = element;
  const className = `element-${id}`;
  let attributes = `class="footer ${className}"`;

  // Collect styles
  collectedStyles.push({
    className,
    styles,
  });

  let footerHtml = '';

  if (configuration === 'simple') {
    // Generate HTML for SimpleFooter
    const contentHtml = children.map(childElement => renderElementToHtml(childElement, collectedStyles)).join('');
    footerHtml = `<div class="footer-simple">
      ${contentHtml}
    </div>`;
  } else if (configuration === 'detailed') {
    // Generate HTML for DetailedFooter
    // ...
  } else if (configuration === 'template') {
    // Generate HTML for TemplateFooter
    // ...
  } else {
    // Default footer layout
    const footerContentHtml = children.map(childElement => renderElementToHtml(childElement, collectedStyles)).join('');
    footerHtml = `<div class="footer-default">
      ${footerContentHtml}
    </div>`;
  }

  return `<footer ${attributes}>${footerHtml}</footer>`;
}

