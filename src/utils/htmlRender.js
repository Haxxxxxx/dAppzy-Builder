import { escapeHtml, escapeAttr, escapeJsString, sanitizeStyleValue } from './export/escapeUtils';

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
    const safeTarget = escapeJsString(settings.targetValue);
    if (settings.openInNewTab) {
      attributesString += ` onclick="window.open('${safeTarget}', '_blank')"`;
    } else {
      attributesString += ` onclick="window.location.href='${safeTarget}'"`;
    }
  }

  if (type === 'span' && settings.targetValue) {
    const safeTarget = escapeJsString(settings.targetValue);
    if (settings.actionType === 'pageSection') {
      attributesString += ` onclick="(function(){ var targetEl = document.getElementById('${safeTarget}'); if(targetEl){ targetEl.scrollIntoView({ behavior: 'smooth' }); } })()" style="cursor: pointer;"`;
    } else if (settings.actionType === 'file') {
      if (settings.downloadFile) {
        attributesString += ` onclick="(function(){ var a = document.createElement('a'); a.href='${safeTarget}'; a.download = ''; a.click(); })()" style="cursor: pointer;"`;
      } else {
        attributesString += ` onclick="window.open('${safeTarget}', '_blank')" style="cursor: pointer;"`;
      }
    }
  }

  return attributesString;
}

/**
 * Renders an element to HTML with all its properties and styles
 */
export function renderElementToHtml(element, collectedStyles = []) {
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

  // Helper to convert camelCase to kebab-case
  function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

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

  // Helper to generate event handlers string
  function getEventsString(evts) {
    return Object.entries(evts)
      .map(([k, v]) => `on${k}="${escapeAttr(String(v))}"`)
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
    // Remove editor-specific styles
    delete merged.outline;
    delete merged.boxShadow;
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
    // Builder-specific types
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
    grid: 'div',
    hero: 'section',
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

  // Web3 element special handling
  if (type === 'connectWalletButton' || type === 'connectwalletbutton') {
    return `<button${idString} class="${classString.trim()}" style="${styleString}" data-wallet-connect type="button" ${attrString} ${dataAttrString}>${escapeHtml(content || 'Connect Wallet')}</button>`;
  }
  if (type === 'mintingSection') {
    return `<section${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString}><p style="text-align:center;opacity:0.6;">Minting section — configure in Dappzy Builder</p>${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</section>`;
  }
  if (type === 'defiSection') {
    return `<section${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString}><p style="text-align:center;opacity:0.6;">DeFi section — configure in Dappzy Builder</p>${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</section>`;
  }

  // Special handling for img — ensure alt attribute for accessibility
  if (tag === 'img') {
    const altText = element.styles?.alt || element.alt || element.label || '';
    return `<img${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(element.src || content || '')}" alt="${escapeAttr(altText)}" loading="lazy" decoding="async" ${attrString} ${dataAttrString} ${eventString}/>`;
  }
  // Special handling for video element
  if (type === 'video') {
    const videoSrc = element.styles?.src || content || '';
    const videoAttrs = [];
    if (element.styles?.controls ?? true) videoAttrs.push('controls');
    if (element.styles?.autoplay) videoAttrs.push('autoplay');
    if (element.styles?.muted) videoAttrs.push('muted');
    if (element.styles?.loop) videoAttrs.push('loop');
    return `<video${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(videoSrc)}" ${videoAttrs.join(' ')} ${attrString} ${dataAttrString} ${eventString}></video>`;
  }
  // Special handling for YouTube embed
  if (type === 'youtubeVideo') {
    const videoId = element.settings?.videoId || element.configuration?.videoId || content || '';
    const aspectRatio = element.settings?.aspectRatio || '16:9';
    const src = videoId.startsWith('http') ? videoId : `https://www.youtube.com/embed/${escapeAttr(videoId)}`;
    return `<iframe${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(src)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ${attrString} ${dataAttrString} ${eventString}></iframe>`;
  }
  // Special handling for background video
  if (type === 'bgVideo') {
    const bgSrc = element.styles?.src || content || '';
    return `<video${idString} class="${classString.trim()}" style="${styleString}" src="${escapeAttr(bgSrc)}" autoplay muted loop playsinline ${attrString} ${dataAttrString} ${eventString}></video>`;
  }
  // Special handling for list — check ordered vs unordered
  if (type === 'list') {
    const listTag = element.configuration?.listType === 'ol' ? 'ol' : 'ul';
    const listStyle = element.configuration?.listStyleType;
    const listStyleAttr = listStyle ? `list-style-type: ${listStyle}` : '';
    const fullStyle = [styleString, listStyleAttr].filter(Boolean).join('; ');
    const startAttr = listTag === 'ol' && element.configuration?.start ? ` start="${escapeAttr(String(element.configuration.start))}"` : '';
    const reversedAttr = listTag === 'ol' && element.configuration?.reversed ? ' reversed' : '';
    return `<${listTag}${idString} class="${classString.trim()}" style="${fullStyle}"${startAttr}${reversedAttr} ${attrString} ${dataAttrString} ${eventString}>${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</${listTag}>`;
  }
  // Special handling for icon
  if (type === 'icon') {
    const iconName = content || element.settings?.iconName || 'star';
    return `<span${idString} class="material-symbols-outlined${classString}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(iconName)}</span>`;
  }
  if (tag === 'input') {
    return `<input${idString} class="${classString.trim()}" style="${styleString}" value="${escapeAttr(content || '')}" ${attrString} ${dataAttrString} ${eventString}/>`;
  }
  if (tag === 'textarea') {
    return `<textarea${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(content || '')}</textarea>`;
  }
  if (tag === 'select') {
    return `<select${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</select>`;
  }
  if (tag === 'option') {
    return `<option${idString} class="${classString.trim()}" style="${styleString}" value="${escapeAttr(element.value || '')}" ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(content || '')}</option>`;
  }
  if (tag === 'br' || tag === 'hr') {
    return `<${tag}${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}/>`;
  }

  // Links — add aria-label when no visible text content
  if (tag === 'a') {
    const linkContent = escapeHtml(content || '');
    const childrenHtml = children.map(child => renderElementToHtml(child, collectedStyles)).join('');
    const ariaLabel = !content && children.length === 0 ? ` aria-label="${escapeAttr(element.label || 'Link')}"` : '';
    return `<a${idString} class="${classString.trim()}" style="${styleString}" href="${escapeAttr(element.href || '#')}"${ariaLabel} ${attrString} ${dataAttrString} ${eventString}>${linkContent}${childrenHtml}</a>`;
  }
  // Buttons — add type="button" for accessibility
  if (tag === 'button') {
    return `<button${idString} class="${classString.trim()}" style="${styleString}" type="button" ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</button>`;
  }
  // Footer — add role="contentinfo"
  if (tag === 'footer') {
    return `<footer${idString} class="${classString.trim()}" style="${styleString}" role="contentinfo" ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</footer>`;
  }
  if (tag === 'label') {
    return `<label${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</label>`;
  }
  // Form — add data-dappzy-form marker
  if (tag === 'form') {
    const action = element.settings?.action || '#';
    const method = element.settings?.method || 'POST';
    return `<form${idString} class="${classString.trim()}" style="${styleString}" action="${escapeAttr(action)}" method="${escapeAttr(method)}" data-dappzy-form ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</form>`;
  }

  // Default: generic tag with content and children
  return `<${tag}${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${escapeHtml(content || '')}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</${tag}>`;
}