import React, { createContext, useState, useEffect } from 'react';

export const EditableContext = createContext();

let elementCounter = 0;

const generateUniqueId = (type) => {
  elementCounter += 1;
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ''); // Clean timestamp
  return `${type}-${timestamp}-${elementCounter}`;
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
      children: [],
      parentId: parentId || null,
      structure,
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
    };
  
    if (structure && structureConfigurations[structure]) {
      const children = structureConfigurations[structure].children.map((child) => ({
        id: child.id || generateUniqueId(child.type),
        type: child.type,
        content: child.content,
        parentId: newId,
      }));
  
      newElement.children = children.map((child) => child.id);
  
      setElements((prev) => [...prev, newElement, ...children]);
    } else if (!structure) {
      console.warn('Invalid structure specified, skipping element creation.');
      return null;
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

  const updateContent = (id, newContent) => {
    const updateElementContent = (elementsArray) => {
      return elementsArray.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            content: newContent,
          };
        }
        return el;
      });
    };

    setElements((prevElements) => {
      const updatedElements = updateElementContent(prevElements);
      localStorage.setItem('editableElements', JSON.stringify(updatedElements));
      return updatedElements;
    });
  };

  const findElementById = (id, elementsArray) => {
    const element = elementsArray.find((el) => el.id === id);
    if (element) return element;
  
    for (const element of elementsArray) {
      if (element.children && element.children.length > 0) {
        const childElements = elementsArray.filter((el) => element.children.includes(el.id));
        const found = findElementById(id, childElements);
        if (found) return found;
      }
    }
    return null;
  };
  


  const buildHierarchy = (elements) => {
    const elementMap = elements.reduce((map, element) => {
      if (element && element.type) {
        map[element.id] = { ...element, children: [] }; // Initialize with an empty children array
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
    const validElements = elements.filter((el) => el && el.type && (el.configuration || el.children?.length > 0));
    localStorage.setItem('editableElements', JSON.stringify(validElements));
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);
  


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
        updateContent,
        updateStyles,
        saveSectionToLocalStorage,
        loadSectionFromLocalStorage,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
