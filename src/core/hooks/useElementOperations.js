import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { structureConfigurations } from '../../features/elements/configs/elementConfigs';

export const useElementOperations = (elements, setElements, updateStyles) => {
  const findElementById = useCallback((id) => {
    return elements.find(el => el.id === id);
  }, [elements]);

  const addNewElement = useCallback((type, parentId = null, configuration = null) => {
    const newId = uuidv4();
    const structureConfig = configuration ? structureConfigurations[configuration] : null;
    
    const newElement = {
      id: newId,
      type,
      configuration,
      styles: structureConfig?.styles || {},
      children: [],
      content: '',
      parentId
    };

    setElements(prev => [...prev, newElement]);

    if (parentId) {
      setElements(prev => prev.map(el => 
        el.id === parentId 
          ? { ...el, children: [...el.children, newId] }
          : el
      ));
    }

    if (structureConfig?.children) {
      const childElements = structureConfig.children.map(childConfig => ({
        id: uuidv4(),
        type: childConfig.type,
        styles: childConfig.styles || {},
        children: [],
        content: childConfig.content || '',
        parentId: newId
      }));

      setElements(prev => [...prev, ...childElements]);
      setElements(prev => prev.map(el => 
        el.id === newId 
          ? { ...el, children: childElements.map(child => child.id) }
          : el
      ));
    }

    return newId;
  }, [setElements]);

  const deleteElement = useCallback((id) => {
    const element = findElementById(id);
    if (!element) return;

    // Delete all children recursively
    const deleteChildren = (elementId) => {
      const el = findElementById(elementId);
      if (el?.children) {
        el.children.forEach(childId => deleteChildren(childId));
      }
      setElements(prev => prev.filter(e => e.id !== elementId));
    };

    deleteChildren(id);

    // Remove from parent's children array
    if (element.parentId) {
      setElements(prev => prev.map(el => 
        el.id === element.parentId 
          ? { ...el, children: el.children.filter(childId => childId !== id) }
          : el
      ));
    }
  }, [findElementById, setElements]);

  const moveElement = useCallback((id, newParentId) => {
    const element = findElementById(id);
    if (!element) return;

    // Remove from old parent
    if (element.parentId) {
      setElements(prev => prev.map(el => 
        el.id === element.parentId 
          ? { ...el, children: el.children.filter(childId => childId !== id) }
          : el
      ));
    }

    // Add to new parent
    setElements(prev => prev.map(el => 
      el.id === newParentId 
        ? { ...el, children: [...el.children, id] }
        : el
    ));

    // Update element's parentId
    setElements(prev => prev.map(el => 
      el.id === id 
        ? { ...el, parentId: newParentId }
        : el
    ));
  }, [findElementById, setElements]);

  return {
    findElementById,
    addNewElement,
    deleteElement,
    moveElement
  };
}; 