import React, { useContext, useState, useMemo, useEffect, useRef, forwardRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import { useWalletContext } from '../../context/WalletContext';
import DeFiSection from '../Sections/Web3Related/DeFiSection';
import { Web3Configs } from '../../configs/Web3/Web3Configs';
import { defaultDeFiStyles } from '../Sections/Web3Related/defaultDeFiStyles';
import '../../components/css/LeftBar.css';
import { merge } from 'lodash';

// Default modules with specific functionality
const defaultModules = [
  {
    id: 'defiModule1',
    type: 'defiModule',
    moduleType: 'aggregator',
    content: {
      title: 'DeFi Aggregator',
      description: 'Access multiple DeFi protocols through a single interface',
      stats: [
        { label: 'Connected Wallet', value: 'Not Connected' },
        { label: 'Total Pools', value: 'Loading...' },
        { label: 'Total Value Locked', value: '$0' },
        { label: 'Best APY', value: 'Not Connected' }
      ],
      settings: {
        showStats: true,
        showButton: true,
        customColor: '#2A2A3C'
      },
      functionality: {
        type: 'aggregator',
        actions: []
      },
      enabled: true
    }
  },
  {
    id: 'defiModule2',
    type: 'defiModule',
    moduleType: 'simulation',
    content: {
      title: 'Investment Simulator',
      description: 'Simulate different investment strategies',
      stats: [
        { label: 'Investment Range', value: '$10,000' },
        { label: 'Supported Assets', value: '20+' },
        { label: 'Historical Data', value: '5 Years' }
      ],
      settings: {
        showStats: true,
        showButton: true,
        customColor: '#2A2A3C'
      },
      functionality: {
        type: 'simulation',
        actions: []
      },
      enabled: true
    }
  },
  {
    id: 'defiModule3',
    type: 'defiModule',
    moduleType: 'bridge',
    content: {
      title: 'Cross-Chain Bridge',
      description: 'Transfer assets between different blockchains',
      stats: [
        { label: 'Supported Chains', value: 'Select Chain' },
        { label: 'Transfer Time', value: 'Select Chain' },
        { label: 'Security Score', value: '0.1%' }
      ],
      settings: {
        showStats: true,
        showButton: true,
        customColor: '#2A2A3C'
      },
      functionality: {
        type: 'bridge',
        actions: []
      },
      enabled: true
    }
  }
];

/**
 * DraggableDeFi component for rendering and managing DeFi sections.
 * Supports drag and drop functionality, modal interactions, and different DeFi configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the DeFi section
 * @param {string} props.configuration - DeFi configuration type
 * @param {boolean} props.isEditing - Whether the DeFi section is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handlePanelToggle - Function to handle panel toggle
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the DeFi section preview
 * @param {string} props.label - Label for the DeFi section
 * @param {string} props.description - Description of the DeFi section
 * @param {Object} props.structure - Structure of the DeFi section
 */
const DraggableDeFi = forwardRef(({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc,
  label,
}, ref) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement, generateUniqueId, updateStyles } = useContext(EditableContext);
  const { walletAddress, isConnected: contextConnected, isLoading, walletId } = useWalletContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  const defaultInjectedRef = useRef(false);

  // Generate a unique ID if none is provided
  const sectionId = id || `defi-section-${Date.now()}`;

  // Helper functions
  const generateElementIds = (type, count) => {
    return Array(count).fill(null).map(() => generateUniqueId(type));
  };

  const createContainerStructure = (parentId, type) => {
    const contentContainerId = `${parentId}-content`;
    return {
      id: contentContainerId,
      type: 'div',
      styles: defaultDeFiStyles[type].content,
      children: [],
      parentId: parentId
    };
  };

  const createElementConfig = (type, config) => {
    return {
      type,
      configuration: config.type,
      structure: config.structure,
      styles: defaultDeFiStyles[type],
      settings: config.settings || {},
      children: []
    };
  };

  const applyStyles = (element, type) => {
    return {
      ...defaultDeFiStyles[type],
      ...element.styles,
      position: 'relative',
      boxSizing: 'border-box'
    };
  };

  // Set up drag-and-drop functionality with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id: sectionId, 
      type: 'defiSection', 
      configuration,
      structure: Web3Configs[configuration]
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const defiConfig = Web3Configs[item.configuration];
        if (defiConfig) {
          const dropResult = monitor.getDropResult();
          const targetSectionId = dropResult?.sectionId;
          
          if (targetSectionId) {
            const sectionElement = findElementById(targetSectionId, elements);
            const existingDeFi = sectionElement?.children
              ?.map(childId => findElementById(childId, elements))
              ?.find(el => el?.type === 'defiSection' && el?.configuration === item.configuration);

            if (!existingDeFi) {
              // Generate unique IDs for the section and its modules
              const newSectionId = generateUniqueId('defiSection');
              const contentContainerId = `${newSectionId}-content`;
              
              // Create the content container first
              const contentContainer = {
                id: contentContainerId,
                type: 'div',
                styles: defaultDeFiStyles.defiContent,
                children: [],
                parentId: newSectionId,
              };

              // Create the new DeFi section with standardized configuration
              const newDeFiSection = {
                id: newSectionId,
                type: 'defiSection',
                structure: defiConfig,
                styles: defaultDeFiStyles.defiSection,
                settings: {
                  simulateConnected: false,
                  requireSignature: true,
                  simulateSigned: false
                },
                children: [contentContainerId]
              };

              // Create default modules with standardized structure
              const modules = defaultModules.map(module => {
                const moduleId = generateUniqueId('defiModule');
                return {
                  id: moduleId,
                  type: 'defiModule',
                  moduleType: module.moduleType,
                  content: module.content,
                  styles: merge(defaultDeFiStyles.defiModule, module.styles || {}),
                  configuration: {
                    enabled: true,
                    ...module.content.functionality
                  },
                  settings: {
                    ...module.content.settings,
                    enabled: true
                  },
                  parentId: contentContainerId
                };
              });

              // Update content container with module IDs
              contentContainer.children = modules.map(module => module.id);

              // Add all elements in a single update
              setElements(prev => {
                const newElements = [...prev];
                newElements.push(newDeFiSection, contentContainer, ...modules);
                return newElements;
              });

              setSelectedElement({ id: newSectionId, type: 'defiSection', configuration: item.configuration });
            }
          }
        }
      }
    },
  }), [configuration, isEditing, elements, sectionId]);

  // Handle drop events within the DeFi section
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    // Get the current DeFi section element
    const currentSection = findElementById(sectionId, elements);
    if (!currentSection) {
      console.warn('DeFi section not found');
      return;
    }

    // Generate a unique ID for the new element
    const newId = generateUniqueId(item.type || 'element');

    // Create the new element with proper configuration
    const elementId = addNewElement(
      item.type,
      1,
      index,
      sectionId,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: item.styles || {},
        configuration: item.configuration || {},
        settings: item.settings || {},
        children: item.children || []
      }
    );

    // Update the parent element's children array
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === sectionId) {
          const updatedChildren = [...(el.children || [])];
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
      parentId: sectionId,
      index: index
    });
  };

  // Find the current DeFi section and its children
  const defiElement = findElementById(sectionId, elements);
  const contentContainer = defiElement?.children?.[0] ? findElementById(defiElement.children[0], elements) : null;
  const resolvedChildren = contentContainer?.children
    ?.map((childId) => findElementById(childId, elements))
    .filter(Boolean) || [];

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

  // Handle element selection
  const handleSelect = (id, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setSelectedElement({ id, type: 'defiModule', styles: findElementById(id, elements)?.styles });
  };

  // Handle preview display with description
  if (showDescription) {
    return (
      <div 
        className="bento-extract-display" 
        ref={drag} 
        style={{ 
          opacity: isDragging ? 0.5 : 1,
          cursor: 'pointer'
        }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
        aria-label={`${label} preview`}
      >
        <img
          src={imgSrc}
          alt={label}
          style={{
            width: '100%',
            height: 'auto',
            marginBottom: '8px',
            borderRadius: '4px',
          }}
          loading="lazy"
        />
        <strong className='element-name'>{label}</strong>
      </div>
    );
  }

  // Render the draggable DeFi component
  return (
    <div
      ref={drag}
      style={{
        cursor: 'pointer',
        border: isDragging ? '1px dashed #000' : 'none',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={toggleModal}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && toggleModal()}
      aria-label={`${label} component`}
    >
      <strong>{label}</strong>
      <DeFiSection
        id={sectionId}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
        ref={ref}
      />
    </div>
  );
});

export default DraggableDeFi; 