export function renderNavbarElement(element, collectedStyles) {
  const { id, children = [], styles, configuration = 'default' } = element;
  const configStyles = stylesMap[configuration] || {};

  collectedStyles.push({
    className: `element-${id}`,
    styles: { ...configStyles.nav, ...styles },
  });

  const childrenHtml = children.map((child) =>
    renderElementToHtml(child, collectedStyles)
  ).join('');

  return `<nav class="element-${id}" style="${flattenStyles(styles)}">
    ${childrenHtml}
  </nav>`;
}
