let elementCounter = 0;

export const generateUniqueId = (type) => {
  elementCounter += 1;
  const timestamp = Date.now(); // Use milliseconds since epoch for precision
  const randomPart = Math.random().toString(36).substr(2, 5); // Generate a random string
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
    .filter((el) => !el.parentId) // Root elements only
    .filter((el) => el.children.length > 0 || el.content || el.structure); // Exclude empty elements

  console.log('Generated hierarchy:', hierarchy);
  return hierarchy;
};

  

export const findElementById = (id, elements) => {
  return elements.find((el) => el.id === id) || null;
};

  
export const removeElementById = (id, elements) => {
  const updatedElements = elements.filter((el) => el.id !== id);

  // Update children of parent elements
  updatedElements.forEach((el) => {
    if (el.children) {
      el.children = el.children.filter((childId) => childId !== id);
    }
  });

  console.info(`Element with id ${id} has been removed.`);
  return updatedElements;
};
