/**
 * Shared drag-and-drop utility functions.
 * Centralises logic that would otherwise be duplicated across useReorderDrop,
 * UnifiedDropZone, useElementDrop, and all DraggableLayout components.
 */

// ---------------------------------------------------------------------------
// Circular reference guard
// ---------------------------------------------------------------------------

/**
 * Returns true if `potentialParentId` is a descendant (or equal to) `elementId`
 * in the element tree.  Used to block dropping a container into its own child.
 *
 * @param {string} elementId          - The element being dragged.
 * @param {string} potentialParentId  - The proposed drop-target container.
 * @param {Array}  elements           - Full flat element array.
 * @returns {boolean}
 */
export function isDescendantOf(elementId, potentialParentId, elements) {
  let currentId = potentialParentId;
  while (currentId) {
    if (currentId === elementId) return true;
    const current = elements.find(el => el.id === currentId);
    currentId = current?.parentId || null;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Bounds / position helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the cursor position relative to a drop-target element.
 * Returns null when the ref or monitor offset is unavailable.
 *
 * @param {React.RefObject} elementRef - Ref pointing at the drop-target DOM node.
 * @param {import('react-dnd').DropTargetMonitor} monitor
 * @returns {{ relativeX: number, relativeY: number, isWithinBounds: boolean, targetRect: DOMRect } | null}
 */
export function getDropPosition(elementRef, monitor) {
  const targetRect = elementRef.current?.getBoundingClientRect();
  if (!targetRect) return null;
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return null;
  const relativeX = clientOffset.x - targetRect.left;
  const relativeY = clientOffset.y - targetRect.top;
  const isWithinBounds =
    relativeX >= 0 &&
    relativeX <= targetRect.width &&
    relativeY >= 0 &&
    relativeY <= targetRect.height;
  return { relativeX, relativeY, isWithinBounds, targetRect };
}

// ---------------------------------------------------------------------------
// Duplicate-detection helper
// ---------------------------------------------------------------------------

/**
 * Returns true if an element with the same type AND content already exists
 * in `existingElements`.
 *
 * @param {Array}  existingElements - Array of resolved child elements.
 * @param {{ type: string, content: string }} item - The item being dropped.
 * @returns {boolean}
 */
export function hasDuplicateElement(existingElements, item) {
  return (
    existingElements?.some(
      el => el.type === item.type && el.content === item.content
    ) || false
  );
}

// ---------------------------------------------------------------------------
// Section construction helper
// ---------------------------------------------------------------------------

/**
 * Builds a structured section data object from a section configuration entry.
 * Used by both the popup-based `handleSectionSelect` and the react-dnd `drop`
 * handler in UnifiedDropZone so both paths produce identical output.
 *
 * @param {string} sectionId                  - Key into structureConfigurations.
 * @param {Object} structureConfigurations    - The full config map.
 * @param {Function} resolveConfigType        - resolveConfigType from elementRegistry.
 * @param {Object}  [extraContext]            - Optional extra context (navbarStyles, heroStyles, item config, etc.)
 * @returns {Object|null} sectionData object or null if config not found.
 */
export function buildSectionData(sectionId, structureConfigurations, resolveConfigType, extraContext = {}) {
  const sectionConfig = structureConfigurations[sectionId];
  if (!sectionConfig) return null;

  const resolvedType = resolveConfigType(sectionId);
  const { navbarStyles, heroStyles, NAVBAR, HERO, BUTTON } = extraContext;

  const children = (sectionConfig.children || []).map(child => {
    // Navbar-specific child handling
    if (navbarStyles && resolvedType === NAVBAR) {
      if (BUTTON && child.type === BUTTON) {
        return {
          type: child.type,
          content: child.content || '',
          styles: {
            ...navbarStyles.buttonContainer,
            ...child.styles,
            position: 'relative',
            boxSizing: 'border-box',
          },
          settings: child.content?.settings || {},
          configuration: { ...child.content?.settings, enabled: true },
        };
      }
      return {
        type: child.type,
        content: child.content || '',
        styles: {
          ...(navbarStyles[child.type] || {}),
          position: 'relative',
          boxSizing: 'border-box',
        },
        settings: child.content?.settings || {},
        configuration: { ...child.content?.settings, enabled: true },
      };
    }

    // Hero-specific child handling
    if (heroStyles && resolvedType === HERO) {
      return {
        type: child.type,
        content: child.content || '',
        styles: {
          ...(heroStyles[child.type] || {}),
          position: 'relative',
          boxSizing: 'border-box',
        },
        settings: child.settings || {},
        children: child.children || [],
      };
    }

    // Default child
    return {
      type: child.type,
      content: child.content || '',
      styles: {
        ...child.styles,
        position: 'relative',
        boxSizing: 'border-box',
      },
      settings: child.content?.settings || {},
      configuration: { ...child.content?.settings, enabled: true },
    };
  });

  return {
    type: resolvedType,
    configuration: sectionId,
    structure: sectionId,
    styles: {
      ...(sectionConfig.styles || {}),
      position: 'relative',
      display: 'flex',
      boxSizing: 'border-box',
      flexDirection: sectionConfig.direction || 'column',
    },
    children,
    settings: sectionConfig.settings || {},
    label: sectionConfig.label || sectionId,
  };
}

// ---------------------------------------------------------------------------
// User-facing rejection reasons
// ---------------------------------------------------------------------------

export const DROP_REJECTION_REASONS = {
  SELF_DROP: 'Cannot drop a section into itself',
  DUPLICATE: 'This element already exists in this section',
  INVALID_TYPE: 'This element type cannot be added here',
  CIRCULAR: 'Cannot drop an element into its own child',
};
