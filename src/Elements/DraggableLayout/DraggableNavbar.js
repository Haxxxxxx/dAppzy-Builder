import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import TwoColumnNavbar from '../Sections/Navbars/TwoColumnNavbar';
import ThreeColumnNavbar from '../Sections/Navbars/ThreeColumnNavbar';
import CustomTemplateNavbar from '../Sections/Navbars/CustomTemplateNavbar';
import DeFiNavbar from '../Sections/Navbars/DeFiNavbar';
import { structureConfigurations } from '../../configs/structureConfigurations.js';

const DraggableNavbar = ({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc, // Image source for the navbar preview
  label, // Label for the navbar
}) => {
  const {generateUniqueId, addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const modalRef = useRef(null);
  const dropHandledRef = useRef(false);

  // DraggableNavbar.js
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'navbar', 
      configuration,
      structure: configuration
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const navbarConfig = structureConfigurations[item.configuration];
        if (navbarConfig) {
          // Check if a navbar with this configuration already exists in the current section
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingNavbar = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'navbar' && el?.configuration === item.configuration);

            if (!existingNavbar) {
              // Only create a new navbar if one doesn't exist in the section
              addNewElement('navbar', 1, null, targetSectionId, {
                ...navbarConfig,
                configuration: item.configuration,
                structure: item.configuration
              });
            }
          }
        }
        setSelectedElement({ id: item.id, type: 'navbar', configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements]);

  // Find the current navbar and its children
  const navbar = findElementById(id, elements);
  const configChildren = structureConfigurations[configuration]?.children || [];
  const resolvedChildren = useMemo(() => {
    if (!navbar?.children) return configChildren;
    
    return navbar.children
      .map((childId) => findElementById(childId, elements))
      .filter(Boolean)
      .map(child => ({
        ...child,
        id: child.id || generateUniqueId(child.type) // Ensure each child has an ID
      }));
  }, [navbar?.children, elements, configChildren]);

  // Handle dropping items inside this navbar
  const onDropItem = (item, index, dropInfo) => {
    if (!item || dropHandledRef.current) return;

    // Check if we're trying to add a navbar inside another navbar
    if (item.type === 'navbar') {
      console.warn('Cannot add a navbar inside another navbar');
      return;
    }

    // Get the current navbar element
    const currentNavbar = findElementById(id, elements);
    if (!currentNavbar) {
      console.warn('Navbar not found');
      return;
    }

    // Check for duplicate elements
    const existingElements = currentNavbar.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    // For buttons and connect wallet buttons, check for duplicates
    if (item.type === 'button' || item.type === 'connectWalletButton') {
      const hasDuplicate = existingElements?.some(el => 
        el.type === item.type && el.content === item.content
      );
      if (hasDuplicate) {
        console.warn(`A ${item.type} with this content already exists in the navbar`);
        return;
      }
    }

    // Set drop handled flag
    dropHandledRef.current = true;

    // Generate a unique ID for the new element
    const newId = generateUniqueId(item.type || 'element');

    // Create base styles based on element type
    const baseStyles = {
      button: {
        backgroundColor: '#5C4EFA',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#4A3ED9'
        }
      },
      connectWalletButton: {
        backgroundColor: '#5C4EFA',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#4A3ED9'
        }
      },
      image: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        objectFit: 'cover',
      },
      span: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginLeft: '12px',
      }
    };

    // Create the new element with proper configuration
    const elementId = addNewElement(
      item.type,
      1,
      index,
      id,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: {
          ...baseStyles[item.type],
          ...item.styles
        },
        children: item.children || []
      }
    );

    // Update the parent element's children array
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === id) {
          // Create a new array for the children, maintaining existing ones
          const updatedChildren = [...(el.children || [])];
          
          // Insert the new element ID at the specified index
          updatedChildren.splice(index, 0, elementId);

          return {
            ...el,
            children: updatedChildren
          };
        }
        return el;
      });

      return updatedElements;
    });

    // Select the new element
    setSelectedElement({ 
      id: elementId, 
      type: item.type,
      parentId: id,
      index: index
    });

    // Reset drop handled flag after a short delay
    setTimeout(() => {
      dropHandledRef.current = false;
    }, 100);
  };

  // Toggle the modal state
  const toggleModal = () => setModalOpen((prev) => !prev);

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);


  //const titles = {
  //  twoColumn: 'Two Columns',
  //  threeColumn: 'Three Columns',
  //  customTemplate: '3S Navbar',
  //  defiNavbar: 'DeFi Navbar',
  //};

  // Inside DraggableNavbar.js
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: 'navbar', styles: navbar?.styles });
  };

  // Handle preview display with description
  if (showDescription) {
    return (
      <div className="bento-extract-display" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <img
          src={imgSrc}
          alt={label}
          style={{
            width: '100%',
            height: 'auto',
            marginBottom: '8px',
            borderRadius: '4px',
          }}
        />
        <strong className='element-name'>{label}</strong>
        {/* <p>{descriptions[configuration]}</p> */}
      </div>
    );
  }

  // Assign the correct navbar component
  let NavbarComponent;
  if (configuration === 'customTemplateNavbar') {
    NavbarComponent = (
      <CustomTemplateNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'twoColumn') {
    NavbarComponent = (
      <TwoColumnNavbar
        uniqueId={id}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'threeColumn') {
    NavbarComponent = (
      <ThreeColumnNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'defiNavbar') {
    NavbarComponent = (
      <DeFiNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  }

  // Render draggable navbar with preview
  return (
    <div
      ref={drag}
      style={{
        cursor: 'pointer',
        border: isDragging ? '1px dashed #000' : '',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => {
        toggleModal();    // show/hide your modal
      }}
    >
      <strong>{label}</strong>
      {NavbarComponent}
    </div>
  );
};

export default DraggableNavbar;
