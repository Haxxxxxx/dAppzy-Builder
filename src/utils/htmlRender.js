import { flattenStyles } from './htmlRenderUtils/cssUtils';
import { getFileExtension } from './htmlRenderUtils/fileUtils';
import {typeToTagMap} from './htmlRenderUtils/typeMapping'

export function buildAttributesString(type, attributes, src) {
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

export function renderElementToHtml(element, collectedStyles) {
  const { id, type, styles, content, src, attributes = {}, children = [] } = element;
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

  const childrenHtml = children
    .map((childElement) => renderElementToHtml(childElement, collectedStyles))
    .join('');

  if (selfClosingTags.includes(tag)) {
    return `<${tag} ${attributesString} />`;
  } else {
    return `<${tag} ${attributesString}>${content || ''}${childrenHtml}</${tag}>`;
  }
}
