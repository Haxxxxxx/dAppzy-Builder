import React, { useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import { useWalletContext } from '../../context/WalletContext';
import DeFiSection from '../Sections/Web3Related/DeFiSection';
import { Web3Configs } from '../../configs/Web3/Web3Configs';
import '../../components/css/LeftBar.css';

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
 */
const DraggableDeFi = ({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc,
  label,
  description
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const { walletAddress, isConnected: contextConnected, isLoading, walletId } = useWalletContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Setup drag behavior with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'defiSection', 
      configuration,
      structure: configuration 
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        // Check if a DeFi section with this configuration already exists in the current section
        const dropResult = monitor.getDropResult();
        const targetSectionId = dropResult?.sectionId;
        
        if (targetSectionId) {
          const sectionElement = findElementById(targetSectionId, elements);
          const existingDeFi = sectionElement?.children
            ?.map(childId => findElementById(childId, elements))
            ?.find(el => el?.type === 'defiSection' && el?.configuration === item.configuration);

          if (!existingDeFi) {
            // Create a unique ID for the new DeFi section
            const newId = `defiSection-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            // Get the current number of elements to determine the index
            const currentElements = elements.filter(el => !el.parentId);
            const index = currentElements.length;
            
            // Add the main DeFi section element at the end
            addNewElement('defiSection', 1, index, targetSectionId, {
              ...Web3Configs.defiSection,
              configuration: item.configuration,
              structure: item.configuration,
              settings: {
                requireSignature: true,
                simulateConnected: false,
                simulateSigned: false,
                isSigned: false
              }
            }, newId);

            // Initialize default module content with wallet integration
            const defaultModuleContent = {
              aggregator: {
                title: 'DeFi Aggregator',
                description: 'Access multiple DeFi protocols through a single interface',
                stats: [
                  { label: 'Connected Wallet', value: contextConnected ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : 'Not Connected' },
                  { label: 'Total Pools', value: 'Loading...' },
                  { label: 'Total Value Locked', value: '$0' },
                  { label: 'Best APY', value: contextConnected ? 'Loading...' : 'Not Connected' }
                ],
                settings: {
                  showStats: true,
                  showButton: true,
                  customColor: '#2A2A3C',
                  requireWallet: true
                }
              },
              simulation: {
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
                  customColor: '#2A2A3C',
                  requireWallet: false
                }
              },
              bridge: {
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
                  customColor: '#2A2A3C',
                  requireWallet: true
                }
              }
            };

            // Add all child elements from the configuration with proper content initialization
            Web3Configs.defiSection.children.forEach((child, index) => {
              const childId = `defiModule-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
              const moduleType = index === 0 ? 'aggregator' : index === 1 ? 'simulation' : 'bridge';
              const moduleContent = defaultModuleContent[moduleType];
              
              const childElement = {
                ...child,
                id: childId,
                content: moduleContent,
                styles: {
                  backgroundColor: '#2A2A3C',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  color: '#fff'
                },
                configuration: {
                  moduleType,
                  enabled: true,
                  customColor: '#2A2A3C',
                  requireWallet: moduleContent.settings.requireWallet
                }
              };
              
              addNewElement(
                child.type,
                1,
                childElement,
                newId,
                childElement.configuration,
                childId
              );
            });
          }
        }
        setSelectedElement({ id: item.id, type: 'defiSection', configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements, contextConnected, walletAddress]);

  // Handle drop events within the DeFi section with improved error handling
  const onDropItem = useCallback((item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);
    if (!parentElement) return;

    // Check if the item being dropped is a DeFi section
    if (item.type === 'defiSection') {
      // Check if a DeFi section with this configuration already exists in the parent section
      const sectionElement = findElementById(parentElement.parentId, elements);
      const existingDeFi = sectionElement?.children
        ?.map(childId => findElementById(childId, elements))
        ?.find(el => el?.type === 'defiSection' && el?.configuration === item.configuration);

      if (existingDeFi) {
        // If a DeFi section with this configuration exists, don't create a new one
        return;
      }
    }

    // Create a new element with the same type and configuration as the dropped item
    const newId = addNewElement(item.type, 1, null, parentId, {
      content: item.content || '',
      styles: item.styles || {},
      configuration: item.configuration,
      settings: item.settings || {}
    });

    // Update the parent element's children with unique values
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === parentId
          ? {
              ...el,
              children: [...new Set([...el.children, newId])], // Ensure unique children
            }
          : el
      )
    );

    // Select the newly created element
    setSelectedElement({ id: newId, type: item.type, configuration: item.configuration });
  }, [addNewElement, findElementById, elements, setElements, setSelectedElement]);

  // Find the current DeFi section and its children with improved error handling
  const defi = useMemo(() => findElementById(id, elements), [id, elements, findElementById]);
  const configChildren = useMemo(() => Web3Configs.defiSection?.children || [], []);

  // Handle modal interactions
  const handleModalToggle = useCallback(() => {
    setModalOpen(prev => !prev);
  }, []);

  // Handle section selection
  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'defiSection', configuration });
  }, [id, configuration, setSelectedElement]);

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
        <p className='element-description'>{description}</p>
      </div>
    );
  }

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
      onClick={handleSelect}
    >
      <strong>{label}</strong>
      <DeFiSection
        id={id}
        handleSelect={handleSelect}
        uniqueId={id}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
        type="defiSection"
        styles={defi?.styles}
        isConnected={contextConnected}
        walletAddress={walletAddress}
        isLoading={isLoading}
      />
    </div>
  );
};

export default React.memo(DraggableDeFi); 