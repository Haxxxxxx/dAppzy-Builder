import React, { useContext, useEffect, useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import MintingSection from '../Sections/Web3Related/MintingSection';
import { Web3Configs } from '../../configs/Web3/Web3Configs';
import '../../components/css/LeftBar.css';

/**
 * DraggableMinting component for rendering and managing minting sections.
 * Supports drag and drop functionality, modal interactions, and different minting configurations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the minting section
 * @param {string} props.configuration - Minting configuration type
 * @param {boolean} props.isEditing - Whether the minting section is in edit mode
 * @param {boolean} props.showDescription - Whether to show the description
 * @param {number} props.contentListWidth - Width of the content list
 * @param {Function} props.handlePanelToggle - Function to handle panel toggle
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {string} props.imgSrc - Image source for the minting section preview
 * @param {string} props.label - Label for the minting section
 * @param {string} props.description - Description of the minting section
 */
const DraggableMinting = ({
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
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Setup drag behavior with improved configuration handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { 
      id, 
      type: 'mintingSection', 
      configuration,
      structure: configuration 
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        // Check if a minting section with this configuration already exists in the current section
        const dropResult = monitor.getDropResult();
        const targetSectionId = dropResult?.sectionId;
        
        if (targetSectionId) {
          const sectionElement = findElementById(targetSectionId, elements);
          const existingMinting = sectionElement?.children
            ?.map(childId => findElementById(childId, elements))
            ?.find(el => el?.type === 'mintingSection' && el?.configuration === item.configuration);

          if (!existingMinting) {
            // Create a unique ID for the new minting section
            const newId = `mintingSection-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
        // Get the current number of elements to determine the index
        const currentElements = elements.filter(el => !el.parentId);
        const index = currentElements.length;
        
            // Add the main minting section element at the end
            addNewElement('mintingSection', 1, index, targetSectionId, {
              ...Web3Configs.mintingSection,
              configuration: item.configuration,
              structure: item.configuration
            }, newId);

            // Initialize default module content
            const defaultModuleContent = {
              logo: {
                content: '',
                label: 'NFT Logo',
                styles: {
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }
              },
              timer: {
                content: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                label: 'Minting starts in',
                styles: {
                  fontSize: '1.2rem',
                  color: '#fff'
                }
              },
              remaining: {
                content: '1000/1000',
                label: 'Remaining',
                styles: {
                  fontSize: '1rem',
                  color: '#ccc'
                }
              },
              value: {
                content: '1',
                label: 'Price',
                styles: {
                  fontSize: '1rem',
                  color: '#ccc'
                }
              },
              currency: {
                content: 'SOL',
                label: 'Currency',
                styles: {
                  fontSize: '1rem',
                  color: '#ccc'
                }
              },
              quantity: {
                content: '1',
                label: 'Quantity',
                styles: {
                  fontSize: '1rem',
                  color: '#ccc'
                }
              },
              price: {
                content: '1 SOL',
                label: 'Total Price',
                styles: {
                  fontSize: '1rem',
                  color: '#ccc'
                }
              },
              mintButton: {
                content: 'MINT',
                label: 'Mint Button',
                styles: {
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid #fff',
                  borderRadius: '8px',
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }
              }
            };

            // Add all child elements from the configuration with proper content initialization
            Object.entries(defaultModuleContent).forEach(([type, content]) => {
              const childId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
              addNewElement(
                type,
                1,
                {
                  ...content,
                  id: childId,
                  parentId: newId
                },
                newId,
                {
                  type,
                  enabled: true
                },
                childId
              );
            });
          }
        }
        setSelectedElement({ id: item.id, type: 'mintingSection', configuration: item.configuration });
      }
    },
  }), [configuration, isEditing, elements]);

  // Handle drop events within the minting section with improved error handling
  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);
    if (!parentElement) return;

    // Check if the item being dropped is a minting section
    if (item.type === 'mintingSection') {
      // Check if a minting section with this configuration already exists in the parent section
      const sectionElement = findElementById(parentElement.parentId, elements);
      const existingMinting = sectionElement?.children
        ?.map(childId => findElementById(childId, elements))
        ?.find(el => el?.type === 'mintingSection' && el?.configuration === item.configuration);

      if (existingMinting) {
        // If a minting section with this configuration exists, don't create a new one
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
  };

  // Find the current minting section and its children with improved error handling
  const minting = findElementById(id, elements);
  const configChildren = Web3Configs.mintingSection?.children || [];
  const resolvedChildren = (minting?.children || [])
    .map((childId) => findElementById(childId, elements))
    .filter(Boolean);
  const childrenToRender = resolvedChildren.length > 0 ? resolvedChildren : configChildren;

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
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent selections
    setSelectedElement({ id, type: 'mintingSection', styles: minting?.styles });
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
        <p className='element-description'>{description}</p>
      </div>
    );
  }

  // Render the draggable minting section component
  return (
    <div
      ref={drag}
      style={{
        position: 'relative',
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
      <MintingSection
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    </div>
  );
};

export default DraggableMinting;
