import React, { useContext, useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DeFiSection from '../Sections/Web3Related/DeFiSection';
import { Web3Configs } from '../../configs/Web3/Web3Configs';
import '../../components/css/LeftBar.css';

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
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { id, type: 'defiSection', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        // Create a unique ID for the new DeFi section
        const newId = `defiSection-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        // Get the current number of elements to determine the index
        const currentElements = elements.filter(el => !el.parentId);
        const index = currentElements.length;
        
        // Add the main DeFi section element at the end
        addNewElement('defiSection', 1, index, null, configuration, newId);

        // Get the configuration for DeFi section from Web3Configs
        const defiConfig = Web3Configs.defiSection;

        // Initialize default module content
        const defaultModuleContent = {
          aggregator: {
            title: 'DeFi Aggregator',
            description: 'Access multiple DeFi protocols through a single interface',
            stats: [
              { label: 'Connected Wallet', value: 'Not Connected' },
              { label: 'Total Pools', value: 'Loading...' },
              { label: 'Total Value Locked', value: '$0' },
              { label: 'Best APY', value: 'Not Connected' }
            ]
          },
          simulation: {
            title: 'Investment Simulator',
            description: 'Simulate different investment strategies',
            stats: [
              { label: 'Investment Range', value: '$10,000' },
              { label: 'Supported Assets', value: '20+' },
              { label: 'Historical Data', value: '5 Years' }
            ]
          },
          bridge: {
            title: 'Cross-Chain Bridge',
            description: 'Transfer assets between different blockchains',
            stats: [
              { label: 'Supported Chains', value: 'Select Chain' },
              { label: 'Transfer Time', value: 'Select Chain' },
              { label: 'Security Score', value: '0.1%' }
            ]
          }
        };

        // Add all child elements from the configuration with proper content initialization
        defiConfig.children.forEach((child, index) => {
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
              customColor: '#2A2A3C'
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

        setElements(prevElements => {
          const updatedElements = [...prevElements];
          const mainElement = updatedElements.find(el => el.id === newId);
          if (mainElement) {
            mainElement.configuration = configuration;
          }
          return updatedElements;
        });
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);

  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;

    const parentElement = findElementById(parentId, elements);

    if (parentElement) {
      const newId = addNewElement(item.type, 1, null, parentId);

      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? {
              ...el,
              children: [...new Set([...el.children, newId])],
            }
            : el
        )
      );
    }
  };

  const defi = findElementById(id, elements);
  const children = defi?.children?.map((childId) => findElementById(childId, elements)) || [];

  const toggleModal = () => setModalOpen((prev) => !prev);

  const handleSelect = () => {
    setSelectedElement({ id, type: 'defiSection', styles: defi?.styles });
  };

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
        position: 'relative',
        cursor: 'pointer',
        border: isDragging ? '1px dashed #000' : 'none',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={toggleModal}
    >
      <strong>{label}</strong>
      <DeFiSection
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    </div>
  );
};

export default DraggableDeFi; 