import React, { useContext, useMemo, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import TwoColumnNavbar from '../Sections/Navbars/TwoColumnNavbar';
import ThreeColumnNavbar from '../Sections/Navbars/ThreeColumnNavbar';
import CustomTemplateNavbar from '../Sections/Navbars/CustomTemplateNavbar';
import DeFiNavbar from '../Sections/Navbars/DeFiNavbar';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { NAVBAR, BUTTON, CONNECT_WALLET_BUTTON } from '../../constants/elementTypes';
import { hasDuplicateElement, DROP_REJECTION_REASONS } from '../../utils/dndUtils';
import { useToast } from '../../context/ToastContext';

const DraggableNavbar = ({
  id,
  configuration,
  isEditing,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { generateUniqueId, addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const { showToast } = useToast();
  const dropHandledRef = useRef(false);

  // DraggableNavbar.js
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: NAVBAR,
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
              ?.find(el => el?.type === NAVBAR && el?.configuration === item.configuration);

            if (!existingNavbar) {
              // Only create a new navbar if one doesn't exist in the section
              addNewElement(NAVBAR, 1, null, targetSectionId, {
                ...navbarConfig,
                configuration: item.configuration,
                structure: item.configuration
              });
            }
          }
        }
        setSelectedElement({ id: item.id, type: NAVBAR, configuration: item.configuration });
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
    if (item.type === NAVBAR) {
      showToast(DROP_REJECTION_REASONS.SELF_DROP, 'info');
      return;
    }

    // Get the current navbar element
    const currentNavbar = findElementById(id, elements);
    if (!currentNavbar) {
      return;
    }

    // Check for duplicate elements
    const existingElements = currentNavbar.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    // For buttons and connect wallet buttons, check for duplicates
    if (item.type === BUTTON || item.type === CONNECT_WALLET_BUTTON) {
      if (hasDuplicateElement(existingElements, item)) {
        showToast(DROP_REJECTION_REASONS.DUPLICATE, 'info');
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

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: NAVBAR, styles: navbar?.styles });
  };

  // Component map for configuration → React component
  const NAVBAR_COMPONENTS = {
    customTemplateNavbar: CustomTemplateNavbar,
    twoColumn: TwoColumnNavbar,
    threeColumn: ThreeColumnNavbar,
    defiNavbar: DeFiNavbar,
  };

  const NavbarComponent = NAVBAR_COMPONENTS[configuration];
  if (!NavbarComponent) return null;

  return (
    <NavbarComponent
      uniqueId={id}
      contentListWidth={contentListWidth}
      children={resolvedChildren}
      onDropItem={onDropItem}
      handlePanelToggle={handlePanelToggle}
      handleOpenMediaPanel={handleOpenMediaPanel}
      handleSelect={handleSelect}
    />
  );
};

export default DraggableNavbar;
