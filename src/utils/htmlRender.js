import { escapeHtml, escapeAttr, sanitizeStyleValue, camelToKebab } from './export/escapeUtils';

/**
 * Allowed HTML tags for rich text content (from contentEditable formatting).
 * Everything else is stripped to prevent XSS.
 */
const SAFE_TAGS = new Set([
  'b', 'i', 'u', 'strong', 'em', 'a', 'br', 'span', 'sub', 'sup', 'mark', 's', 'small',
]);

/**
 * Sanitizes rich text HTML: keeps only safe formatting tags and removes
 * dangerous elements (script, iframe, etc.) and event handler attributes.
 * Safe tags retain href (for <a>) and style attributes only.
 */
function sanitizeRichText(html) {
  if (!html || typeof html !== 'string') return '';
  // Create a temporary DOM to parse the HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const sanitizeNode = (node) => {
    if (node.nodeType === 3) return node.textContent; // Text node
    if (node.nodeType !== 1) return ''; // Skip non-element nodes
    const tagName = node.tagName.toLowerCase();
    // If the tag is not in our safe list, just return sanitized children
    if (!SAFE_TAGS.has(tagName)) {
      return Array.from(node.childNodes).map(sanitizeNode).join('');
    }
    // Build safe attributes
    let attrs = '';
    if (tagName === 'a' && node.getAttribute('href')) {
      const href = node.getAttribute('href');
      // Only allow http(s) and mailto protocols
      if (/^(https?:|mailto:|tel:)/i.test(href) || href.startsWith('#') || href.startsWith('/')) {
        attrs += ` href="${escapeAttr(href)}"`;
        if (node.getAttribute('target') === '_blank') {
          attrs += ' target="_blank" rel="noopener noreferrer"';
        }
      }
    }
    if (node.getAttribute('style')) {
      attrs += ` style="${escapeAttr(node.getAttribute('style'))}"`;
    }
    const childrenHtml = Array.from(node.childNodes).map(sanitizeNode).join('');
    if (tagName === 'br') return '<br>';
    return `<${tagName}${attrs}>${childrenHtml}</${tagName}>`;
  };
  return Array.from(doc.body.childNodes).map(sanitizeNode).join('');
}

/**
 * Renders text content for an element. If the content contains HTML tags
 * (from rich text editing), it is sanitized and output directly.
 * Otherwise it is escaped as plain text.
 */
function renderTextContent(content) {
  if (!content || typeof content !== 'string') return '';
  // Check if content has HTML tags
  if (/<[^>]+>/.test(content)) {
    return sanitizeRichText(content);
  }
  return escapeHtml(content);
}

export function buildAttributesString(type, attributes, src, settings = {}) {
  let attributesString = '';

  if (type === 'input' && attributes.type) {
    attributesString += ` type="${escapeAttr(attributes.type)}"`;
  }

  if (type === 'anchor') {
    const href = attributes.href || settings.targetValue;
    if (href) {
      attributesString += ` href="${escapeAttr(href)}"`;
    }
    if (settings.openInNewTab) {
      attributesString += ` target="_blank" rel="noopener noreferrer"`;
    }
  }

  // Include both "img" and "image" types.
  if (['img', 'image', 'video', 'audio', 'iframe', 'source'].includes(type) && src) {
    attributesString += ` src="${escapeAttr(src)}"`;
  }

  if (type === 'select' && attributes.multiple) {
    attributesString += ' multiple';
  }

  if (type === 'option' && attributes.value) {
    attributesString += ` value="${escapeAttr(attributes.value)}"`;
  }

  if (type === 'progress' && attributes.value && attributes.max) {
    attributesString += ` value="${escapeAttr(attributes.value)}" max="${escapeAttr(attributes.max)}"`;
  }

  if (type === 'meter' && attributes.value && attributes.min && attributes.max) {
    attributesString += ` value="${escapeAttr(attributes.value)}" min="${escapeAttr(attributes.min)}" max="${escapeAttr(attributes.max)}"`;
  }

  if (type === 'iframe' && attributes.frameborder) {
    attributesString += ` frameborder="${escapeAttr(attributes.frameborder)}"`;
  }

  if (type === 'date') {
    attributesString += ` type="date"`;
  }

  if (type === 'button' && settings.targetValue && settings.actionType !== 'Dropdown') {
    let resolvedTarget = settings.targetValue;
    if (settings.actionType === 'mailto' && !resolvedTarget.startsWith('mailto:')) {
      resolvedTarget = `mailto:${resolvedTarget}`;
    } else if (settings.actionType === 'tel' && !resolvedTarget.startsWith('tel:')) {
      resolvedTarget = `tel:${resolvedTarget}`;
    }
    const safeTarget = escapeAttr(resolvedTarget);
    if (settings.openInNewTab) {
      attributesString += ` data-action="navigate" data-target="${safeTarget}" data-new-tab="true"`;
    } else {
      attributesString += ` data-action="navigate" data-target="${safeTarget}"`;
    }
  }

  if (type === 'span' && settings.targetValue) {
    const safeTarget = escapeAttr(settings.targetValue);
    if (settings.actionType === 'pageSection') {
      attributesString += ` data-action="scroll-to" data-target="${safeTarget}" style="cursor: pointer;"`;
    } else if (settings.actionType === 'file') {
      if (settings.downloadFile) {
        attributesString += ` data-action="download" data-target="${safeTarget}" style="cursor: pointer;"`;
      } else {
        attributesString += ` data-action="navigate" data-target="${safeTarget}" data-new-tab="true" style="cursor: pointer;"`;
      }
    }
  }

  return attributesString;
}

/**
 * Renders an element to HTML with all its properties and styles
 */
