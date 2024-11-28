import React, { createContext, useState, useEffect } from 'react';

export const EditableContext = createContext();

let elementCounter = 0;

const generateUniqueId = (type) => {
  elementCounter += 1;
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ''); // Clean timestamp
  return `${type}-${timestamp}-${elementCounter}`;
};
const structureConfigurations = {
  customTemplate: {
    children: [
      { type: 'image', content: 'Logo' },
      { type: 'span', content: '3S.Template' },
      { type: 'span', content: 'Link 1' },
      { type: 'span', content: 'Link 2' },
      { type: 'span', content: 'Link 3' },
      { type: 'span', content: 'Link 4' },
      { type: 'button', content: 'Button Text' },
      { type: 'button', content: 'Button Text' },
    ],
  },
  twoColumn: {
    children: [
      { type: 'image', content: 'Logo' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'About' },
      { type: 'span', content: 'Contact' },
    ],
  },
  threeColumn: {
    children: [
      { type: 'image', content: 'Logo' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'Services' },
      { type: 'span', content: 'Contact' },
      { type: 'button', content: 'Call to Action' },
    ],
  },
  // Add other structures here...
};


export const EditableProvider = ({ children }) => {
  const ELEMENTS_VERSION = '1.0';
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState(() => {
    const savedVersion = localStorage.getItem('elementsVersion');
    const savedElements = JSON.parse(localStorage.getItem('editableElements') || '[]');

    if (Array.isArray(savedElements) && savedVersion === ELEMENTS_VERSION) {
      return savedElements;
    } else {
      return [];
    }
  });


  const addNewElement = (type, level = 1, index = null, parentId = null, structure = null) => {
    const newId = generateUniqueId(type);
    let newElement = {
      id: newId,
      type,
      styles: {},
      level,
      children: [], // Always initialize as an array
      parentId: parentId || null,
      content: type === 'paragraph' ? 'New Paragraph' : null, // Default content for isolated elements
      structure: structure || null,
    };
  
    const structureConfigurations = {
      customTemplate: {
        children: [
          { type: 'image', content: 'Logo' },
          { type: 'span', content: '3S.Template' },
          { type: 'span', content: 'Link 1' },
          { type: 'span', content: 'Link 2' },
          { type: 'span', content: 'Link 3' },
          { type: 'span', content: 'Link 4' },
          { type: 'button', content: 'Button Text' },
          { type: 'button', content: 'Button Text' },
        ],
      },
      twoColumn: {
        children: [
          { type: 'image', content: 'Logo' },
          { type: 'span', content: 'Home' },
          { type: 'span', content: 'About' },
          { type: 'span', content: 'Contact' },
        ],
      },
      threeColumn: {
        children: [
          { type: 'image', id: `${newId}-logo`, content: 'Logo' },
          { type: 'span', id: `${newId}-link-home`, content: 'Home' },
          { type: 'span', id: `${newId}-link-services`, content: 'Services' },
          { type: 'span', id: `${newId}-link-contact`, content: 'Contact' },
          { type: 'button', id: `${newId}-cta`, content: 'Call to Action' },
        ],
      },
      heroOne: {
        children: [
          { type: 'image', id: `${newId}-background`, content: 'background-image-url', styles: { width: '100%', height: 'auto', position: 'absolute', top: 0, left: 0 } },
          { type: 'span', id: `${newId}-hero-title`, content: 'Welcome to Our Website', styles: { fontSize: '2.5rem', fontWeight: 'bold' } },
          { type: 'span', id: `${newId}-hero-subtitle`, content: 'Building a better future together.', styles: { margin: '16px 0', fontSize: '1.25rem' } },
          { type: 'button', id: `${newId}-hero-button`, content: 'Get Started', styles: { marginTop: '24px', padding: '10px 20px', backgroundColor: '#61dafb', color: '#000', border: 'none', borderRadius: '4px' } },
        ],
      },
      heroTwo: {
        children: [
          { type: 'span', id: `${newId}-hero-title`, content: 'Discover Your Potential' },
          { type: 'span', id: `${newId}-hero-subtitle`, content: 'Join us today and start making an impact.' },
          { type: 'button', id: `${newId}-hero-button`, content: 'Join Now' },
        ],
      },
      heroThree: {
        children: [
          { type: 'span', id: `${newId}-caption`, content: 'CAPTION' },
          { type: 'span', id: `${newId}-hero-title`, content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
          { type: 'span', id: `${newId}-hero-description`, content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit.' },
          { type: 'button', id: `${newId}-primary-button`, content: 'Primary Action' },
          { type: 'button', id: `${newId}-secondary-button`, content: 'Secondary Action' },
          { type: 'image', id: `${newId}-hero-image`, content: '' },
        ],
      },
      ctaOne: {
        children: [
          { type: 'span', id: `${newId}-cta-title`, content: 'Get Started Today!' },
          { type: 'span', id: `${newId}-cta-description`, content: 'Sign up now and take the first step towards a better future.' },
          { type: 'button', id: `${newId}-cta-button`, content: 'Join Now' },
        ],
      },
      ctaTwo: {
        children: [
          { type: 'span', id: `${newId}-cta-title`, content: 'Take Act  ion Now!' },
          { type: 'button', id: `${newId}-primary-button`, content: 'Primary Action' },
          { type: 'button', id: `${newId}-secondary-button`, content: 'Secondary Action' },
        ],
      },
      simple: {
        children: [
          { type: 'span', id: `${newId}-simple-message`, content: 'Simple Footer - © 2024 My Company' },
          { type: 'button', id: `${newId}-simple-cta`, content: 'Subscribe' },
        ],
      },
      detailed: {
        children: [
          { type: 'span', id: `${newId}-company-info`, content: 'Company Name, Address Line 1, Address Line 2' },
          { type: 'button', id: `${newId}-contact`, content: 'Contact Us' },
          { type: 'span', id: `${newId}-privacy`, content: 'Privacy Policy' },
          { type: 'span', id: `${newId}-terms`, content: 'Terms of Service' },
          { type: 'span', id: `${newId}-support`, content: 'Support' },
          { type: 'span', id: `${newId}-social-media`, content: 'Follow us: [Social Links]' },
        ],
      },
      template: {
        children: [
          { type: 'span', id: `${newId}-section-1`, content: 'Eleven' },
          { type: 'span', id: `${newId}-section-2`, content: 'Twelve' },
          { type: 'span', id: `${newId}-section-3`, content: 'Thirteen' },
          { type: 'image', id: `${newId}-logo`, content: 'default-logo.png', styles: { width: '40px', height: '40px', borderRadius: '50%' } },
          { type: 'span', id: `${newId}-template-title`, content: '3S Template', styles: { fontSize: '1.5rem', fontWeight: 'bold' } },
          { type: 'image', id: `${newId}-social-youtube`, content: 'social-youtube-icon.png', styles: { width: '24px', height: '24px', social: true } },
          { type: 'image', id: `${newId}-social-facebook`, content: 'social-facebook-icon.png', styles: { width: '24px', height: '24px', social: true } },
          { type: 'image', id: `${newId}-social-twitter`, content: 'social-twitter-icon.png', styles: { width: '24px', height: '24px', social: true } },
          { type: 'image', id: `${newId}-social-instagram`, content: 'social-instagram-icon.png', styles: { width: '24px', height: '24px', social: true } },
          { type: 'image', id: `${newId}-social-linkedin`, content: 'social-linkedin-icon.png', styles: { width: '24px', height: '24px', social: true } },
          { type: 'span', id: `${newId}-template-rights`, content: 'CompanyName @ 202X. All rights reserved.', styles: { fontSize: '0.875rem' } },
        ],
      },
      mintingSection: {
        children: [
          { type: 'image', id: `${newId}-logo`, content: 'logo-image-url' },
          { type: 'span', id: `${newId}-title`, content: 'Mint {Collection Name}' },
          { type: 'span', id: `${newId}-description`, content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' },
          { type: 'span', id: `${newId}-timer`, content: '17d 5h 38m 34s' }, // Timer field
          { type: 'span', id: `${newId}-remaining`, content: '1000/1000' }, // Remaining NFTs field
          { type: 'span', id: `${newId}-price`, content: '1.5 SOL' }, // Price field
          { type: 'span', id: `${newId}-quantity`, content: '2' }, // Quantity field
          { type: 'image', id: `${newId}-rare-item-1`, content: 'rare-item-1-image-url' },
          { type: 'image', id: `${newId}-rare-item-2`, content: 'rare-item-2-image-url' },
          { type: 'image', id: `${newId}-rare-item-3`, content: 'rare-item-3-image-url' },
          { type: 'image', id: `${newId}-rare-item-4`, content: 'rare-item-4-image-url' },
          { type: 'image', id: `${newId}-document-item-1`, content: 'document-item-1-image-url' },
          { type: 'image', id: `${newId}-document-item-2`, content: 'document-item-2-image-url' },
          { type: 'image', id: `${newId}-document-item-3`, content: 'document-item-3-image-url' },
        ],
      },
      
    };
  

    if (structure && structureConfigurations[structure]) {
      const children = structureConfigurations[structure].children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        parentId: newId,
      }));
  
      newElement.children = children.map((child) => child.id);
      setElements((prev) => [...prev, newElement, ...children]);
    } else {
      setElements((prev) => [...prev, newElement]);
    }
  
    return newId;
  };
    const updateStyles = (id, newStyles) => {
    const updateElementStyles = (elementsArray) => {
      return elementsArray.map((el) => {
        if (!el) return el;

        if (el.id === id) {
          return {
            ...el,
            styles: {
              ...el.styles,
              ...newStyles,
            },
          };
        }

        if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: el.children.map((childId) => {
              const child = elementsArray.find((childEl) => childEl && childEl.id === childId);
              if (child) {
                return child.id;
              }
              return childId;
            }),
          };
        }

        return el;
      });
    };

    setElements((prevElements) => {
      const updatedElements = updateElementStyles(prevElements);
      localStorage.setItem('editableElements', JSON.stringify(updatedElements));
      return updatedElements;
    });
  };
  
  const updateContent = (id, content) => {
    if (!id) {
      console.warn('Attempted to update content with an undefined ID');
      return;
    }
  
    setElements((prevElements) => {
      const updatedElements = prevElements.map((el) =>
        el.id === id ? { ...el, content } : el
      );
  
      // Handle nested children updates for '-rare-item'
      if (id.includes('-rare-item')) {
        const parent = updatedElements.find((el) =>
          Array.isArray(el.children) && el.children.includes(id)
        );
  
        if (parent) {
          parent.children = Array.isArray(parent.children)
            ? [...new Set([...parent.children, id])] // Avoid duplicate IDs
            : [id];
        }
      }
  
      return updatedElements;
    });
  };
  
  
  const findElementById = (id, elementsArray) => {
    if (!id || !Array.isArray(elementsArray)) return null;
  
    const element = elementsArray.find((el) => el?.id === id);
    if (element) return element;
  
    for (const el of elementsArray) {
      if (el?.children?.length) {
        const found = findElementById(
          id,
          el.children.map((childId) =>
            elementsArray.find((child) => child?.id === childId)
          )
        );
        if (found) return found;
      }
    }
    return null;
  };
  
  
  


  const buildHierarchy = (elements) => {
    const elementMap = elements.reduce((map, element) => {
      if (element && element.type) {
        map[element.id] = { ...element, children: [] };
      }
      return map;
    }, {});
  
    const rootElements = [];
    elements.forEach((element) => {
      if (element.parentId && elementMap[element.parentId]) {
        elementMap[element.parentId].children.push(elementMap[element.id]);
      } else if (!element.parentId && elementMap[element.id]) {
        rootElements.push(elementMap[element.id]);
      }
    });
  
    return rootElements;
  };
  
  
  
  const updateElementSettings = (id, newSettings) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          console.log(`Updating settings for ${id}:`, newSettings);
          return { ...el, ...newSettings };
        }
        return el;
      })
    );
  };
  

  const saveSectionToLocalStorage = (sectionId) => {
    const section = findElementById(sectionId, elements);
    if (!section) {
      console.warn(`Section with id ${sectionId} not found.`);
      return;
    }

    const sectionHierarchy = buildHierarchy(elements, sectionId);
    localStorage.setItem(`section-${sectionId}`, JSON.stringify(sectionHierarchy));
  };

  const loadSectionFromLocalStorage = (sectionId) => {
    const savedSection = localStorage.getItem(`section-${sectionId}`);
    if (!savedSection) {
      console.warn(`No saved section found with id ${sectionId}.`);
      return null;
    }

    return JSON.parse(savedSection);
  };


  useEffect(() => {
    // Save only valid elements to localStorage
    const validElements = elements.filter((el) => el.type && el.id);
    localStorage.setItem('editableElements', JSON.stringify(validElements));
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);
  
  const removeElementById = (id) => {
    setElements((prevElements) => {
      const updatedElements = prevElements.filter((el) => el.id !== id);
  
      // Update children of parent elements
      updatedElements.forEach((el) => {
        if (el.children) {
          el.children = el.children.filter((childId) => childId !== id);
        }
      });
  
      localStorage.setItem('editableElements', JSON.stringify(updatedElements));
      return updatedElements;
    });
  
    console.info(`Element with id ${id} has been removed.`);
  };
  
  const changeSectionStructure = (sectionId, newStructure) => {
    setElements((prevElements) => {
      const section = prevElements.find((el) => el.id === sectionId);
      if (!section) {
        console.warn(`Section with id ${sectionId} not found.`);
        return prevElements;
      }
  
      const structureConfig = structureConfigurations[newStructure];
      if (!structureConfig) {
        console.warn(`Structure configuration ${newStructure} not found.`);
        return prevElements;
      }
  
      // Generate new children based on the new structure
      const newChildren = structureConfig.children.map((child) => ({
        ...child,
        id: generateUniqueId(child.type),
        parentId: sectionId,
      }));
  
      const updatedSection = {
        ...section,
        structure: newStructure,
        children: newChildren.map((child) => child.id),
      };
  
      const updatedElements = prevElements.map((el) =>
        el.id === sectionId ? updatedSection : el
      );
  
      // Add new children to elements array
      return [...updatedElements, ...newChildren];
    });
  };
  
  return (
    <EditableContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        elements,
        addNewElement,
        setElements,
        findElementById,
        buildHierarchy,
        removeElementById,
        updateContent,
        updateStyles,
        saveSectionToLocalStorage,
        loadSectionFromLocalStorage,
        updateElementSettings,
        changeSectionStructure,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
