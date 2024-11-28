import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import MintingSection from '../Sections/Web3Related/MintingSection';

const DraggableMintingSection = ({ id, configuration, isEditing, showDescription = false, contentListWidth }) => {
    const { addNewElement, setElements, elements, setSelectedElement, findElementById } = useContext(EditableContext);

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

  const mintingSection = findElementById(id, elements);
  const children = mintingSection?.children?.map((childId) => findElementById(childId, elements)) || [];

  const descriptions = {
    mintingSection: 'A section designed for minting NFTs with title, description, and rare items.',
  };

  const titles = {
    mintingSection: 'Minting Section',
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
        <strong>{titles[configuration]}</strong>
        <p>{descriptions[configuration]}</p>
      </div>
    );
  }

  return (
    <MintingSection
      uniqueId={id} // Pass the ID of the Minting Section
      children={children}
      setSelectedElement={setSelectedElement} // Ensure this always sets the Minting Section as selected
    />
  );
};

export default DraggableMintingSection;
