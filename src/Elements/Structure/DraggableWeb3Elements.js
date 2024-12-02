import React, { useContext } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import MintingSection from '../Sections/Web3Related/MintingSection';
import { structureConfigurations } from '../../configs/structureConfigurations';

const DraggableWeb3Elements = ({ id, configuration, isEditing, showDescription = false, contentListWidth,handlePanelToggle}) => {
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
  const resolvedChildren = mintPage?.children?.map((childId) => findElementById(childId, elements)) || [];

  console.log(resolvedChildren);

  const handleRemove = () => {
    handleRemoveElement(id);
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
  return (
    <div
      ref={drag}
      style={{
        position: 'relative',
        border: isDragging ? '1px dashed #000' : 'none',
      }}
    >
      <MintingSection 
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        setSelectedElement={setSelectedElement}
        handlePanelToggle={handlePanelToggle}
       />
      <button
        onClick={handleRemove}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default DraggableWeb3Elements;
