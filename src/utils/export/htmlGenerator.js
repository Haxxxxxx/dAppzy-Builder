import { buildElementHierarchy, cleanElementData } from './elementUtils';

/**
 * Converts camelCase to kebab-case
 * @param {string} str - The string to convert
 * @returns {string} - Converted string
 */
const camelToKebab = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Converts style object to CSS string
 * @param {Object} styles - Style object to convert
 * @returns {string} - CSS string
 */
const styleObjectToString = (styles) => {
  if (!styles) return '';
  return Object.entries(styles)
    .filter(([_, value]) => value != null)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');
};

/**
 * Cleans empty divs from HTML
 * @param {string} html - HTML to clean
 * @returns {string} - Cleaned HTML
 */
const cleanEmptyDivs = (html) => {
  return html.replace(/<div[^>]*>\s*<\/div>/g, '');
};

/**
 * Fixes class names in HTML
 * @param {string} html - HTML to fix
 * @returns {string} - Fixed HTML
 */
const fixClassName = (html) => {
  return html.replace(/className=/g, 'class=');
};

/**
 * Generates HTML for a hero section
 * @param {Object} element - Hero element
 * @returns {string} - Generated HTML
 */
const generateHeroHtml = (element) => {
  const image = element.children.find(child => child?.type === 'image');
  const heading = element.children.find(child => child?.type === 'heading');
  const paragraph = element.children.find(child => child?.type === 'paragraph');
  const button = element.children.find(child => child?.type === 'button');

  const contentContainerStyles = element.configuration === 'heroTwo' ?
    'display: flex; justify-content: center; align-items: center; flex-direction: column; background-color: transparent' :
    element.configuration === 'heroThree' ?
      'display: flex; justify-content: flex-start; align-items: flex-start; flex-direction: column; background-color: transparent; max-width: 40%; width: 40%' :
      'display: flex; justify-content: center; align-items: center; flex-direction: column; background-color: transparent; max-width: 40%; width: 40%';

  const leftContentHtml = `
    <div style="${contentContainerStyles}">
      ${heading ? `
        <h3 id="${heading.id}" style="font-size: 2.5rem; font-weight: bold; margin-bottom: 16px; color: ${element.configuration === 'heroTwo' ? '#ffffff' : '#1a1a1a'}">${heading.content}</h3>
      ` : ''}
      ${paragraph ? `
        <div id="${paragraph.id}" style="font-size: 1rem; line-height: 1.5; margin-bottom: 24px; color: ${element.configuration === 'heroTwo' ? '#ffffff' : '#1a1a1a'}">${paragraph.content}</div>
      ` : ''}
      ${button ? `
        <button id="${button.id}" style="background-color: #334155; color: #ffffff; padding: 12px 24px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; font-size: 1rem">${button.content}</button>
      ` : ''}
    </div>
  `;

  const rightContentHtml = image ? `
    <div style="background-color: transparent; max-width: 40%; width: 40%; display: flex; justify-content: flex-end; align-items: center;">
      <img id="${image.id}" style="max-width: 100%; height: 400px; background-color: #334155; object-fit: cover; border-radius: 8px" src="${image.content}" alt="">
    </div>
  ` : '';

  const baseHeroStyles = {
    display: 'flex',
    position: 'relative',
    flexDirection: element.configuration === 'heroTwo' ? 'column' : 'row',
    flexWrap: 'wrap',
    alignItems: element.configuration === 'heroThree' ? 'flex-start' : 'center',
    justifyContent: element.configuration === 'heroThree' ? 'space-between' : 'center',
    padding: element.configuration === 'heroTwo' ? '60px' : '40px',
    backgroundColor: element.configuration === 'heroTwo' ? '#6B7280' : '#ffffff',
    gap: element.configuration === 'heroThree' ? '10vw' : '1rem',
    margin: '0',
    color: element.configuration === 'heroTwo' ? '#fff' : 'inherit',
    textAlign: element.configuration === 'heroTwo' ? 'center' : 'left',
    borderRadius: element.configuration === 'heroTwo' ? '8px' : '0'
  };

  const heroStyles = {
    ...baseHeroStyles,
    ...element.styles
  };

  const heroStyleString = Object.entries(heroStyles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');

  return `
    <div id="${element.id}" class="section-hero" style="${heroStyleString}">
      ${leftContentHtml}
      ${element.configuration !== 'heroTwo' ? rightContentHtml : ''}
    </div>
  `;
};

/**
 * Generates HTML for a navbar section
 * @param {Object} element - Navbar element
 * @returns {string} - Generated HTML
 */
const generateNavbarHtml = (element) => {
  const logo = element.children.find(child => child?.type === 'image');
  const spans = element.children.filter(child => child?.type === 'span');
  const buttons = element.children.filter(child => child?.type === 'button' || child?.type === 'connectWalletButton');

  const baseNavbarStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    flexWrap: 'wrap',
    position: 'relative',
    borderRadius: '4px'
  };

  const navbarStyles = {
    ...baseNavbarStyles,
    ...element.styles
  };

  const navbarStyleString = Object.entries(navbarStyles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');

  if (element.configuration === 'twoColumn') {
    return `
      <nav id="${element.id}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${logo ? `
            <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${logo.content}" alt="">
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; flex: 1; gap: 30px; justify-content: flex-end;">
          ${spans.map((span, index) => `
            <span id="${span.id}" style="color: #1a1a1a; cursor: pointer${index === spans.length - 1 ? '; margin-right: 16px;' : ''}">${span.content}</span>
          `).join('')}
        </div>
      </nav>
    `;
  }

  if (element.configuration === 'threeColumn') {
    return `
      <nav id="${element.id}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${logo ? `
            <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${logo.content}" alt="">
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; flex: 1;">
          ${spans.map((span, index) => `
            <span id="${span.id}" style="color: #1a1a1a; cursor: pointer; margin-right: 16px">${span.content}</span>
          `).join('')}
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          ${buttons.map(button => `
            <button id="${button.id}" style="border: none; padding: 10px 20px; background-color: #334155; color: #ffffff; cursor: pointer">${button.content}</button>
          `).join('')}
      </div>
      </nav>
    `;
  }

  const logoGroupHtml = `
    <div style="display: flex; align-items: center; gap: 12px;">
      ${logo ? `
        <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${logo.content}" alt="">
      ` : ''}
      ${spans[0] ? `
        <span id="${spans[0].id}" style="color: #1a1a1a; cursor: pointer">${spans[0].content}</span>
      ` : ''}
    </div>
  `;

  const navGroupHtml = spans.length > 1 ? `
    <div style="display: flex; align-items: center; justify-content: center; flex: 1;">
      ${spans.slice(1).map(span => `
        <span id="${span.id}" style="color: #1a1a1a; cursor: pointer; margin-right: 16px">${span.content}</span>
      `).join('')}
    </div>
  ` : '';

  const buttonGroupHtml = buttons.length > 0 ? `
    <div style="display: flex; align-items: center; gap: 16px;">
      ${buttons.map(button => `
        <button id="${button.id}" style="border: none; padding: 10px 20px; background-color: #334155; color: #ffffff; cursor: pointer">${button.content}</button>
      `).join('')}
    </div>
  ` : '';

  return `
    <nav id="${element.id}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
      ${logoGroupHtml}
      ${navGroupHtml}
      ${buttonGroupHtml}
    </nav>
  `;
};

/**
 * Generates the complete HTML for a project
 * @param {Array} elements - Array of elements
 * @param {Object} websiteSettings - Website settings
 * @returns {string} - Generated HTML
 */
export const generateProjectHtml = (elements, websiteSettings) => {
  let bodyHtml = '';
  const processedElements = new Set();
  const collectedStyles = [];

  // Process elements and build HTML
  const hierarchicalElements = buildElementHierarchy(elements);

  // Render each root element and its children recursively
  hierarchicalElements.forEach(element => {
    if (!processedElements.has(element.id)) {
      let renderedContent;

      if (element.type === 'hero') {
        renderedContent = generateHeroHtml(element);
      } else if (element.type === 'navbar') {
        renderedContent = generateNavbarHtml(element);
      } else {
        // Handle other element types
        const styleString = styleObjectToString(element.styles);
        renderedContent = `
          <div id="${element.id}" class="${element.className || ''}" style="${styleString}">
            ${element.content || ''}
          </div>
        `;
      }

      if (renderedContent) {
        let cleanedContent = cleanEmptyDivs(renderedContent);
        cleanedContent = fixClassName(cleanedContent);
        bodyHtml += cleanedContent;
        processedElements.add(element.id);
      }
    }
  });

  // Generate styles HTML
  const stylesHtml = `
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      /* Preserve element-specific styles */
      ${collectedStyles.map(style => `
        .${style.className} {
          ${Object.entries(style.styles)
            .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
            .join(';\n          ')}
        }
      `).join('\n')}

      /* Section-specific responsive styles */
      @media (max-width: 768px) {
        .section-navbar {
          flex-direction: column;
          padding: 12px 16px;
        }
        .section-navbar > div {
          width: 100%;
          justify-content: center;
        }
        .section-navbar span {
          margin: 8px 0;
        }
      }
    </style>
  `;

  // Generate the final HTML
  const title = websiteSettings.siteTitle || 'Exported Website';
  const favicon = websiteSettings.faviconUrl || '/favicon.ico';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" href="${favicon}">
      <title>${title}</title>
      ${stylesHtml}
    </head>
    <body>
      ${bodyHtml}
    </body>
    </html>
  `.trim();
}; 