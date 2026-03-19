/**
 * Centralized section tree builder.
 *
 * Given a drop item (with type, configuration, children, styles, label),
 * produces a flat array of element objects ready to be merged into state.
 *
 * This replaces all per-section-type creation logic that was duplicated
 * across ContentList.handleDrop (hero, CTA, ContentSection branches).
 *
 * Every section — navbar, hero, CTA, content section, footer — now flows
 * through the same recursive builder.
 */

const uid = () => Math.random().toString(36).substring(2, 11);

/**
 * Build a flat element array from a section drop item.
 *
 * @param {Object} item - Drop item with { type, configuration, children, styles, label, structure, settings }
 * @returns {{ elements: Object[], rootId: string }}
 */
export function buildSectionTree(item) {
  const timestamp = Date.now();
  const prefix = item.type.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const rootId = `${prefix}-${timestamp}-${uid().substring(0, 4)}`;

  const sectionConfig = item.styles || {};
  const elements = [];

  // Root section element
  elements.push({
    id: rootId,
    type: item.type,
    configuration: item.configuration || null,
    structure: item.structure || item.configuration || null,
    styles: sectionConfig.section || sectionConfig,
    isConfigured: true,
    children: [],
    parentId: null,
    settings: item.settings || {},
    label: item.label || item.configuration || item.type,
  });

  // Recursive child processor
  const processChildren = (children, parentId) => {
    if (!children || children.length === 0) return [];
    const childIds = [];

    children.forEach((child) => {
      // idSuffix produces deterministic IDs that match what section components expect
      // e.g. { idSuffix: 'left' } → "hero-xxx-left" instead of "hero-xxx-div-yyy"
      const childId = child.idSuffix
        ? `${rootId}-${child.idSuffix}`
        : `${rootId}-${child.type || 'div'}-${uid()}`;
      childIds.push(childId);

      // Resolve style keys: if child.styles.key exists, look up from section config
      let resolvedStyles = child.styles || {};
      if (resolvedStyles.key && sectionConfig[resolvedStyles.key]) {
        resolvedStyles = { ...sectionConfig[resolvedStyles.key] };
      }

      const hasChildren = child.children && child.children.length > 0;
      const nestedChildIds = hasChildren ? processChildren(child.children, childId) : [];

      elements.push({
        id: childId,
        type: child.type || 'div',
        content: child.content || '',
        styles: resolvedStyles,
        parentId,
        isConfigured: true,
        configuration: child.configuration || null,
        structure: child.structure || null,
        settings: child.settings || {},
        children: hasChildren ? nestedChildIds : [],
        ...(child.moduleType ? { moduleType: child.moduleType } : {}),
        // Forward media/link fields used by specific element types
        ...(child.src ? { src: child.src } : {}),
        ...(child.href ? { href: child.href } : {}),
        ...(child.alt ? { alt: child.alt } : {}),
        // Image elements also store content URL as .src
        ...((child.type === 'image' && child.content && !child.src) ? { src: child.content } : {}),
      });
    });

    return childIds;
  };

  const topChildIds = processChildren(item.children, rootId);
  elements[0].children = topChildIds;

  return { elements, rootId };
}
