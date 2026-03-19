import { buildElementHierarchy } from './elementUtils';
import { escapeHtml, escapeAttr, sanitizeStyleValue, camelToKebab } from './escapeUtils';
import { renderElementToHtml } from '../htmlRender';
import { IPFS_GATEWAYS } from '../../configs/ipfsConfig';

/**
 * Generates a cryptographically random nonce for CSP script-src.
 * Falls back to Math.random if crypto API is unavailable.
 */
const generateNonce = () => {
  try {
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
    }
    return btoa(String.fromCharCode(...array));
  } catch {
    // Fallback for environments without btoa
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < 22; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

/**
 * Converts style object to CSS string
 * @param {Object} styles - Style object to convert
 * @returns {string} - CSS string
 */
// Non-CSS metadata fields that should never appear in exported inline styles
const NON_CSS_PROPERTIES = new Set(['backgroundType', 'tooltipPosition', 'allowMultiple', 'outline', 'poster']);

const styleObjectToString = (styles) => {
  if (!styles) return '';
  return Object.entries(styles)
    .filter(([key, value]) => value != null && !NON_CSS_PROPERTIES.has(key))
    .map(([key, value]) => {
      const safe = sanitizeStyleValue(String(value));
      return safe ? `${camelToKebab(key)}: ${safe}` : null;
    })
    .filter(Boolean)
    .join('; ');
};

/**
 * Cleans empty divs from HTML
 */
const cleanEmptyDivs = (html) => {
  return html.replace(/<div[^>]*>\s*<\/div>/g, '');
};

/**
 * Fixes class names in HTML
 */
const fixClassName = (html) => {
  return html.replace(/className=/g, 'class=');
};

/**
 * Renders an array of child elements to HTML via the universal renderer
 */
const renderChildrenHtml = (children, options = {}) => {
  if (!children || !Array.isArray(children)) return '';
  return children.map(child => renderElementToHtml(child, [], options)).join('');
};

/**
 * Recursively collects all leaf (non-div) children from a hierarchy node,
 * flattening through intermediate container divs.
 */
const flattenChildren = (children) => {
  if (!children || !Array.isArray(children)) return [];
  const result = [];
  for (const child of children) {
    if (!child) continue;
    if (child.type === 'div' && child.children && child.children.length > 0) {
      result.push(...flattenChildren(child.children));
    } else {
      result.push(child);
    }
  }
  return result;
};

/**
 * Generates HTML for a hero section with configuration-aware layout
 */
const generateHeroHtml = (element, _options) => {
  // Flatten through container divs to find actual content elements
  const allChildren = flattenChildren(element.children || []);
  const image = allChildren.find(child => child?.type === 'image');
  const heading = allChildren.find(child => child?.type === 'heading');
  const paragraph = allChildren.find(child => child?.type === 'paragraph');
  const buttons = allChildren.filter(child => child?.type === 'button');

  // Collect IDs of children rendered in structured positions so we can
  // append any remaining (non-standard) children afterwards.
  const renderedIds = new Set(
    [heading, paragraph, image, ...buttons].filter(Boolean).map(c => c.id)
  );
  const extraChildren = allChildren.filter(c => c && !renderedIds.has(c.id));

  const config = element.configuration;
  const isCentered = config === 'heroTwo';
  const isLeftAligned = config === 'heroThree';

  // Use the left container's actual styles if available, else sensible defaults
  const leftContainer = (element.children || []).find(c => c?.type === 'div' && c.children?.some(gc => gc?.type !== 'image'));
  const rightContainer = (element.children || []).find(c => c?.type === 'div' && c.children?.some(gc => gc?.type === 'image'));

  const defaultContentStyles = isCentered
    ? { display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', backgroundColor: 'transparent' }
    : isLeftAligned
      ? { display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column', backgroundColor: 'transparent', maxWidth: '40%', width: '40%' }
      : { display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', backgroundColor: 'transparent', maxWidth: '40%', width: '40%' };

  const contentContainerStyleStr = styleObjectToString({ ...defaultContentStyles, ...(leftContainer?.styles || {}) });

  const leftContentHtml = `
    <div style="${contentContainerStyleStr}">
      ${heading ? `<h3 id="${escapeAttr(heading.id)}" style="${styleObjectToString(heading.styles)}">${escapeHtml(heading.content)}</h3>` : ''}
      ${paragraph ? `<p id="${escapeAttr(paragraph.id)}" style="${styleObjectToString(paragraph.styles)}">${escapeHtml(paragraph.content)}</p>` : ''}
      ${buttons.map(btn => {
        const settings = btn.settings || {};
        let actionAttrs = '';
        if (settings.targetValue && settings.actionType !== 'Dropdown') {
          const safeTarget = escapeAttr(settings.targetValue);
          actionAttrs = settings.openInNewTab
            ? ` data-action="navigate" data-target="${safeTarget}" data-new-tab="true"`
            : ` data-action="navigate" data-target="${safeTarget}"`;
        }
        return `<button id="${escapeAttr(btn.id)}" style="${styleObjectToString(btn.styles)}" type="button"${actionAttrs}>${escapeHtml(btn.content)}</button>`;
      }).join('')}
      ${renderChildrenHtml(extraChildren, _options)}
    </div>
  `;

  const defaultRightStyles = { backgroundColor: 'transparent', maxWidth: '40%', width: '40%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' };
  const rightContentHtml = image ? `
    <div style="${styleObjectToString({ ...defaultRightStyles, ...(rightContainer?.styles || {}) })}">
      <img id="${escapeAttr(image.id)}" style="${styleObjectToString({ maxWidth: '100%', height: 'auto', maxHeight: '400px', width: '100%', objectFit: 'cover', borderRadius: '8px', ...image.styles })}" src="${escapeAttr(image.content || image.src || '')}" alt="${escapeAttr(image.alt || '')}" loading="lazy" decoding="async">
    </div>
  ` : '';

  const heroStyleString = styleObjectToString({
    display: 'flex',
    position: 'relative',
    flexDirection: isCentered ? 'column' : 'row',
    flexWrap: 'wrap',
    alignItems: isLeftAligned ? 'flex-start' : 'center',
    justifyContent: isLeftAligned ? 'space-between' : 'center',
    padding: isCentered ? '60px' : '40px',
    gap: isLeftAligned ? '10vw' : '1rem',
    margin: '0',
    ...element.styles
  });

  return `
    <header role="banner">
      <div id="${escapeAttr(element.id)}" class="section-hero" style="${heroStyleString}">
        ${leftContentHtml}
        ${!isCentered ? rightContentHtml : ''}
      </div>
    </header>
  `;
};

/**
 * Generates HTML for a navbar section with configuration-aware layout
 */
const generateNavbarHtml = (element, _options) => {
  const children = element.children || [];
  const logo = children.find(child => child?.type === 'image');
  const spans = children.filter(child => child?.type === 'span');
  const buttons = children.filter(child => child?.type === 'button' || child?.type === 'connectWalletButton');

  const navbarStyleString = styleObjectToString({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    flexWrap: 'wrap',
    position: 'relative',
    ...element.styles
  });

  const logoHtml = logo
    ? `<img id="${escapeAttr(logo.id)}" style="${styleObjectToString({ width: '40px', height: '40px', borderRadius: '50%', ...logo.styles })}" src="${escapeAttr(logo.content || logo.src || '')}" alt="${escapeAttr(logo.alt || '')}" loading="lazy">`
    : '';

  const spansHtml = spans.map(span => {
    const settings = span.settings || {};
    if (settings.actionType === 'URL' && settings.targetValue) {
      const safeTarget = escapeAttr(settings.targetValue);
      const newTabAttrs = settings.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a id="${escapeAttr(span.id)}" href="${safeTarget}"${newTabAttrs} style="${styleObjectToString({ textDecoration: 'none', color: 'inherit', cursor: 'pointer', ...span.styles })}">${escapeHtml(span.content)}</a>`;
    }
    let interactiveAttrs = '';
    if (settings.targetValue) {
      const safeTarget = escapeAttr(settings.targetValue);
      if (settings.actionType === 'pageSection') {
        interactiveAttrs = ` data-action="scroll-to" data-target="${safeTarget}" style="cursor: pointer;"`;
      } else if (settings.actionType === 'file') {
        interactiveAttrs = settings.downloadFile
          ? ` data-action="download" data-target="${safeTarget}" style="cursor: pointer;"`
          : ` data-action="navigate" data-target="${safeTarget}" data-new-tab="true" style="cursor: pointer;"`;
      }
    }
    return `<span id="${escapeAttr(span.id)}" style="${styleObjectToString(span.styles)}"${interactiveAttrs}>${escapeHtml(span.content)}</span>`;
  }).join('');

  const buttonsHtml = buttons.map(btn => {
    if (btn.type === 'connectWalletButton') {
      return `<button id="${escapeAttr(btn.id)}" style="${styleObjectToString(btn.styles)}" data-wallet-connect type="button">${escapeHtml(btn.content || 'Connect Wallet')}</button>`;
    }
    const settings = btn.settings || {};
    let actionAttrs = '';
    if (settings.targetValue && settings.actionType !== 'Dropdown') {
      const safeTarget = escapeAttr(settings.targetValue);
      actionAttrs = settings.openInNewTab
        ? ` data-action="navigate" data-target="${safeTarget}" data-new-tab="true"`
        : ` data-action="navigate" data-target="${safeTarget}"`;
    }
    return `<button id="${escapeAttr(btn.id)}" style="${styleObjectToString(btn.styles)}" type="button"${actionAttrs}>${escapeHtml(btn.content)}</button>`;
  }).join('');

  if (element.configuration === 'twoColumn') {
    return `
      <nav id="${escapeAttr(element.id)}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${logoHtml}
        </div>
        <div style="display: flex; align-items: center; flex: 1; gap: 30px; justify-content: flex-end;">
          ${spansHtml}
        </div>
      </nav>
    `;
  }

  if (element.configuration === 'threeColumn') {
    return `
      <nav id="${escapeAttr(element.id)}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${logoHtml}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; flex: 1; gap: 16px;">
          ${spansHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          ${buttonsHtml}
        </div>
      </nav>
    `;
  }

  // customTemplateNavbar, defiNavbar, and any other config -- 3-column layout
  const firstSpan = spans[0];
  const navSpans = spans.slice(1);

  return `
    <nav id="${escapeAttr(element.id)}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
      <div style="display: flex; align-items: center; gap: 12px;">
        ${logoHtml}
        ${firstSpan ? `<span id="${escapeAttr(firstSpan.id)}" style="${styleObjectToString(firstSpan.styles)}">${escapeHtml(firstSpan.content)}</span>` : ''}
      </div>
      ${navSpans.length > 0 ? `
        <div style="display: flex; align-items: center; justify-content: center; flex: 1; gap: 16px;">
          ${navSpans.map(span => `<span id="${escapeAttr(span.id)}" style="${styleObjectToString(span.styles)}">${escapeHtml(span.content)}</span>`).join('')}
        </div>
      ` : ''}
      ${buttons.length > 0 ? `
        <div style="display: flex; align-items: center; gap: 16px;">
          ${buttonsHtml}
        </div>
      ` : ''}
    </nav>
  `;
};

/**
 * Generates HTML for a footer section -- renders children with semantic footer tag
 */
const generateFooterHtml = (element, options) => {
  const footerStyleString = styleObjectToString({
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    ...element.styles
  });

  return `
    <footer id="${escapeAttr(element.id)}" role="contentinfo" style="${footerStyleString}">
      ${renderChildrenHtml(element.children, options)}
    </footer>
  `;
};

/**
 * Generates HTML for a CTA section -- renders children within a styled section
 */
const generateCtaHtml = (element, options) => {
  const ctaStyleString = styleObjectToString({
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    ...element.styles
  });

  return `
    <section id="${escapeAttr(element.id)}" class="section-cta" style="${ctaStyleString}">
      ${renderChildrenHtml(element.children, options)}
    </section>
  `;
};

/**
 * Generates HTML for a ContentSection -- renders children within a styled section
 */
const generateContentSectionHtml = (element, options) => {
  const sectionStyleString = styleObjectToString({
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    ...element.styles
  });

  return `
    <section id="${escapeAttr(element.id)}" class="section-content" style="${sectionStyleString}">
      ${renderChildrenHtml(element.children, options)}
    </section>
  `;
};

/**
 * Generates HTML for a DeFi or Minting section -- renders children within a styled section.
 * For DeFi sections with aggregator modules that have selectedTokens, embeds a script
 * that fetches live prices from CoinGecko and updates stat values.
 */
const generateWeb3SectionHtml = (element, options) => {
  const sectionStyleString = styleObjectToString({
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    ...element.styles
  });

  return `
    <section id="${escapeAttr(element.id)}" class="section-web3" style="${sectionStyleString}">
      ${renderChildrenHtml(element.children, options)}
    </section>
  `;
};

/**
 * Section type to dedicated HTML generator dispatch map
 */
const SECTION_GENERATORS = {
  hero: generateHeroHtml,
  navbar: generateNavbarHtml,
  footer: generateFooterHtml,
  cta: generateCtaHtml,
  ContentSection: generateContentSectionHtml,
  defiSection: generateWeb3SectionHtml,
  mintingSection: generateWeb3SectionHtml,
};

/**
 * System / generic font families that don't need a Google Fonts import.
 */
const SYSTEM_FONTS = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'oxygen',
  'ubuntu', 'cantarell', 'open sans', 'helvetica neue', 'arial', 'helvetica',
  'times new roman', 'georgia', 'courier new', 'verdana',
]);

/**
 * Scans all elements for unique fontFamily values (from styles and
 * breakpointStyles) and returns Google Fonts <link> tags for any
 * non-system fonts that need to be loaded.
 */
const collectGoogleFontsHtml = (elements, extraFonts = []) => {
  const families = new Set();

  const extractFont = (styles) => {
    if (styles && styles.fontFamily) {
      // fontFamily can be a comma-separated list; take the first entry
      const raw = styles.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
      if (raw && !SYSTEM_FONTS.has(raw.toLowerCase())) {
        families.add(raw);
      }
    }
  };

  // Include any extra fonts (e.g. the global body font)
  for (const font of extraFonts) {
    if (font && !SYSTEM_FONTS.has(font.toLowerCase())) {
      families.add(font);
    }
  }

  for (const el of elements) {
    extractFont(el.styles);
    if (el.breakpointStyles) {
      extractFont(el.breakpointStyles.tablet);
      extractFont(el.breakpointStyles.mobile);
    }
  }

  if (families.size === 0) return '';

  const familyParams = [...families]
    .map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`)
    .join('&');

  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link href="https://fonts.googleapis.com/css2?${familyParams}&display=swap" rel="stylesheet">`,
  ].join('\n      ');
};

/**
 * Generates the complete HTML for a project
 * @param {Array} elements - Array of elements
 * @param {Object} websiteSettings - Website settings
 * @returns {string} - Generated HTML
 */
export const generateProjectHtml = (elements, websiteSettings, projectData) => {
  const themeColor = websiteSettings.primaryColor || '#5C4EFA';
  const bodyFont = websiteSettings.bodyFont || '';
  const bodyBgColor = websiteSettings.bodyBackgroundColor || '#ffffff';
  const bodyBgImage = websiteSettings.bodyBackgroundImage || '';
  const renderOptions = { themeColor };
  let bodyHtml = '';
  const processedElements = new Set();
  // Generate a unique nonce for this export to allow inline scripts via CSP
  const nonce = generateNonce();

  // Process elements and build HTML
  const hierarchicalElements = buildElementHierarchy(elements);

  // Render each root element and its children recursively
  hierarchicalElements.forEach(element => {
    if (!processedElements.has(element.id)) {
      const generator = SECTION_GENERATORS[element.type];
      const renderedContent = generator
        ? generator(element, renderOptions)
        : renderElementToHtml(element, [], renderOptions);

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
        --primary-color: ${themeColor};
        --text-color: #1a1a1a;
        --background-color: #ffffff;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: ${bodyFont ? `'${bodyFont}', ` : ''}-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: var(--text-color);
        background-color: ${bodyBgColor};
        ${bodyBgImage ? `background-image: url('${bodyBgImage}'); background-size: cover; background-position: center; background-attachment: fixed;` : ''}
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      body.loaded {
        opacity: 1;
      }

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
        .section-hero {
          flex-direction: column !important;
          padding: 24px !important;
        }
        .section-hero > div {
          max-width: 100% !important;
          width: 100% !important;
        }
        .section-cta {
          flex-direction: column !important;
          padding: 24px !important;
          text-align: center;
        }
        .section-content {
          flex-direction: column !important;
        }
        .section-content > div {
          max-width: 100% !important;
          width: 100% !important;
        }
        .section-web3 .defi-stats,
        .section-web3 .minting-stats { grid-template-columns: 1fr !important; }
        .section-web3 .defi-module,
        .section-web3 .minting-module { min-width: 0 !important; }
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

      /* Toggle switch — :checked drives visual state */
      input[type="checkbox"]:checked + .dappzy-toggle-track {
        background-color: var(--primary-color, #5C4EFA) !important;
      }
      input[type="checkbox"]:checked + .dappzy-toggle-track > .dappzy-toggle-knob {
        left: 22px !important;
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

      /* Scroll animation keyframes */
      @keyframes dappzy-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes dappzy-fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes dappzy-fadeInDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes dappzy-fadeInLeft {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes dappzy-fadeInRight {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes dappzy-zoomIn {
        from { opacity: 0; transform: scale(0.85); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes dappzy-zoomOut {
        from { opacity: 0; transform: scale(1.15); }
        to { opacity: 1; transform: scale(1); }
      }
      [data-scroll-animation] {
        opacity: 0;
      }
      [data-scroll-animation].scroll-animated {
        animation-fill-mode: both;
      }

    </style>
  `;

  // Generate meta tags -- nonce allows our inline scripts without 'unsafe-inline'
  const metaTags = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https:; script-src 'self' 'nonce-${nonce}' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:;">
    <meta name="description" content="${escapeAttr(websiteSettings.metaDescription || 'A website created with Dappzy')}" />
    <meta name="keywords" content="${escapeAttr(websiteSettings.metaKeywords || '')}" />
    <meta name="author" content="${escapeAttr(websiteSettings.author || 'Dappzy')}" />
    <meta name="robots" content="index, follow" />

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
  const googleFontsHtml = collectGoogleFontsHtml(elements, bodyFont ? [bodyFont] : []);

  // ── Dashboard-managed injections (analytics, custom code) ──
  const { analyticsSettings, customCode } = projectData || {};
  const headInjectCode = websiteSettings.headInjectCode || '';
  let analyticsHtml = '';

  if (analyticsSettings?.gaId && !headInjectCode.includes('googletagmanager.com/gtag')) {
    analyticsHtml += `
<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(analyticsSettings.gaId)}"></script>
<script nonce="${nonce}">window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeAttr(analyticsSettings.gaId)}');</script>`;
  }

  if (analyticsSettings?.plausibleDomain && !headInjectCode.includes('plausible.io')) {
    analyticsHtml += `
<script defer data-domain="${escapeAttr(analyticsSettings.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>`;
  }

  let customCssHtml = '';
  if (customCode?.css) {
    customCssHtml = `<style>${customCode.css}</style>`;
  }
  let customHeadHtml = customCode?.head || '';
  let customJsHtml = '';
  if (customCode?.js) {
    customJsHtml = `<script nonce="${nonce}">${customCode.js}</script>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${metaTags}
      <link rel="icon" href="${escapeAttr(favicon)}">
      ${websiteSettings.canonicalUrl ? `<link rel="canonical" href="${escapeAttr(websiteSettings.canonicalUrl)}">` : ''}
      <title>${escapeHtml(title)}</title>
      ${elements.some(el => el.type === 'icon') ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />` : ''}
      ${googleFontsHtml}
      ${stylesHtml}
      ${customCssHtml}
      ${analyticsHtml}
      ${customHeadHtml}
      <script nonce="${nonce}">
        // IPFS Gateway Fallback
        var ipfsGateways = ${JSON.stringify(IPFS_GATEWAYS)};

        // Function to handle image loading with fallback
        function handleImageLoad(img) {
          if (img.src.startsWith('ipfs://')) {
            var ipfsHash = img.src.replace('ipfs://', '');
            var currentGatewayIndex = 0;

            function tryNextGateway() {
              if (currentGatewayIndex >= ipfsGateways.length) {
                return;
              }

              var gateway = ipfsGateways[currentGatewayIndex];
              img.src = gateway + ipfsHash;
              currentGatewayIndex++;
            }

            img.onerror = tryNextGateway;
            tryNextGateway();
          }
          img.classList.add('loaded');
        }

        // Initialize image loading
        document.addEventListener('DOMContentLoaded', function() {
          document.querySelectorAll('img').forEach(function(img) {
            img.classList.add('loading');
            handleImageLoad(img);
          });
        });
      </script>
      <script type="application/ld+json">
      ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": websiteSettings.siteTitle || 'My Website',
        "description": websiteSettings.metaDescription || 'A website created with Dappzy',
        "url": websiteSettings.canonicalUrl || ''
      })}
      </script>
      ${websiteSettings.headInjectCode || ''}
    </head>
    <body>
      <a href="#main-content" class="skip-link">Skip to content</a>
      <main id="main-content">
      ${bodyHtml}
      </main>
      <script nonce="${nonce}">
        // Delegated event handler for data-action elements (replaces inline onclick)
        document.addEventListener('click', function(e) {
          var el = e.target.closest('[data-action]');
          if (!el) return;
          var action = el.getAttribute('data-action');
          var target = el.getAttribute('data-target');
          var newTab = el.getAttribute('data-new-tab') === 'true';

          switch (action) {
            case 'navigate':
              if (newTab) {
                window.open(target, '_blank');
              } else {
                window.location.href = target;
              }
              break;
            case 'scroll-to':
              var targetEl = document.getElementById(target);
              if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
              break;
            case 'download':
              var a = document.createElement('a');
              a.href = target;
              a.download = '';
              a.click();
              break;
            case 'scroll-top':
              window.scrollTo({ top: 0, behavior: 'smooth' });
              break;
            case 'open-modal':
              var modal = document.getElementById(target);
              if (modal) modal.style.display = 'flex';
              break;
            case 'close-modal-backdrop':
              if (e.target === el) el.style.display = 'none';
              break;
            case 'close-modal':
              var modalOverlay = el.closest('[data-action="close-modal-backdrop"]');
              if (modalOverlay) modalOverlay.style.display = 'none';
              break;
            case 'carousel-prev':
            case 'carousel-next':
              var carousel = el.closest('[data-carousel]');
              if (!carousel) break;
              var allSlides = carousel.querySelectorAll('[data-slide]');
              var count = allSlides.length;
              if (count === 0) break;
              var current = -1;
              allSlides.forEach(function(s, i) { if (s.style.display !== 'none') current = i; });
              if (current === -1) current = 0;
              var next = action === 'carousel-next' ? (current + 1) % count : (current - 1 + count) % count;
              allSlides.forEach(function(s, i) { s.style.display = i === next ? 'flex' : 'none'; });
              break;
            case 'switch-tab':
              var tabIndex = parseInt(el.getAttribute('data-tab-index'), 10);
              var container = el.closest('div');
              if (!container) break;
              var wrapper = container.parentElement;
              if (!wrapper) break;
              wrapper.querySelectorAll('[data-tab-body]').forEach(function(b, idx) {
                b.style.display = idx === tabIndex ? 'block' : 'none';
              });
              container.querySelectorAll('button').forEach(function(b, idx) {
                b.style.borderBottomColor = idx === tabIndex ? '#5C4EFA' : 'transparent';
                b.style.fontWeight = idx === tabIndex ? '600' : '400';
                b.style.color = idx === tabIndex ? '#5C4EFA' : '#666';
              });
              break;
            case 'dismiss-alert':
              var alertEl = el.closest('[data-alert]');
              if (alertEl) alertEl.style.display = 'none';
              break;
            case 'accordion-toggle':
              var parentDetails = el.closest('details');
              if (!parentDetails) break;
              var accordionContainer = parentDetails.parentElement;
              if (!accordionContainer) break;
              accordionContainer.querySelectorAll('details').forEach(function(d) {
                if (d !== parentDetails) d.removeAttribute('open');
              });
              break;
            case 'open-lightbox':
              var lightboxContainer = el.closest('[data-lightbox]');
              if (!lightboxContainer) break;
              var overlay = lightboxContainer.querySelector('[data-lightbox-overlay]');
              var fullImg = lightboxContainer.querySelector('[data-lightbox-full]');
              if (!overlay || !fullImg) break;
              var images = JSON.parse(lightboxContainer.getAttribute('data-lightbox-images') || '[]');
              var idx = parseInt(el.getAttribute('data-lightbox-index'), 10) || 0;
              overlay.setAttribute('data-lightbox-current', idx);
              fullImg.src = images[idx] || '';
              overlay.style.display = 'flex';
              break;
            case 'lightbox-close':
              var lbOverlay = el.closest('[data-lightbox-overlay]');
              if (lbOverlay) lbOverlay.style.display = 'none';
              break;
            case 'lightbox-prev':
            case 'lightbox-next':
              var lbOv = el.closest('[data-lightbox-overlay]');
              var lbContainer = el.closest('[data-lightbox]');
              if (!lbOv || !lbContainer) break;
              var lbImages = JSON.parse(lbContainer.getAttribute('data-lightbox-images') || '[]');
              var lbCount = lbImages.length;
              if (lbCount === 0) break;
              var lbCurrent = parseInt(lbOv.getAttribute('data-lightbox-current'), 10) || 0;
              var lbNext = action === 'lightbox-next' ? (lbCurrent + 1) % lbCount : (lbCurrent - 1 + lbCount) % lbCount;
              lbOv.setAttribute('data-lightbox-current', lbNext);
              var lbFullImg = lbOv.querySelector('[data-lightbox-full]');
              if (lbFullImg) lbFullImg.src = lbImages[lbNext] || '';
              break;
            case 'paginate':
              var direction = el.getAttribute('data-direction');
              var nav = el.closest('nav');
              if (!nav) break;
              var pageButtons = nav.querySelectorAll('[data-page]');
              var currentPage = -1;
              pageButtons.forEach(function(btn) { if (btn.getAttribute('data-active') === 'true') currentPage = parseInt(btn.getAttribute('data-page'), 10); });
              if (currentPage === -1) break;
              var totalPages = pageButtons.length;
              var newPage = direction === 'next' ? Math.min(currentPage + 1, totalPages) : Math.max(currentPage - 1, 1);
              pageButtons.forEach(function(btn) {
                var p = parseInt(btn.getAttribute('data-page'), 10);
                btn.setAttribute('data-active', p === newPage ? 'true' : 'false');
                btn.style.backgroundColor = p === newPage ? (nav.getAttribute('data-accent') || '#5c4efa') : 'transparent';
                btn.style.color = p === newPage ? '#fff' : '#333';
              });
              break;
          }
        });

        // Slider value display via event delegation (CSP-safe, no inline handlers)
        document.addEventListener('input', function(e) {
          var slider = e.target.closest('[data-slider]');
          if (!slider) return;
          var valueLabel = slider.parentElement.querySelector('[data-slider-value]');
          if (valueLabel) valueLabel.textContent = slider.value;
        });

        // Tooltip hover handlers via event delegation
        document.addEventListener('mouseenter', function(e) {
          var el = e.target.closest('[data-action="tooltip"]');
          if (!el) return;
          var tip = el.querySelector('[data-tip]');
          if (tip) { tip.style.opacity = '1'; tip.style.visibility = 'visible'; }
        }, true);
        document.addEventListener('mouseleave', function(e) {
          var el = e.target.closest('[data-action="tooltip"]');
          if (!el) return;
          var tip = el.querySelector('[data-tip]');
          if (tip) { tip.style.opacity = '0'; tip.style.visibility = 'hidden'; }
        }, true);

        // Fade-in body after DOM is ready (no LCP-blocking preloader)
        document.addEventListener('DOMContentLoaded', function() {
          document.body.classList.add('loaded');
        });
      </script>
      ${elements.some(el => el.scrollAnimation && el.scrollAnimation.type && el.scrollAnimation.type !== 'none') ? `
      <script nonce="${nonce}">
        (function() {
          var animMap = {
            fadeIn: 'dappzy-fadeIn',
            fadeInUp: 'dappzy-fadeInUp',
            fadeInDown: 'dappzy-fadeInDown',
            fadeInLeft: 'dappzy-fadeInLeft',
            fadeInRight: 'dappzy-fadeInRight',
            zoomIn: 'dappzy-zoomIn',
            zoomOut: 'dappzy-zoomOut'
          };
          var observer = new IntersectionObserver(function(entries, obs) {
            entries.forEach(function(entry) {
              if (!entry.isIntersecting) return;
              var el = entry.target;
              var type = el.getAttribute('data-scroll-animation');
              var duration = el.getAttribute('data-scroll-duration') || '600';
              var delay = el.getAttribute('data-scroll-delay') || '0';
              var once = el.getAttribute('data-scroll-once');
              var animName = animMap[type];
              if (!animName) return;
              el.style.animationName = animName;
              el.style.animationDuration = duration + 'ms';
              el.style.animationDelay = delay + 'ms';
              el.style.animationTimingFunction = 'ease-out';
              el.classList.add('scroll-animated');
              if (once === 'true') {
                obs.unobserve(el);
              } else {
                el.addEventListener('animationend', function handler() {
                  el.classList.remove('scroll-animated');
                  el.style.animationName = '';
                  el.style.opacity = '0';
                  el.removeEventListener('animationend', handler);
                });
              }
            });
          }, { threshold: 0.1 });
          document.querySelectorAll('[data-scroll-animation]').forEach(function(el) {
            observer.observe(el);
          });
        })();
      </script>` : ''}
      ${elements.some(el => {
        if (el.type !== 'defiModule') return false;
        const c = typeof el.content === 'object' ? el.content : (() => { try { return JSON.parse(el.content); } catch { return {}; } })();
        return (el.moduleType === 'aggregator' || c.moduleType === 'aggregator') && c.settings?.selectedTokens?.length > 0;
      }) ? (() => {
        const tokenIds = [...new Set(elements.filter(el => {
          if (el.type !== 'defiModule') return false;
          const c = typeof el.content === 'object' ? el.content : (() => { try { return JSON.parse(el.content); } catch { return {}; } })();
          return (el.moduleType === 'aggregator' || c.moduleType === 'aggregator') && c.settings?.selectedTokens?.length > 0;
        }).flatMap(el => {
          const c = typeof el.content === 'object' ? el.content : (() => { try { return JSON.parse(el.content); } catch { return {}; } })();
          return c.settings?.selectedTokens || [];
        }))];
        return `
      <script nonce="${nonce}">
        (function() {
          var tokenIds = ${JSON.stringify(tokenIds)};
          function fetchPrices() {
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + tokenIds.join(',') + '&vs_currencies=usd&include_24hr_change=true')
              .then(function(r) { return r.json(); })
              .then(function(data) {
                document.querySelectorAll('[data-token-stat]').forEach(function(el) {
                  var tokenId = el.getAttribute('data-token-stat');
                  if (data[tokenId]) {
                    var price = data[tokenId].usd;
                    var change = data[tokenId].usd_24h_change;
                    var fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(price);
                    var changeFmt = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
                    el.textContent = fmt + ' (' + changeFmt + ')';
                    el.style.color = change >= 0 ? '#52c41a' : '#ff4d4f';
                  }
                });
              })
              .catch(function() {});
          }
          fetchPrices();
          setInterval(fetchPrices, 60000);
        })();
      </script>`;
      })() : ''}
      ${elements.some(el => el.type === 'connectWalletButton' || el.type === 'connectwalletbutton') ? `
      <script nonce="${nonce}">
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
      <script nonce="${nonce}">
        document.querySelectorAll('form[data-dappzy-form]').forEach(function(form) {
          form.addEventListener('submit', function(e) {
            if (!form.getAttribute('action') || form.getAttribute('action') === '#') {
              e.preventDefault();
              var msgEl = document.createElement('div');
              msgEl.textContent = 'Form submitted successfully!';
              msgEl.style.cssText = 'padding:12px;background:#4CAF50;color:#fff;text-align:center;border-radius:4px;margin-top:8px;';
              this.parentNode.insertBefore(msgEl, this.nextSibling);
              setTimeout(function(){ msgEl.remove(); }, 3000);
            }
          });
        });
      </script>` : ''}
      ${elements.some(el => el.type === 'countdown') ? `
      <script nonce="${nonce}">
        (function() {
          function pad(n) { return String(n).padStart(2, '0'); }
          function updateCountdowns() {
            document.querySelectorAll('[data-countdown]').forEach(function(el) {
              var target = new Date(el.getAttribute('data-countdown')).getTime();
              var diff = target - Date.now();
              var expired = diff <= 0;
              var days = expired ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));
              var hours = expired ? 0 : Math.floor((diff / (1000 * 60 * 60)) % 24);
              var minutes = expired ? 0 : Math.floor((diff / (1000 * 60)) % 60);
              var seconds = expired ? 0 : Math.floor((diff / 1000) % 60);
              var units = el.querySelectorAll('[data-countdown-unit]');
              units.forEach(function(u) {
                var unit = u.getAttribute('data-countdown-unit');
                var span = u.querySelector('span');
                if (!span) return;
                if (unit === 'days') span.textContent = pad(days);
                else if (unit === 'hours') span.textContent = pad(hours);
                else if (unit === 'minutes') span.textContent = pad(minutes);
                else if (unit === 'seconds') span.textContent = pad(seconds);
              });
            });
          }
          updateCountdowns();
          setInterval(updateCountdowns, 1000);
        })();
      </script>` : ''}
      ${elements.some(el => {
        if (el.type !== 'rating') return false;
        const c = typeof el.content === 'object' ? el.content : (() => { try { return JSON.parse(el.content); } catch { return {}; } })();
        return c.interactive === true;
      }) ? `
      <script nonce="${nonce}">
        document.addEventListener('click', function(e) {
          var star = e.target.closest('[data-action="rate"]');
          if (!star) return;
          var container = star.closest('[data-rating]');
          if (!container) return;
          var index = parseInt(star.getAttribute('data-star-index'), 10);
          var stars = container.querySelectorAll('[data-action="rate"]');
          stars.forEach(function(s, i) {
            var filled = i <= index;
            s.textContent = filled ? '\u2605' : '\u2606';
            s.style.color = filled ? (s.getAttribute('data-star-color') || container.getAttribute('data-star-color') || '#FFD700') : '#ccc';
          });
        });
      </script>` : ''}
      ${customJsHtml}
    </body>
    </html>
  `.trim();
};

/**
 * Convert a page slug to the filename used in multi-page export.
 * "/" -> "index.html", "/about" -> "about.html"
 */
const slugToFilename = (slug) => {
  if (!slug || slug === '/') return 'index.html';
  const clean = slug.replace(/^\//, '').replace(/\/$/, '');
  return `${clean}.html`;
};

/**
 * Generates HTML for a single page, with optional inter-page navigation links.
 * @param {Object} page - { id, name, slug, elements }
 * @param {Array} allPages - full pages array (for generating nav links)
 * @param {Object} websiteSettings - shared website settings
 * @returns {string} - Generated HTML string
 */
export const generatePageHtml = (page, allPages, websiteSettings, projectData) => {
  // Generate the base HTML using the existing single-page generator
  const html = generateProjectHtml(page.elements || [], websiteSettings, projectData);

  // If there's only one page, no inter-page nav needed
  if (!allPages || allPages.length <= 1) return html;

  // Build a small navigation bar with links to all pages
  const navLinks = allPages.map(p => {
    const href = slugToFilename(p.slug);
    const isActive = p.id === page.id;
    return `<a href="${href}" style="color:inherit;text-decoration:${isActive ? 'underline' : 'none'};font-weight:${isActive ? '600' : '400'};padding:4px 10px;">${escapeHtml(p.name)}</a>`;
  }).join('');

  const pageNavHtml = `<nav data-pages style="display:flex;align-items:center;gap:4px;padding:8px 16px;background:rgba(0,0,0,0.03);font-family:sans-serif;font-size:14px;border-bottom:1px solid rgba(0,0,0,0.08);">${navLinks}</nav>`;

  // Inject the page nav right after <main id="main-content">
  return html.replace(
    '<main id="main-content">',
    `<main id="main-content">\n      ${pageNavHtml}`
  );
};

/**
 * Generates all page HTML files for a multi-page project.
 * Returns an array of { filename, html } objects.
 * @param {Array} pages - the pages array
 * @param {Object} websiteSettings - shared website settings
 * @returns {Array<{filename: string, html: string}>}
 */
export const generateAllPagesHtml = (pages, websiteSettings, projectData) => {
  if (!pages || pages.length === 0) return [];
  if (pages.length === 1) {
    // Single page — export without inter-page nav
    return [{
      filename: slugToFilename(pages[0].slug),
      html: generateProjectHtml(pages[0].elements || [], websiteSettings, projectData),
    }];
  }
  return pages.map(page => ({
    filename: slugToFilename(page.slug),
    html: generatePageHtml(page, pages, websiteSettings, projectData),
  }));
};

/**
 * Generates a single combined HTML file containing ALL pages with a
 * JavaScript-based page router. Each page's content is wrapped in a
 * `<div data-page="slug">` and a navigation bar at the top switches
 * between them.  This avoids multi-file download issues that browsers
 * block.
 *
 * @param {Array} pages - the pages array
 * @param {Object} websiteSettings - shared website settings
 * @returns {string} - a single HTML string with all pages embedded
 */
export const generateCombinedPagesHtml = (pages, websiteSettings, projectData) => {
  if (!pages || pages.length === 0) return '';
  if (pages.length === 1) {
    return generateProjectHtml(pages[0].elements || [], websiteSettings, projectData);
  }

  // Generate standalone HTML for each page
  const pageEntries = pages.map(page => ({
    id: page.id,
    name: page.name || 'Untitled',
    slug: page.slug || '/',
    html: generateProjectHtml(page.elements || [], websiteSettings, projectData),
  }));

  // Extract the <body> content from each page's full HTML
  const extractBody = (html) => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : html;
  };

  // Build page container divs
  const pageDivs = pageEntries.map((entry, i) => {
    const bodyContent = extractBody(entry.html);
    const display = i === 0 ? 'block' : 'none';
    return `<div data-page="${escapeAttr(entry.slug)}" style="display:${display};">${bodyContent}</div>`;
  }).join('\n');

  // Build the nav bar
  const navButtons = pageEntries.map((entry, i) => {
    return `<button data-nav-page="${escapeAttr(entry.slug)}" style="padding:6px 14px;border:none;border-radius:4px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:${i === 0 ? '600' : '400'};background:${i === 0 ? 'var(--primary-color,#5C4EFA)' : 'transparent'};color:${i === 0 ? '#fff' : 'inherit'};">${escapeHtml(entry.name)}</button>`;
  }).join('');

  const navBar = `<nav data-page-nav style="display:flex;align-items:center;gap:4px;padding:8px 16px;background:rgba(0,0,0,0.03);font-family:sans-serif;font-size:14px;border-bottom:1px solid rgba(0,0,0,0.08);position:sticky;top:0;z-index:9999;">${navButtons}</nav>`;

  // Router script
  const routerScript = `
    <script>
      (function(){
        var nav = document.querySelector('[data-page-nav]');
        if (!nav) return;
        nav.addEventListener('click', function(e) {
          var btn = e.target.closest('[data-nav-page]');
          if (!btn) return;
          var slug = btn.getAttribute('data-nav-page');
          // Hide all pages
          document.querySelectorAll('[data-page]').forEach(function(p) {
            p.style.display = 'none';
          });
          // Show target page
          var target = document.querySelector('[data-page="' + slug + '"]');
          if (target) target.style.display = 'block';
          // Update active button styles
          nav.querySelectorAll('[data-nav-page]').forEach(function(b) {
            var isActive = b.getAttribute('data-nav-page') === slug;
            b.style.fontWeight = isActive ? '600' : '400';
            b.style.background = isActive ? 'var(--primary-color,#5C4EFA)' : 'transparent';
            b.style.color = isActive ? '#fff' : 'inherit';
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      })();
    </script>`;

  // Use the first page's full HTML as the shell (to get the <head>, styles, etc.)
  const shellHtml = pageEntries[0].html;
  // Replace the body content with our combined pages
  const combined = shellHtml.replace(
    /<body[^>]*>([\s\S]*?)<\/body>/i,
    `<body>\n${navBar}\n${pageDivs}\n${routerScript}\n</body>`
  );

  return combined;
};
