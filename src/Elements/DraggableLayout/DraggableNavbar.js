import React, { useContext, useMemo, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import TwoColumnNavbar from '../Sections/Navbars/TwoColumnNavbar';
import ThreeColumnNavbar from '../Sections/Navbars/ThreeColumnNavbar';
import CustomTemplateNavbar from '../Sections/Navbars/CustomTemplateNavbar';
import DeFiNavbar from '../Sections/Navbars/DeFiNavbar';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { NAVBAR, BUTTON, CONNECT_WALLET_BUTTON, ANCHOR, LINK_BLOCK, LINK_BLOCK_CAMEL } from '../../constants/elementTypes';
import { hasDuplicateElement, DROP_REJECTION_REASONS } from '../../utils/dndUtils';
import { useToast } from '../../context/ToastContext';

/**
 * DraggableNavbar — canvas wrapper for navbar sections.
 * Section creation is handled by LayoutCard → ContentList → buildSectionTree.
 * This component only handles on-canvas rendering and child-drop logic.
 */
const DraggableNavbar = ({
  id,
  configuration,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { generateUniqueId, addNewElement, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const { showToast } = useToast();
  const dropHandledRef = useRef(false);

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
      },
      anchor: {
        color: '#5C4EFA',
        textDecoration: 'none',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 16px',
      },
      linkblock: {
        color: '#5C4EFA',
        textDecoration: 'none',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 16px',
        display: 'inline-block',
      },
      linkBlock: {
        color: '#5C4EFA',
        textDecoration: 'none',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 16px',
        display: 'inline-block',
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

    // addNewElement already updates the parent's children array, so no
    // second setElements call is needed (it would duplicate the child ref).

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
