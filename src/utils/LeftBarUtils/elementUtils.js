// src/utils/LeftBarUtils/elementUtils.js

let elementCounter = 0;

export const generateUniqueId = (type) => {
  elementCounter += 1;
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `${type}-${timestamp}-${randomPart}-${elementCounter}`;
};

export const buildHierarchy = (elements) => {
  const elementMap = elements.reduce((map, element) => {
    map[element.id] = { ...element, children: [] };
    return map;
  }, {});

  elements.forEach((element) => {
    if (element.parentId && elementMap[element.parentId]) {
      elementMap[element.parentId].children.push(elementMap[element.id]);
    }
  });

  const hierarchy = Object.values(elementMap)
    .filter((el) => !el.parentId) // Root only
    .filter((el) => el.children.length > 0 || el.content || el.structure); // Exclude empty

  console.log('Generated hierarchy:', hierarchy);
  return hierarchy;
};

export const findElementById = (id, elements) => {
  return elements.find((el) => el.id === id) || null;
};

/**
 * Removes exactly one element by ID (but not its children).
 * Leaves the child's objects in the array if they exist.
 */
export const removeElementById = (id, elements) => {
  const updatedElements = elements.filter((el) => el.id !== id);

  // Remove references from parent's children arrays, if they exist
  updatedElements.forEach((el) => {
    if (el.children) {
      el.children = el.children.filter((childId) => childId !== id);
    }
  });

  console.info(`Element with id ${id} has been removed.`);
  return updatedElements;
};

/**
 * removeElementRecursively:
 *  1) Finds all elements whose parentId = this `id` => remove them recursively.
 *  2) Then removes the element with `id` itself.
 * Returns a new array with no references to the parent or its descendants.
 */
export const removeElementRecursively = (id, elements) => {
  // 1) find all direct children by scanning for parentId = id
  const childIds = elements
    .filter((el) => el.parentId === id)
    .map((el) => el.id);

  // 2) recursively remove each child (which also removes its own children)
  let updated = elements;
  childIds.forEach((childId) => {
    updated = removeElementRecursively(childId, updated);
  });

  // 3) remove the element itself
  updated = removeElementById(id, updated);

  return updated;
};
