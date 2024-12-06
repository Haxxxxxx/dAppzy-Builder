import React, { useContext, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import MintingSection from '../Sections/Web3Related/MintingSection';
import { structureConfigurations } from '../../configs/structureConfigurations';

const DraggableWeb3Elements = ({ id, configuration, isEditing, showDescription = false, contentListWidth, handlePanelToggle, handleOpenMediaPanel }) => {
  const { addNewElement, setElements, elements, setSelectedElement, findElementById, handleRemoveElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'mintingSection', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const newId = addNewElement('mintingSection', 1, null, null, configuration);
        setElements((prevElements) =>
          prevElements.map((el) => (el.id === newId ? { ...el, configuration } : el))
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);
  const mintPage = findElementById(id, elements);

  // Fetch the corresponding configuration structure dynamically
  const structure = structureConfigurations[configuration.type] || {};

  // Enrich children with configuration data
  const resolvedChildren = mintPage?.children?.map((childId) => {
    const child = findElementById(childId, elements);
    return child || null;
  }).filter(Boolean);

  
  useEffect(() => {
    console.log('Resolved Children with Labels and Content:', resolvedChildren);
    console.log('Structure Configuration:', structure);
  }, [resolvedChildren, structure]);

  const handleRemove = () => {
    handleRemoveElement(id);
  };

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
                children: [...new Set([...el.children, newId])], // Ensure unique children
              }
            : el
        )
      );
    }
  };

  if (showDescription) {
    return (
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          padding: '8px',
          margin: '8px 0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'move',
        }}
      >
        <strong>Minting Section</strong>
        <p>A section designed for minting NFTs with title, description, and rare items.</p>
      </div>
    );
  }

  return (
    <div
      ref={drag}
      style={{
        position: 'relative',
        border: isDragging ? '1px dashed #000' : 'none',
      }}
    >
      <MintingSection
        handleOpenMediaPanel={handleOpenMediaPanel}
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren} // Pass enriched children
        onDropItem={onDropItem}
        setSelectedElement={setSelectedElement}
        handlePanelToggle={handlePanelToggle}
      />

    </div>
  );
};

export default DraggableWeb3Elements;