export function renderElementToHtml(element, collectedStyles = [], options = {}) {
  if (!element) return '';

  // Skip hidden elements — they should not appear in the published site
  if (element.configuration?.hidden === true || element.settings?.hidden === true) {
    return '';
  }

  const themeColor = options.themeColor || '#5C4EFA';
  const {
    type,
    content,
    children = [],
    style = '',
    className = '',
    attributes = {},
    dataAttributes = {},
    events = {},
    configuration = {},
    styles = {},
    inlineStyles = {},
    id
  } = element;

  // Helper to generate attributes string
  function getAttributesString(attrs) {
    return Object.entries(attrs)
      .map(([k, v]) => `${camelToKebab(k)}="${escapeAttr(String(v))}"`)
      .join(' ');
  }

  // Helper to generate data attributes string
  function getDataAttributesString(attrs) {
    return Object.entries(attrs)
      .map(([k, v]) => `data-${camelToKebab(k)}="${escapeAttr(String(v))}"`)
      .join(' ');
  }

  // Helper to generate event data attributes (CSP-safe, no inline handlers)
  function getEventsString(evts) {
    // Events are handled via delegated listeners; store as data attributes for reference
    return Object.entries(evts)
      .map(([k, v]) => `data-event-${camelToKebab(k)}="${escapeAttr(String(v))}"`)
      .join(' ');
  }

  // Helper to merge and stringify all styles (inline + styles + configuration)
  function getAllStyles(element) {
    let merged = {};
    if (element.configuration && element.configuration.styles) {
      merged = { ...merged, ...element.configuration.styles };
    }
    if (element.styles) {
      merged = { ...merged, ...element.styles };
    }
    if (element.inlineStyles) {
      merged = { ...merged, ...element.inlineStyles };
    }
    if (typeof element.style === 'string' && element.style.trim()) {
      // Parse style string into object
      element.style.split(';').forEach(pair => {
        const [k, v] = pair.split(':');
        if (k && v) merged[k.trim()] = v.trim();
      });
    }
    // Remove editor-specific selection outline (keep user-defined boxShadow)
    delete merged.outline;
    // Remove non-CSS metadata fields used by editor components
    delete merged.backgroundType;
    delete merged.tooltipPosition;
    delete merged.allowMultiple;
    delete merged.poster;
    // Convert to style string
    return Object.entries(merged)
      .filter(([k, v]) => k && v)
      .map(([k, v]) => {
        const safe = sanitizeStyleValue(String(v));
        return safe ? `${camelToKebab(k)}: ${safe}` : null;
      })
      .filter(Boolean)
      .join('; ');
  }

  // Tag mapping for common builder types
  const tagMap = {
    navbar: 'nav',
    defisection: 'section',
    module: 'div',
    connectwalletbutton: 'button',
    span: 'span',
    image: 'img',
    link: 'a',
    value: 'div',
    chart: 'div',
    heading: 'h3',
    title: 'h1',
    description: 'p',
    footer: 'footer',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    form: 'form',
    div: 'div',
    section: 'section',
    nav: 'nav',
    button: 'button',
    a: 'a',
    img: 'img',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    ul: 'ul',
    li: 'li',
    ol: 'ol',
    table: 'table',
    tr: 'tr',
    td: 'td',
    th: 'th',
    tbody: 'tbody',
    thead: 'thead',
    tfoot: 'tfoot',
    label: 'label',
    strong: 'strong',
    em: 'em',
    b: 'b',
    i: 'i',
    u: 'u',
    small: 'small',
    pre: 'pre',
    code: 'code',
    blockquote: 'blockquote',
    hr: 'hr',
    br: 'br',
    // Section types
    cta: 'section',
    ContentSection: 'section',
    hero: 'section',
    defiModule: 'div',
    mintingModule: 'div',
    // Interactive / custom builder types
    tabs: 'div',
    accordion: 'div',
    dropdown: 'div',
    modal: 'div',
    carousel: 'div',
    tooltip: 'span',
    searchBar: 'div',
    backToTop: 'button',
    fileUpload: 'div',
    datePicker: 'div',
    breadcrumb: 'nav',
    countdown: 'div',
    codeInject: 'div',
    checkbox: 'label',
    radio: 'label',
    toggle: 'label',
    // Media types
    video: 'video',
    youtubeVideo: 'iframe',
    bgVideo: 'video',
    list: 'ul',
    'list-item': 'li',
    anchor: 'a',
    linkBlock: 'a',
    linkblock: 'a',
    paragraph: 'p',
    line: 'hr',
    horizontalRule: 'hr',
    icon: 'span',
    container: 'div',
    hflex: 'div',
    vflex: 'div',
    hflexLayout: 'div',
    vflexLayout: 'div',
    gridLayout: 'div',
    grid: 'div',
    spacer: 'div',
    separator: 'hr',
    badge: 'span',
    audio: 'audio',
    iframe: 'iframe',
    mapEmbed: 'iframe',
    socialLinks: 'div',
    slider: 'div',
    rating: 'div',
    lightbox: 'div',
    marquee: 'div',
    alert: 'div',
    pagination: 'nav',
    progress: 'progress',
    meter: 'meter',
    tableRow: 'tr',
    tableCell: 'td',
    'table-row': 'tr',
    'table-cell': 'td',
    // fallback
    default: 'div',
  };

  // Determine tag
  const tag = tagMap[type] || tagMap.default;
  const styleString = getAllStyles(element);
  const classString = className ? ` ${escapeAttr(className)}` : '';
  const idString = id ? ` id="${escapeAttr(id)}"` : '';
  const attrString = getAttributesString(attributes);
  const dataAttrString = getDataAttributesString(dataAttributes);
  const eventString = getEventsString(events);

  // Scroll animation data attributes
  const scrollAnim = element.scrollAnimation;
  const scrollAnimString = scrollAnim && scrollAnim.type && scrollAnim.type !== 'none'
    ? ` data-scroll-animation="${escapeAttr(scrollAnim.type)}" data-scroll-duration="${escapeAttr(String(scrollAnim.duration || 600))}" data-scroll-delay="${escapeAttr(String(scrollAnim.delay || 0))}" data-scroll-once="${escapeAttr(String(scrollAnim.once !== false))}"`
    : '';

  // Web3 element special handling
  if (type === 'connectWalletButton' || type === 'connectwalletbutton') {
    return `<button${idString} class="${classString.trim()}" style="${styleString}" data-wallet-connect type="button" ${attrString} ${dataAttrString}>${escapeHtml(content || 'Connect Wallet')}</button>`;
  }
  if (type === 'mintingSection') {
    return `<section${idString} class="section-web3${classString}" style="${styleString}" ${attrString} ${dataAttrString}>${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</section>`;
  }
  if (type === 'defiSection') {
    return `<section${idString} class="section-web3${classString}" style="${styleString}" ${attrString} ${dataAttrString}>${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</section>`;
  }
  if (type === 'defiModule') {
    const moduleContent = typeof content === 'object' ? content : (() => { try { return JSON.parse(content); } catch { return {}; } })();
    // Skip disabled modules in export
    if (moduleContent.enabled === false) return '';
    const moduleType = element.moduleType || moduleContent.moduleType || 'aggregator';
    const title = moduleContent.title || moduleType;
    const description = moduleContent.description || '';
    const stats = moduleContent.stats || [];
    const settings = moduleContent.settings || {};
    const showStats = settings.showStats !== false;
    const showButton = settings.showButton !== false;
    const selectedTokens = settings.selectedTokens || [];

    // For aggregator modules with selectedTokens, use the token ID for data-token-stat
    // so the CoinGecko script can hydrate live prices by matching token IDs
    const statsHtml = showStats && stats.length > 0
      ? `<div class="defi-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px">${stats.map((s, i) =>
          `<div style="display:flex;flex-direction:column;gap:4px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px"><span style="color:#999;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px">${escapeHtml(s.label)}</span><span class="defi-stat-value" style="color:#fff;font-weight:bold;font-size:1rem" ${moduleType === 'aggregator' && selectedTokens[i] ? `data-token-stat="${escapeAttr(selectedTokens[i])}"` : ''}>${escapeHtml(s.value)}</span></div>`
        ).join('')}</div>`
      : '';

    const buttonHtml = showButton
      ? `<button type="button" style="background:linear-gradient(135deg,#5C4EFA,#7B6CFF);color:#fff;padding:12px 24px;border-radius:8px;border:none;cursor:pointer;width:100%;font-size:1rem;font-weight:bold" data-wallet-connect>Connect Wallet</button>`
      : '';

    return `<div${idString} class="defi-module${classString}" style="${styleString}"><div style="padding:20px"><h3 style="margin:0 0 10px;font-size:1.5rem;color:#fff;font-weight:bold">${escapeHtml(title)}</h3><p style="margin:0 0 20px;color:#ccc;font-size:1rem;line-height:1.5">${escapeHtml(description)}</p>${statsHtml}${buttonHtml}</div></div>`;
  }

  if (type === 'mintingModule') {
    const moduleContent = typeof content === 'object' ? content : (() => { try { return JSON.parse(content); } catch { return {}; } })();
    // Skip disabled modules in export
    if (moduleContent.enabled === false) return '';
    const moduleType = element.moduleType || moduleContent.moduleType || 'minting';
    const title = moduleContent.title || moduleType;
    const description = moduleContent.description || '';
    const stats = moduleContent.stats || [];
    const items = moduleContent.items || [];
    const settings = moduleContent.settings || {};
    const showStats = settings.showStats !== false;
    const showButton = settings.showButton !== false;

    const statsHtml = showStats && stats.length > 0
      ? `<div class="minting-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px">${stats.map(s =>
          `<div style="display:flex;flex-direction:column;gap:4px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px"><span style="color:#999;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px">${escapeHtml(s.label)}</span><span style="color:#fff;font-weight:bold;font-size:1rem">${escapeHtml(s.value)}</span></div>`
        ).join('')}</div>`
      : '';

    let moduleBodyHtml = '';
    if (moduleType === 'minting' && showButton) {
      moduleBodyHtml = `<button type="button" style="background:linear-gradient(135deg,#5C4EFA,#7B6CFF);color:#fff;padding:12px 24px;border-radius:8px;border:none;cursor:pointer;width:100%;font-size:1rem;font-weight:bold" data-wallet-connect>Connect Wallet to Mint</button>`;
    }
    if ((moduleType === 'gallery' || moduleType === 'documents') && items.length > 0) {
      const minWidth = settings.columnMinWidth || (moduleType === 'gallery' ? '200px' : '150px');
      moduleBodyHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${escapeAttr(minWidth)},1fr));gap:16px">${items.map((item, i) =>
        `<div style="position:relative;aspect-ratio:1"><img src="${escapeAttr(item.content || '')}" alt="${escapeAttr(moduleType === 'gallery' ? `Item ${i + 1}` : `Document ${i + 1}`)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" loading="lazy" /></div>`
      ).join('')}</div>`;
    }

    return `<div${idString} class="minting-module${classString}" style="${styleString}"><h3 style="margin:0 0 10px;font-size:1.5rem;color:#fff;font-weight:bold">${escapeHtml(title)}</h3><p style="margin:0 0 20px;color:#ccc;font-size:1rem;line-height:1.5">${escapeHtml(description)}</p>${statsHtml}${moduleBodyHtml}</div>`;
  }

  // Special handling for img — ensure alt attribute for accessibility
  if (tag === 'img') {
    const imgSrc = element.src || content || '';
    // Skip broken images that have no source at all
    if (!imgSrc) return '';
    const altText = element.styles?.alt || element.alt || element.label || '';
    let imgHtml = `<img${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(imgSrc)}" alt="${escapeAttr(altText)}" loading="lazy" decoding="async" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}/>`;

    // Wrap in <a> if the image has a link action configured
    const imgSettings = element.settings || {};
    if (imgSettings.linkAction && imgSettings.linkAction !== 'none' && imgSettings.linkTarget) {
      const href = escapeAttr(imgSettings.linkTarget);
      const targetAttr = imgSettings.linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      imgHtml = `<a href="${href}"${targetAttr} style="display:inline-block">${imgHtml}</a>`;
    }
    return imgHtml;
  }
  // Special handling for video element
  if (type === 'video') {
    const videoSrc = element.styles?.src || content || '';
    const posterUrl = element.styles?.poster || '';
    const videoAttrs = [];
    if (element.styles?.controls ?? true) videoAttrs.push('controls');
    if (element.styles?.autoplay) {
      videoAttrs.push('autoplay');
      videoAttrs.push('playsinline');
      // Browsers require muted for autoplay to work
      if (!videoAttrs.includes('muted')) videoAttrs.push('muted');
    }
    if (element.styles?.muted) videoAttrs.push('muted');
    if (element.styles?.loop) videoAttrs.push('loop');
    // Deduplicate attributes (muted may have been added by autoplay guard)
    const uniqueAttrs = [...new Set(videoAttrs)];
    const posterAttr = posterUrl ? ` poster="${escapeAttr(posterUrl)}"` : '';
    return `<video${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(videoSrc)}"${posterAttr} ${uniqueAttrs.join(' ')} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}></video>`;
  }
  // Special handling for YouTube embed
  if (type === 'youtubeVideo') {
    const videoId = element.settings?.videoId || element.configuration?.videoId || content || '';
    const aspectRatio = element.settings?.aspectRatio || '16:9';
    const src = videoId.startsWith('http') ? videoId : `https://www.youtube.com/embed/${escapeAttr(videoId)}`;
    return `<iframe${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(src)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}></iframe>`;
  }
  // Special handling for background video
  if (type === 'bgVideo') {
    const bgSrc = element.styles?.src || content || '';
    return `<video${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(bgSrc)}" autoplay muted loop playsinline ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}></video>`;
  }
  // Special handling for audio element
  if (type === 'audio') {
    const audioSrc = element.settings?.src || element.styles?.src || element.src || content || '';
    return `<audio${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(audioSrc)}" controls ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}></audio>`;
  }
  // Special handling for iframe element
  if (type === 'iframe') {
    const iframeSrc = element.settings?.src || element.src || content || '';
    return `<iframe${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(iframeSrc)}" frameborder="0" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}></iframe>`;
  }
  // Special handling for progress element
  if (type === 'progress') {
    const val = element.settings?.value ?? element.styles?.value ?? attributes.value ?? '';
    const max = element.settings?.max ?? element.styles?.max ?? attributes.max ?? '100';
    const valAttr = val !== '' ? ` value="${escapeAttr(String(val))}"` : '';
    return `<progress${idString} class="${classString.trim()}" style="${styleString}"${valAttr} max="${escapeAttr(String(max))}" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}></progress>`;
  }
  // Special handling for list — check ordered vs unordered
  if (type === 'list') {
    const listTag = element.configuration?.listType === 'ol' ? 'ol' : 'ul';
    const listStyle = element.configuration?.listStyleType;
    const listStyleAttr = listStyle ? `list-style-type: ${listStyle}` : '';
    const fullStyle = [styleString, listStyleAttr].filter(Boolean).join('; ');
    const startAttr = listTag === 'ol' && element.configuration?.start ? ` start="${escapeAttr(String(element.configuration.start))}"` : '';
    const reversedAttr = listTag === 'ol' && element.configuration?.reversed ? ' reversed' : '';
    return `<${listTag}${idString} class="${classString.trim()}" style="${fullStyle}"${startAttr}${reversedAttr} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</${listTag}>`;
  }
  // Special handling for icon
  if (type === 'icon') {
    const iconName = content || element.settings?.iconName || 'star';
    return `<span${idString} class="material-symbols-outlined${classString}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${escapeHtml(iconName)}</span>`;
  }
  if (tag === 'input') {
    const settings = element.settings || {};
    const inputType = attributes.type || settings.inputType || 'text';
    const placeholderAttr = (attributes.placeholder || settings.placeholder)
      ? ` placeholder="${escapeAttr(attributes.placeholder || settings.placeholder)}"`
      : '';
    const nameAttr = (attributes.name || settings.name)
      ? ` name="${escapeAttr(attributes.name || settings.name)}"`
      : '';
    const requiredAttr = (attributes.required || settings.required) ? ' required' : '';
    return `<input${idString} class="${classString.trim()}" style="${styleString}" type="${escapeAttr(inputType)}" value="${escapeAttr(content || '')}"${placeholderAttr}${nameAttr}${requiredAttr} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}/>`;
  }
  if (tag === 'textarea') {
    const settings = element.settings || {};
    const placeholderAttr = (attributes.placeholder || settings.placeholder)
      ? ` placeholder="${escapeAttr(attributes.placeholder || settings.placeholder)}"`
      : '';
    const nameAttr = (attributes.name || settings.name)
      ? ` name="${escapeAttr(attributes.name || settings.name)}"`
      : '';
    const requiredAttr = (attributes.required || settings.required) ? ' required' : '';
    return `<textarea${idString} class="${classString.trim()}" style="${styleString}"${placeholderAttr}${nameAttr}${requiredAttr} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${escapeHtml(content || '')}</textarea>`;
  }
  if (tag === 'select') {
    const settings = element.settings || {};
    const nameAttr = (attributes.name || settings.name)
      ? ` name="${escapeAttr(attributes.name || settings.name)}"`
      : '';
    const requiredAttr = (attributes.required || settings.required) ? ' required' : '';
    return `<select${idString} class="${classString.trim()}" style="${styleString}"${nameAttr}${requiredAttr} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</select>`;
  }
  if (tag === 'option') {
    return `<option${idString} class="${classString.trim()}" style="${styleString}" value="${escapeAttr(element.value || '')}" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${escapeHtml(content || '')}</option>`;
  }
  if (tag === 'br' || tag === 'hr') {
    return `<${tag}${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}/>`;
  }
  // Meter — HTML5 <meter> with value, min, max, low, high, optimum
  if (tag === 'meter') {
    const settings = element.settings || {};
    const meterValue = attributes.value ?? settings.value ?? '';
    const meterMin = attributes.min ?? settings.min ?? '0';
    const meterMax = attributes.max ?? settings.max ?? '1';
    let meterAttrs = ` value="${escapeAttr(String(meterValue))}" min="${escapeAttr(String(meterMin))}" max="${escapeAttr(String(meterMax))}"`;
    const low = attributes.low ?? settings.low;
    const high = attributes.high ?? settings.high;
    const optimum = attributes.optimum ?? settings.optimum;
    if (low != null) meterAttrs += ` low="${escapeAttr(String(low))}"`;
    if (high != null) meterAttrs += ` high="${escapeAttr(String(high))}"`;
    if (optimum != null) meterAttrs += ` optimum="${escapeAttr(String(optimum))}"`;
    const fallbackText = escapeHtml(content || `${meterValue}/${meterMax}`);
    return `<meter${idString} class="${classString.trim()}" style="${styleString}"${meterAttrs} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${fallbackText}</meter>`;
  }

  // Links — add aria-label when no visible text content, handle anchor settings
  if (tag === 'a') {
    const settings = element.settings || {};
    const interactiveAttrs = buildAttributesString(type, attributes, content, settings);
    const linkContent = escapeHtml(content || '');
    const childrenHtml = children.map(child => renderElementToHtml(child, collectedStyles, options)).join('');
    const ariaLabel = !content && children.length === 0 ? ` aria-label="${escapeAttr(element.label || 'Link')}"` : '';
    let href = element.href || settings.targetValue || '#';
    // Add protocol prefix for mailto/tel action types
    if (settings.actionType === 'mailto' && settings.targetValue && !settings.targetValue.startsWith('mailto:')) {
      href = `mailto:${settings.targetValue}`;
    } else if (settings.actionType === 'tel' && settings.targetValue && !settings.targetValue.startsWith('tel:')) {
      href = `tel:${settings.targetValue}`;
    }
    const targetAttr = settings.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a${idString} class="${classString.trim()}" style="${styleString}" href="${escapeAttr(href)}"${targetAttr}${ariaLabel} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}${interactiveAttrs}>${linkContent}${childrenHtml}</a>`;
  }
  // Type-specific handlers (must precede generic tag handlers below)
  if (type === 'backToTop') {
    return `<button${idString} type="button" style="${styleString};position:fixed;bottom:24px;right:24px;width:48px;height:48px;border-radius:50%;background:${themeColor};color:#fff;border:none;cursor:pointer;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999" data-action="scroll-top" aria-label="Back to top" ${dataAttrString} ${eventString}${scrollAnimString}>&uarr;</button>`;
  }
  if (type === 'checkbox') {
    return `<label${idString} style="${styleString};display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px" ${dataAttrString} ${eventString}${scrollAnimString}><input type="checkbox"><span>${escapeHtml(content || 'Checkbox label')}</span></label>`;
  }
  if (type === 'radio') {
    return `<label${idString} style="${styleString};display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px" ${dataAttrString} ${eventString}${scrollAnimString}><input type="radio" name="radio-group-${id}"><span>${escapeHtml(content || 'Radio label')}</span></label>`;
  }
  if (type === 'toggle') {
    const toggleId = `toggle-${id || Math.random().toString(36).slice(2, 8)}`;
    return `<label${idString} style="${styleString};display:flex;align-items:center;gap:10px;cursor:pointer;font-size:14px" ${dataAttrString} ${eventString}${scrollAnimString}><input type="checkbox" id="${escapeAttr(toggleId)}" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none"><span class="dappzy-toggle-track" style="display:inline-block;width:44px;height:24px;background:#ccc;border-radius:24px;position:relative;transition:background 0.2s;flex-shrink:0"><span class="dappzy-toggle-knob" style="display:block;width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:left 0.2s"></span></span><span>${escapeHtml(content || 'Toggle label')}</span></label>`;
  }
  if (type === 'fileUpload') {
    return `<label${idString} style="${styleString};display:block;border:2px dashed #d0d0d0;border-radius:8px;padding:32px 24px;text-align:center;cursor:pointer;background:#fafafa" ${dataAttrString} ${eventString}${scrollAnimString}><div style="font-size:32px;margin-bottom:8px;opacity:0.5">&#128193;</div><div style="font-size:14px;color:#666;margin-bottom:8px">${escapeHtml(content || 'Drop files here or click to upload')}</div><div style="font-size:12px;color:${themeColor};font-weight:500">Browse Files</div><input type="file" style="display:none"></label>`;
  }
  if (type === 'datePicker') {
    return `<div${idString} style="${styleString}" ${dataAttrString} ${eventString}${scrollAnimString}><input type="date" style="padding:10px 14px;border:1px solid #d0d0d0;border-radius:6px;font-size:14px;width:200px"></div>`;
  }
  // Buttons — add type="button", data-action handlers from settings
  if (tag === 'button') {
    const settings = element.settings || {};
    const interactiveAttrs = buildAttributesString(type, attributes, content, settings);
    return `<button${idString} class="${classString.trim()}" style="${styleString}" type="button" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}${interactiveAttrs}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</button>`;
  }
  // Footer — add role="contentinfo"
  if (tag === 'footer') {
    return `<footer${idString} class="${classString.trim()}" style="${styleString}" role="contentinfo" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</footer>`;
  }
  if (tag === 'label') {
    const settings = element.settings || {};
    const forAttr = (attributes.for || settings.forElementId || settings.htmlFor)
      ? ` for="${escapeAttr(attributes.for || settings.forElementId || settings.htmlFor)}"`
      : '';
    return `<label${idString} class="${classString.trim()}" style="${styleString}"${forAttr} ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</label>`;
  }
  // Form — add data-dappzy-form marker
  if (tag === 'form') {
    const action = element.settings?.action || '#';
    const method = element.settings?.method || 'POST';
    return `<form${idString} class="${classString.trim()}" style="${styleString}" action="${escapeAttr(action)}" method="${escapeAttr(method)}" data-dappzy-form ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</form>`;
  }

  // ── Interactive element HTML export handlers ─────────────────────

  // Tabs — renders as tabbed interface with CSS-only tab switching
  if (type === 'tabs') {
    let tabs;
    try { tabs = typeof content === 'string' ? JSON.parse(content) : content; } catch { tabs = null; }
    if (tabs && Array.isArray(tabs)) {
      const tabHeaders = tabs.map((t, i) =>
        `<button type="button" id="tab-${id}-${i}" role="tab" aria-selected="${i === 0}" aria-controls="tabpanel-${id}-${i}" data-action="switch-tab" data-tab-index="${i}" style="padding:10px 20px;border:none;cursor:pointer;background:transparent;border-bottom:2px solid ${i === 0 ? themeColor : 'transparent'};font-weight:${i === 0 ? '600' : '400'};color:${i === 0 ? themeColor : '#666'}">${escapeHtml(t.label)}</button>`
      ).join('');
      const tabBodies = tabs.map((t, i) =>
        `<div role="tabpanel" id="tabpanel-${id}-${i}" aria-labelledby="tab-${id}-${i}" data-tab-body style="display:${i === 0 ? 'block' : 'none'};padding:16px;border:1px solid #e0e0e0;border-top:none">${escapeHtml(t.body)}</div>`
      ).join('');
      return `<div${idString} style="${styleString}"><div role="tablist" style="display:flex;border-bottom:2px solid #e0e0e0">${tabHeaders}</div>${tabBodies}</div>`;
    }
  }

  // Accordion — renders as details/summary elements
  if (type === 'accordion') {
    let items;
    try { items = typeof content === 'string' ? JSON.parse(content) : content; } catch { items = null; }
    if (items && Array.isArray(items)) {
      const allowMultiple = styles.allowMultiple !== false;
      const summaryAction = allowMultiple ? '' : ' data-action="accordion-toggle"';
      const accordionHtml = items.map((item, i) =>
        `<details${i === 0 ? ' open' : ''} style="border-bottom:1px solid #e0e0e0"><summary style="padding:12px 16px;cursor:pointer;font-weight:500"${summaryAction}>${escapeHtml(item.title)}</summary><div style="padding:12px 16px;line-height:1.6">${escapeHtml(item.body)}</div></details>`
      ).join('');
      return `<div${idString} style="${styleString};border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">${accordionHtml}</div>`;
    }
  }

  // Dropdown — renders as native select for export
  if (type === 'dropdown') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    if (data && data.items) {
      const options = data.items.map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`).join('');
      return `<select${idString} style="${styleString}"><option value="" disabled selected>${escapeHtml(data.label || 'Select...')}</option>${options}</select>`;
    }
  }

  // Breadcrumb — renders as semantic nav with aria
  if (type === 'breadcrumb') {
    let items;
    try { items = typeof content === 'string' ? JSON.parse(content) : content; } catch { items = null; }
    if (items && Array.isArray(items)) {
      const crumbs = items.map((item, i) => {
        const isLast = i === items.length - 1;
        return isLast
          ? `<span style="font-weight:600">${escapeHtml(item)}</span>`
          : `<a href="#" style="color:#666;text-decoration:none">${escapeHtml(item)}</a><span style="color:#999;margin:0 8px">/</span>`;
      }).join('');
      return `<nav${idString} aria-label="Breadcrumb" style="${styleString};display:flex;align-items:center">${crumbs}</nav>`;
    }
  }

  // Carousel — renders slides with prev/next navigation buttons
  if (type === 'carousel') {
    let slides;
    try { slides = typeof content === 'string' ? JSON.parse(content) : content; } catch { slides = null; }
    if (slides && Array.isArray(slides)) {
      const slidesHtml = slides.map((s, i) =>
        `<div data-slide="${i}" aria-hidden="${i !== 0}" style="display:${i === 0 ? 'flex' : 'none'};min-height:200px;align-items:center;justify-content:center;padding:40px 60px">${escapeHtml(s.text)}</div>`
      ).join('');
      const navBtnStyle = 'position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;padding:8px 14px;font-size:18px;cursor:pointer;border-radius:4px;z-index:2';
      const prevBtn = `<button type="button" data-action="carousel-prev" style="${navBtnStyle};left:8px" aria-label="Previous slide">&#8249;</button>`;
      const nextBtn = `<button type="button" data-action="carousel-next" style="${navBtnStyle};right:8px" aria-label="Next slide">&#8250;</button>`;
      return `<div${idString} role="region" aria-label="Image carousel" aria-roledescription="carousel" data-carousel data-slide-count="${slides.length}" style="${styleString};position:relative;overflow:hidden">${prevBtn}${slidesHtml}${nextBtn}</div>`;
    }
  }

  // Modal — renders as button + hidden dialog
  if (type === 'modal') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    if (data) {
      const modalId = `modal-${id}`;
      return `<div${idString}><button type="button" style="background:${themeColor};color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer" data-action="open-modal" data-target="${modalId}">${escapeHtml(data.triggerText || 'Open')}</button><div id="${modalId}" role="dialog" aria-modal="true" aria-labelledby="modal-title-${id}" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:10000" data-action="close-modal-backdrop"><div style="background:#fff;border-radius:12px;padding:24px;min-width:400px;max-width:90vw" data-modal-content><div style="display:flex;justify-content:space-between;margin-bottom:16px"><strong id="modal-title-${id}">${escapeHtml(data.title || '')}</strong><span style="cursor:pointer" data-action="close-modal">&times;</span></div><p>${escapeHtml(data.body || '')}</p></div></div></div>`;
    }
  }

  // Tooltip — renders with CSS :hover tooltip
  if (type === 'tooltip') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    if (data) {
      const tipPosition = styles.tooltipPosition || 'top';
      const tipPositionStyles = {
        top:    'bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px',
        bottom: 'top:100%;left:50%;transform:translateX(-50%);margin-top:8px',
        left:   'right:100%;top:50%;transform:translateY(-50%);margin-right:8px',
        right:  'left:100%;top:50%;transform:translateY(-50%);margin-left:8px',
      };
      const posStyle = tipPositionStyles[tipPosition] || tipPositionStyles.top;
      return `<span${idString} style="position:relative;display:inline-block;border-bottom:1px dotted #999;cursor:default" data-action="tooltip">${escapeHtml(data.trigger || '')}<span data-tip style="position:absolute;${posStyle};background:#333;color:#fff;padding:6px 12px;border-radius:4px;font-size:12px;white-space:nowrap;opacity:0;visibility:hidden;transition:opacity 0.2s">${escapeHtml(data.tip || '')}</span></span>`;
    }
  }

  // SearchBar — renders as form with input
  if (type === 'searchBar') {
    return `<div${idString} style="${styleString};display:flex;align-items:center;border:1px solid #d0d0d0;border-radius:8px;overflow:hidden"><span style="padding:10px 12px">&#128269;</span><input type="search" aria-label="Search" placeholder="${escapeAttr(content || 'Search...')}" style="flex:1;border:none;outline:none;padding:10px 14px 10px 0;font-size:14px"><button type="button" style="background:${themeColor};color:#fff;border:none;padding:10px 16px;cursor:pointer">Search</button></div>`;
  }

  // (backToTop, checkbox, radio, toggle, fileUpload, datePicker handlers moved above generic tag handlers)

  // Countdown — renders 4 boxes with data-countdown attribute for JS hydration
  if (type === 'countdown') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const targetDate = data?.targetDate || '2025-12-31T00:00:00';
    const label = data?.label || '';
    const showLabels = data?.showLabels !== false;
    const units = ['days', 'hours', 'minutes', 'seconds'];
    const boxStyle = 'display:flex;flex-direction:column;align-items:center;min-width:60px';
    const numStyle = 'font-size:2rem;font-weight:bold;line-height:1.2';
    const unitStyle = 'font-size:0.75rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px';
    const labelHtml = label ? `<span style="${numStyle};font-size:1rem;margin-right:8px">${escapeHtml(label)}</span>` : '';
    const boxesHtml = units.map((u, i) =>
      `<div style="${boxStyle}" data-countdown-unit="${u}"><span style="${numStyle}">00</span>${showLabels ? `<span style="${unitStyle}">${u.charAt(0).toUpperCase() + u.slice(1)}</span>` : ''}</div>${i < 3 ? `<span style="${numStyle};opacity:0.5">:</span>` : ''}`
    ).join('');
    return `<div${idString} data-countdown="${escapeAttr(targetDate)}" style="${styleString};display:flex;gap:16px;justify-content:center;align-items:center;padding:20px">${labelHtml}${boxesHtml}</div>`;
  }

  // CodeInject — renders raw HTML/CSS/JS into the exported page
  if (type === 'codeInject') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const html = data?.html || '';
    const css = data?.css || '';
    const js = data?.js || '';
    const cssBlock = css ? `<style>${css}</style>` : '';
    const jsBlock = js ? `<script>${js}<\/script>` : '';
    return `<div${idString} style="${styleString}">${cssBlock}${html}${jsBlock}</div>`;
  }

  // MapEmbed — renders as Google Maps iframe
  if (type === 'mapEmbed') {
    let embedSrc = content || '';
    if (embedSrc && !embedSrc.startsWith('http') && !embedSrc.startsWith('//')) {
      embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(embedSrc)}&output=embed`;
    }
    return `<iframe${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(embedSrc)}" loading="lazy" allowfullscreen frameborder="0" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}></iframe>`;
  }

  // SocialLinks — renders a flex row of linked SVG icons
  if (type === 'socialLinks') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const links = data?.links || [{ platform: 'twitter', url: '' }, { platform: 'github', url: '' }, { platform: 'discord', url: '' }];
    const svgMap = {
      twitter: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      github: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>',
      discord: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
      telegram: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
      instagram: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
      tiktok: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
      website: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    };
    const linksHtml = links.map(link => {
      const svg = svgMap[link.platform] || svgMap.website;
      const href = escapeAttr(link.url || '#');
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:inherit;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;text-decoration:none" aria-label="${escapeAttr(link.platform)}">${svg}</a>`;
    }).join('');
    return `<div${idString} class="${classString.trim()}" style="${styleString};display:flex;gap:12px;align-items:center" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${linksHtml}</div>`;
  }

  // Slider — renders as label + range input + value display
  if (type === 'slider') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const sliderData = data || { label: 'Volume', min: 0, max: 100, step: 1, value: 50, showValue: true };
    const sliderLabel = sliderData.label || '';
    const sliderMin = sliderData.min ?? 0;
    const sliderMax = sliderData.max ?? 100;
    const sliderStep = sliderData.step ?? 1;
    const sliderValue = sliderData.value ?? 50;
    const showValue = sliderData.showValue !== false;
    const labelHtml = sliderLabel
      ? `<label style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px"><span>${escapeHtml(sliderLabel)}</span>${showValue ? `<span data-slider-value>${escapeHtml(String(sliderValue))}</span>` : ''}</label>`
      : '';
    return `<div${idString} style="${styleString}">${labelHtml}<input type="range" data-slider min="${escapeAttr(String(sliderMin))}" max="${escapeAttr(String(sliderMax))}" step="${escapeAttr(String(sliderStep))}" value="${escapeAttr(String(sliderValue))}" style="width:100%;accent-color:${escapeAttr(styles.accentColor || '#5c4efa')}"></div>`;
  }

  // Rating — renders filled/empty star spans
  if (type === 'rating') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const ratingData = data || { value: 4, maxStars: 5, interactive: false, color: '#FFD700' };
    const ratingValue = ratingData.value ?? 4;
    const maxStars = ratingData.maxStars ?? 5;
    const isInteractive = ratingData.interactive === true;
    const starColor = ratingData.color || '#FFD700';
    let starsHtml = '';
    for (let i = 0; i < maxStars; i++) {
      const isFilled = i < ratingValue;
      const actionAttr = isInteractive ? ` data-action="rate" data-star-index="${i}"` : '';
      starsHtml += `<span style="color:${isFilled ? escapeAttr(starColor) : '#ccc'};cursor:${isInteractive ? 'pointer' : 'default'}"${actionAttr}>${isFilled ? '\u2605' : '\u2606'}</span>`;
    }
    return `<div${idString} data-rating data-star-color="${escapeAttr(starColor)}" style="${styleString};display:inline-flex;gap:4px;font-size:24px">${starsHtml}</div>`;
  }

  // Lightbox — renders a grid of thumbnails + hidden fullscreen overlay
  if (type === 'lightbox') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const images = data?.images || [];
    const columns = data?.columns || 3;
    if (images.length === 0) {
      return `<div${idString} style="${styleString};padding:40px;text-align:center;color:#999;border:2px dashed #ddd;border-radius:8px" ${scrollAnimString}>No images in gallery</div>`;
    }
    const thumbsHtml = images.map((img, i) =>
      `<div style="aspect-ratio:1;overflow:hidden;border-radius:6px;cursor:pointer"><img src="${escapeAttr(img.src || '')}" alt="${escapeAttr(img.alt || `Image ${i + 1}`)}" data-action="open-lightbox" data-lightbox-index="${i}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy" /></div>`
    ).join('');
    const navBtnStyle = 'position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:10001';
    const overlayHtml = `<div data-lightbox-overlay style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);align-items:center;justify-content:center;z-index:10000"><button data-action="lightbox-close" style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:20px;z-index:10001">&times;</button><button data-action="lightbox-prev" style="${navBtnStyle};left:20px">&#8249;</button><img data-lightbox-full style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:4px" src="" alt="" /><button data-action="lightbox-next" style="${navBtnStyle};right:20px">&#8250;</button></div>`;
    return `<div${idString} data-lightbox data-lightbox-images='${escapeAttr(JSON.stringify(images.map(img => img.src || '')))}' style="${styleString}"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${Math.floor(100 / columns) > 30 ? '150px' : '100px'},1fr));gap:8px">${thumbsHtml}</div>${overlayHtml}</div>`;
  }

  // Marquee — renders horizontally scrolling text with CSS animation
  if (type === 'marquee') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const items = data?.items || ['Text 1', 'Text 2', 'Text 3'];
    const speed = data?.speed || 30;
    const direction = data?.direction || 'left';
    const pauseOnHover = data?.pauseOnHover !== false;
    const separator = ' &#8226; ';
    const itemsHtml = items.map((item, i) =>
      `<span style="white-space:nowrap">${escapeHtml(item)}</span>${i < items.length - 1 ? `<span style="margin:0 12px;opacity:0.5">${separator}</span>` : ''}`
    ).join('');
    const fullContent = `<span style="display:inline-flex;align-items:center">${itemsHtml}<span style="margin:0 12px;opacity:0.5">${separator}</span></span>`;
    // Duplicate content for seamless loop
    const animId = `marquee-${id || 'default'}`.replace(/[^a-zA-Z0-9-]/g, '');
    const isReverse = direction === 'right';
    const animCss = `@keyframes ${animId}{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`;
    const hoverRule = pauseOnHover ? `#${escapeAttr(id || 'marquee')} .marquee-inner:hover{animation-play-state:paused}` : '';
    const estimatedWidth = items.join('').length * 10;
    const duration = Math.max(estimatedWidth / speed, 5);
    return `<div${idString} style="${styleString};overflow:hidden"><style>${animCss}${hoverRule}</style><div class="marquee-inner" style="display:inline-flex;white-space:nowrap;animation:${animId} ${duration}s linear infinite${isReverse ? ';animation-direction:reverse' : ''}">${fullContent}${fullContent}</div></div>`;
  }

  // Alert — renders a colored banner with optional dismiss button
  if (type === 'alert') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const alertData = data || { message: 'This is an alert message', variant: 'info', dismissible: true };
    const alertMessage = alertData.message || '';
    const alertVariant = alertData.variant || 'info';
    const alertDismissible = alertData.dismissible !== false;
    const variantConfig = {
      info:    { bg: '#eff6ff', border: '#3b82f6', icon: '\u2139\uFE0F', color: '#1e40af' },
      success: { bg: '#f0fdf4', border: '#22c55e', icon: '\u2705',       color: '#166534' },
      warning: { bg: '#fffbeb', border: '#f59e0b', icon: '\u26A0\uFE0F', color: '#92400e' },
      error:   { bg: '#fef2f2', border: '#ef4444', icon: '\u274C',       color: '#991b1b' },
    };
    const cfg = variantConfig[alertVariant] || variantConfig.info;
    const dismissBtn = alertDismissible
      ? `<button type="button" data-action="dismiss-alert" style="background:none;border:none;cursor:pointer;font-size:18px;color:${cfg.color};opacity:0.6;padding:0 4px;line-height:1;flex-shrink:0" aria-label="Dismiss">&times;</button>`
      : '';
    return `<div${idString} data-alert style="${styleString};padding:12px 16px;border-radius:8px;border-left:4px solid ${cfg.border};display:flex;align-items:center;gap:12px;background-color:${cfg.bg};color:${cfg.color}"><span style="font-size:18px;flex-shrink:0">${cfg.icon}</span><span style="flex:1;line-height:1.5">${escapeHtml(alertMessage)}</span>${dismissBtn}</div>`;
  }

  // Pagination — renders page navigation with prev/next and page numbers
  if (type === 'pagination') {
    let data;
    try { data = typeof content === 'string' ? JSON.parse(content) : content; } catch { data = null; }
    const pagData = data || { totalPages: 5, currentPage: 1, showPrevNext: true };
    const totalPages = pagData.totalPages || 5;
    const currentPage = pagData.currentPage || 1;
    const showPrevNext = pagData.showPrevNext !== false;
    const btnStyle = 'border:1px solid #d0d0d0;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:14px;background:#fff;color:#333;min-width:36px;text-align:center;line-height:1.4';
    const activeBtnStyle = `border:1px solid ${themeColor};border-radius:6px;padding:6px 12px;cursor:pointer;font-size:14px;background:${themeColor};color:#fff;min-width:36px;text-align:center;line-height:1.4;font-weight:600`;
    const disabledBtnStyle = `${btnStyle};opacity:0.4;cursor:not-allowed`;
    let pagesHtml = '';
    if (showPrevNext) {
      pagesHtml += `<button type="button" data-action="paginate" data-direction="prev" style="${currentPage <= 1 ? disabledBtnStyle : btnStyle}" aria-label="Previous page"${currentPage <= 1 ? ' disabled' : ''}>&lsaquo;</button>`;
    }
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<button type="button" style="${i === currentPage ? activeBtnStyle : btnStyle}" aria-label="Page ${i}"${i === currentPage ? ' aria-current="page"' : ''}>${i}</button>`;
    }
    if (showPrevNext) {
      pagesHtml += `<button type="button" data-action="paginate" data-direction="next" style="${currentPage >= totalPages ? disabledBtnStyle : btnStyle}" aria-label="Next page"${currentPage >= totalPages ? ' disabled' : ''}>&rsaquo;</button>`;
    }
    return `<nav${idString} aria-label="Pagination" style="${styleString};display:flex;gap:4px;align-items:center">${pagesHtml}</nav>`;
  }

  // Span — add interactive handlers from settings (page navigation, file download)
  if (type === 'span') {
    const settings = element.settings || {};
    const interactiveAttrs = buildAttributesString(type, attributes, content, settings);
    return `<span${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}${interactiveAttrs}>${renderTextContent(content)}</span>`;
  }

  // Text-bearing element types that support rich text formatting
  const richTextTypes = new Set(['paragraph', 'title', 'heading', 'description', 'blockquote', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  const textOutput = richTextTypes.has(type) ? renderTextContent(content) : escapeHtml(content || '');

  // Default: generic tag with content and children
  return `<${tag}${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}${scrollAnimString}>${textOutput}${children.map(child => renderElementToHtml(child, collectedStyles, options)).join('')}</${tag}>`;
}