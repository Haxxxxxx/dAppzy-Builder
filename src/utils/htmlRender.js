export function buildAttributesString(type, attributes, src, settings = {}) {
  let attributesString = '';

  if (type === 'input' && attributes.type) {
    attributesString += ` type="${attributes.type}"`;
  }

  if (type === 'anchor') {
    const href = attributes.href || settings.targetValue;
    if (href) {
      attributesString += ` href="${href}"`;
    }
    if (settings.openInNewTab) {
      attributesString += ` target="_blank"`;
    }
  }

  // Include both "img" and "image" types.
  if (['img', 'image', 'video', 'audio', 'iframe', 'source'].includes(type) && src) {
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

  if (type === 'button' && settings.targetValue && settings.actionType !== 'Dropdown') {
    if (settings.openInNewTab) {
      attributesString += ` onclick="window.open('${settings.targetValue}', '_blank')"`;
    } else {
      attributesString += ` onclick="window.location.href='${settings.targetValue}'"`;
    }
  }

  if (type === 'span' && settings.targetValue) {
    if (settings.actionType === 'pageSection') {
      attributesString += ` onclick="(function(){ var targetEl = document.getElementById('${settings.targetValue}'); if(targetEl){ targetEl.scrollIntoView({ behavior: 'smooth' }); } else { console.warn('Target element \\'${settings.targetValue}\\' not found'); } })()" style="cursor: pointer;"`;
    } else if (settings.actionType === 'file') {
      if (settings.downloadFile) {
        attributesString += ` onclick="(function(){ var a = document.createElement('a'); a.href='${settings.targetValue}'; a.download = ''; a.click(); })()" style="cursor: pointer;"`;
      } else {
        attributesString += ` onclick="window.open('${settings.targetValue}', '_blank')" style="cursor: pointer;"`;
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
      .map(([k, v]) => `${camelToKebab(k)}="${v}"`)
      .join(' ');
  }

  // Helper to generate data attributes string
  function getDataAttributesString(attrs) {
    return Object.entries(attrs)
      .map(([k, v]) => `data-${camelToKebab(k)}="${v}"`)
      .join(' ');
  }

  // Helper to generate event handlers string
  function getEventsString(events) {
    return Object.entries(events)
      .map(([k, v]) => `on${k}="${v}"`)
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
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
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
    // fallback
    default: 'div',
  };

  // Determine tag
  const tag = tagMap[type] || tagMap.default;
  const styleString = getAllStyles(element);
  const classString = className ? ` ${className}` : '';
  const idString = id ? ` id="${id}"` : '';
  const attrString = getAttributesString(attributes);
  const dataAttrString = getDataAttributesString(dataAttributes);
  const eventString = getEventsString(events);

  // Special handling for img, input, textarea, select, option, br, hr (self-closing)
  if (tag === 'img') {
    return `<img${idString} class="${classString.trim()}" style="${styleString}" src="${element.src || content}" alt="${element.alt || ''}" ${attrString} ${dataAttrString} ${eventString}/>`;
  }
  if (tag === 'input') {
    return `<input${idString} class="${classString.trim()}" style="${styleString}" value="${content || ''}" ${attrString} ${dataAttrString} ${eventString}/>`;
  }
  if (tag === 'textarea') {
    return `<textarea${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${content || ''}</textarea>`;
  }
  if (tag === 'select') {
    return `<select${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</select>`;
  }
  if (tag === 'option') {
    return `<option${idString} class="${classString.trim()}" style="${styleString}" value="${element.value || ''}" ${attrString} ${dataAttrString} ${eventString}>${content || ''}</option>`;
  }
  if (tag === 'br' || tag === 'hr') {
    return `<${tag}${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}/>`;
  }

  // For a, button, label, etc. with content and children
  if (tag === 'a') {
    return `<a${idString} class="${classString.trim()}" style="${styleString}" href="${element.href || '#'}" ${attrString} ${dataAttrString} ${eventString}>${content || ''}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</a>`;
  }
  if (tag === 'button') {
    return `<button${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${content || ''}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</button>`;
  }
  if (tag === 'label') {
    return `<label${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${content || ''}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</label>`;
  }

  // Default: generic tag with content and children
  return `<${tag}${idString} class="${classString.trim()}" style="${styleString}" ${attrString} ${dataAttrString} ${eventString}>${content || ''}${children.map(child => renderElementToHtml(child, collectedStyles)).join('')}</${tag}>`;
}

function cleanStyles(styles = {}) {
  const { outline, boxShadow, ...productionStyles } = styles;
  return productionStyles;
}