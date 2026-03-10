import { buildElementHierarchy, cleanElementData } from './elementUtils';
import { escapeHtml, escapeAttr, sanitizeStyleValue } from './escapeUtils';
import { renderElementToHtml } from '../htmlRender';
import { IPFS_GATEWAYS } from '../../configs/ipfsConfig';

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
    .map(([key, value]) => {
      const safe = sanitizeStyleValue(String(value));
      return safe ? `${camelToKebab(key)}: ${safe}` : null;
    })
    .filter(Boolean)
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
        <h3 id="${heading.id}" style="font-size: 2.5rem; font-weight: bold; margin-bottom: 16px; color: ${element.configuration === 'heroTwo' ? '#ffffff' : '#1a1a1a'}">${escapeHtml(heading.content)}</h3>
      ` : ''}
      ${paragraph ? `
        <div id="${paragraph.id}" style="font-size: 1rem; line-height: 1.5; margin-bottom: 24px; color: ${element.configuration === 'heroTwo' ? '#ffffff' : '#1a1a1a'}">${escapeHtml(paragraph.content)}</div>
      ` : ''}
      ${button ? `
        <button id="${button.id}" style="background-color: #334155; color: #ffffff; padding: 12px 24px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; font-size: 1rem">${escapeHtml(button.content)}</button>
      ` : ''}
    </div>
  `;

  const rightContentHtml = image ? `
    <div style="background-color: transparent; max-width: 40%; width: 40%; display: flex; justify-content: flex-end; align-items: center;">
      <img id="${image.id}" style="max-width: 100%; height: auto; max-height: 400px; width: 100%; background-color: #334155; object-fit: cover; border-radius: 8px" src="${escapeAttr(image.content)}" alt="" loading="lazy" decoding="async">
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
    <header role="banner">
      <div id="${element.id}" class="section-hero" style="${heroStyleString}">
        ${leftContentHtml}
        ${element.configuration !== 'heroTwo' ? rightContentHtml : ''}
      </div>
    </header>
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
            <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${escapeAttr(logo.content)}" alt="">
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; flex: 1; gap: 30px; justify-content: flex-end;">
          ${spans.map((span, index) => `
            <span id="${span.id}" style="color: #1a1a1a; cursor: pointer${index === spans.length - 1 ? '; margin-right: 16px;' : ''}">${escapeHtml(span.content)}</span>
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
            <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${escapeAttr(logo.content)}" alt="">
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; flex: 1;">
          ${spans.map((span, index) => `
            <span id="${span.id}" style="color: #1a1a1a; cursor: pointer; margin-right: 16px">${escapeHtml(span.content)}</span>
          `).join('')}
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          ${buttons.map(button => `
            <button id="${button.id}" style="border: none; padding: 10px 20px; background-color: #334155; color: #ffffff; cursor: pointer">${escapeHtml(button.content)}</button>
          `).join('')}
      </div>
      </nav>
    `;
  }

  const logoGroupHtml = `
    <div style="display: flex; align-items: center; gap: 12px;">
      ${logo ? `
        <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${escapeAttr(logo.content)}" alt="">
      ` : ''}
      ${spans[0] ? `
        <span id="${spans[0].id}" style="color: #1a1a1a; cursor: pointer">${escapeHtml(spans[0].content)}</span>
      ` : ''}
    </div>
  `;

  const navGroupHtml = spans.length > 1 ? `
    <div style="display: flex; align-items: center; justify-content: center; flex: 1;">
      ${spans.slice(1).map(span => `
        <span id="${span.id}" style="color: #1a1a1a; cursor: pointer; margin-right: 16px">${escapeHtml(span.content)}</span>
      `).join('')}
    </div>
  ` : '';

  const buttonGroupHtml = buttons.length > 0 ? `
    <div style="display: flex; align-items: center; gap: 16px;">
      ${buttons.map(button => `
        <button id="${button.id}" style="border: none; padding: 10px 20px; background-color: #334155; color: #ffffff; cursor: pointer">${escapeHtml(button.content)}</button>
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
        // Dispatch all other element types to the universal renderer
        renderedContent = renderElementToHtml(element);
      }

      if (renderedContent) {
        let cleanedContent = cleanEmptyDivs(renderedContent);
        cleanedContent = fixClassName(cleanedContent);
        bodyHtml += cleanedContent;
        processedElements.add(element.id);
      }
    }
  });

  // Generate hover/focus pseudo-class CSS from element state styles
  const stateStylesCss = elements
    .filter(el => (el.hoverStyles && Object.keys(el.hoverStyles).length > 0) ||
                  (el.focusStyles && Object.keys(el.focusStyles).length > 0))
    .map(el => {
      let css = `#${el.id} { transition: all 0.2s ease; }\n`;
      if (el.hoverStyles && Object.keys(el.hoverStyles).length > 0) {
        css += `      #${el.id}:hover { ${styleObjectToString(el.hoverStyles)} }\n`;
      }
      if (el.focusStyles && Object.keys(el.focusStyles).length > 0) {
        css += `      #${el.id}:focus { ${styleObjectToString(el.focusStyles)} }\n`;
      }
      return css;
    })
    .join('      ');

  // Generate styles HTML with optimized structure
  const stylesHtml = `
    <style>
      /* Base styles */
      :root {
        --primary-color: #334155;
        --text-color: #1a1a1a;
        --background-color: #ffffff;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: var(--text-color);
        background-color: var(--background-color);
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Preserve element-specific styles */
      ${collectedStyles.map(style => `
        .${style.className} {
          ${Object.entries(style.styles)
            .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
            .join(';\n          ')}
        }
      `).join('\n')}

      /* Element state styles (hover/focus) */
      ${stateStylesCss}

      /* Per-element breakpoint overrides */
      ${elements
        .filter(el => el.breakpointStyles && (
          Object.keys(el.breakpointStyles.tablet || {}).length > 0 ||
          Object.keys(el.breakpointStyles.mobile || {}).length > 0
        ))
        .map(el => {
          let css = '';
          if (el.breakpointStyles.tablet && Object.keys(el.breakpointStyles.tablet).length > 0) {
            css += `@media (max-width: 768px) { #${el.id} { ${styleObjectToString(el.breakpointStyles.tablet)} } }\n`;
          }
          if (el.breakpointStyles.mobile && Object.keys(el.breakpointStyles.mobile).length > 0) {
            css += `      @media (max-width: 480px) { #${el.id} { ${styleObjectToString(el.breakpointStyles.mobile)} } }\n`;
          }
          return css;
        }).join('      ')}

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
        [style*="display: flex"] { flex-wrap: wrap; }
        [style*="display: grid"] { grid-template-columns: 1fr !important; }
        body > div > div { max-width: 100% !important; overflow-x: hidden; }
        img { max-width: 100%; height: auto; }
      }
      @media (max-width: 480px) {
        body { font-size: 14px; }
        [style*="padding"] { padding-left: 12px !important; padding-right: 12px !important; }
      }

      /* IPFS-specific optimizations */
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      /* Loading states */
      .loading {
        opacity: 0;
        transition: opacity 0.3s ease-in;
      }

      .loaded {
        opacity: 1;
      }

      /* Skip-link for accessibility */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-color);
        color: #fff;
        padding: 8px 16px;
        z-index: 100;
        text-decoration: none;
        transition: top 0.2s;
      }
      .skip-link:focus {
        top: 0;
      }
    </style>
  `;

  // Generate meta tags
  const metaTags = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:;">
    <meta name="description" content="${escapeAttr(websiteSettings.metaDescription || 'A website created with Dappzy')}" />
    <meta name="keywords" content="${escapeAttr(websiteSettings.metaKeywords || '')}" />
    <meta name="author" content="${escapeAttr(websiteSettings.author || 'Dappzy')}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(websiteSettings.siteTitle || 'My Website')}" />
    <meta property="og:description" content="${escapeAttr(websiteSettings.metaDescription || 'A website created with Dappzy')}" />
    <meta property="og:image" content="${escapeAttr(websiteSettings.ogImage || '')}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(websiteSettings.siteTitle || 'My Website')}" />
    <meta name="twitter:description" content="${escapeAttr(websiteSettings.metaDescription || 'A website created with Dappzy')}" />
    <meta name="twitter:image" content="${escapeAttr(websiteSettings.ogImage || '')}" />
  `;

  // Generate the final HTML with IPFS optimizations
  const title = websiteSettings.siteTitle || 'Exported Website';
  const favicon = websiteSettings.faviconUrl || '/favicon.ico';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${metaTags}
      <link rel="icon" href="${escapeAttr(favicon)}">
      <title>${escapeHtml(title)}</title>
      ${stylesHtml}
      <script>
        // IPFS Gateway Fallback
        const ipfsGateways = ${JSON.stringify(IPFS_GATEWAYS)};

        // Function to handle image loading with fallback
        function handleImageLoad(img) {
          if (img.src.startsWith('ipfs://')) {
            const ipfsHash = img.src.replace('ipfs://', '');
            let currentGatewayIndex = 0;

            function tryNextGateway() {
              if (currentGatewayIndex >= ipfsGateways.length) {
                return;
              }

              const gateway = ipfsGateways[currentGatewayIndex];
              img.src = gateway + ipfsHash;
              currentGatewayIndex++;
            }

            img.onerror = tryNextGateway;
            tryNextGateway();
          }
          img.classList.add('loaded');
        }

        // Initialize image loading
        document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('img').forEach(img => {
            img.classList.add('loading');
            handleImageLoad(img);
          });
        });
      </script>
    </head>
    <body>
      <a href="#main-content" class="skip-link">Skip to content</a>
      <main id="main-content">
      ${bodyHtml}
      </main>
      ${elements.some(el => el.type === 'connectWalletButton' || el.type === 'connectwalletbutton') ? `
      <script>
        document.querySelectorAll('[data-wallet-connect]').forEach(function(btn) {
          btn.addEventListener('click', async function() {
            try {
              if (window.solana && window.solana.isPhantom) {
                var resp = await window.solana.connect();
                btn.textContent = resp.publicKey.toString().slice(0,4) + '...' + resp.publicKey.toString().slice(-4);
              } else if (window.ethereum) {
                var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                btn.textContent = accounts[0].slice(0,6) + '...' + accounts[0].slice(-4);
              } else {
                btn.textContent = 'No wallet found';
              }
            } catch (e) { btn.textContent = 'Connection failed'; }
          });
        });
      </script>` : ''}
      ${elements.some(el => el.type === 'form') ? `
      <script>
        document.querySelectorAll('form[data-dappzy-form]').forEach(function(form) {
          form.addEventListener('submit', function(e) {
            if (!form.getAttribute('action') || form.getAttribute('action') === '#') {
              e.preventDefault();
              alert('Form submitted! Configure a form action URL in the builder.');
            }
          });
        });
      </script>` : ''}
    </body>
    </html>
  `.trim();
}; 