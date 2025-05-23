// helpers/containerHelpers.js
import merge from 'lodash/merge';

/**
 * Registers a container element if it doesn't exist.
 * @param {string} uniqueId - The unique identifier for the parent element.
 * @param {string} containerKey - A key to distinguish containers (e.g. 'text', 'image', 'buttons', etc.).
 * @param {object} defaultStyle - The default styles for the container.
 * @param {Array} elements - The current elements array.
 * @param {Function} setElements - Function to update the elements.
 * @param {Function} findElementById - Function to find an element by ID.
 */
export const registerContainer = (
  sectionId,
  containerKey,
  defaultStyle,
  elements,
  setElements,
  findElementById
) => {
  const containerId = `${sectionId}-${containerKey}`;

  // Check if container already exists
  if (findElementById(containerId, elements)) {
    return; // Container already exists, skip
  }

  // Define required containers based on section type
  const sectionType = elements.find(el => el.id === sectionId)?.type;
  let requiredContainers = [];

  if (sectionType === 'cta') {
    requiredContainers = ['text', 'buttons'];
    if (elements.find(el => el.id === sectionId)?.configuration === 'ctaOne') {
      requiredContainers.push('image');
    }
  } else if (sectionType === 'hero') {
    requiredContainers = ['content'];
    if (elements.find(el => el.id === sectionId)?.configuration !== 'heroTwo') {
      requiredContainers.push('image');
    }
  } else if (sectionType === 'section') {
    requiredContainers = ['content', 'buttons'];
    if (elements.find(el => el.id === sectionId)?.configuration?.includes('image')) {
      requiredContainers.push('image');
    }
  }

  // Only create container if it's required for this section type
  if (!requiredContainers.includes(containerKey)) {
    return;
  }

  setElements((prev) => [
    ...prev,
    {
      id: containerId,
      type: 'div',
      styles: defaultStyle,
      children: [],
      parentId: sectionId,
    },
  ]);
};


/**
 * Injects default content into designated containers.
 * This function will only inject content if the target container exists and has no children.
 * @param {Array} defaultContent - Array of default content items.
 * @param {object} mapping - Object mapping element types to container keys.
 * @param {string} uniqueId - Unique identifier of the parent element.
 * @param {Array} elements - The current elements array.
 * @param {Function} addNewElement - Function to add a new element.
 * @param {Function} setElements - Function to update the elements.
 * @param {Function} findElementById - Function to find an element by ID.
 */
export const injectDefaultContent = (
  defaultContent,
  mapping,
  uniqueId,
  elements,
  addNewElement,
  setElements,
  findElementById
) => {
  // Iterate over each default child.
  defaultContent.forEach((child) => {
    const containerKey = mapping[child.type] || mapping.default;
    const containerId = `${uniqueId}-${containerKey}`;
    const container = findElementById(containerId, elements);
    // Only inject if the container exists and has no children.
    if (container && (!container.children || container.children.length === 0)) {
      const newId = addNewElement(child.type, 1, null, containerId);
      // Batch update: first update the new element's content.
      setElements((prev) =>
        prev.map((el) =>
          el.id === newId ? { ...el, content: child.content } : el
        )
      );
      // Then update the container's children list.
      setElements((prev) =>
        prev.map((el) =>
          el.id === containerId ? { ...el, children: [...el.children, newId] } : el
        )
      );
    }
  });
};

/**
 * Merges container styles with custom styles.
 * @param {object} defaultStyles - The default styles for the container.
 * @param {object} customStyles - Custom styles from state.
 * @returns {object} - The merged styles.
 */
export const mergeStyles = (defaultStyles, customStyles = {}) => {
  return merge({}, defaultStyles, customStyles);
};
