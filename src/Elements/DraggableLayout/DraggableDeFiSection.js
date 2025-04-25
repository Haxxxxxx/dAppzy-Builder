import React, { useContext, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DeFiSection from '../Sections/Web3Related/DeFiSection';

const DraggableDeFiSection = ({
  id,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc,
  label,
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const modalRef = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { id, type: 'defiSection', structure: 'defiSection' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleSelect = (e) => {
    e.stopPropagation();
    const element = findElementById(id, elements);
    console.log('Selecting DeFi section:', element);
    setSelectedElement(element || { id, type: 'defiSection', styles: {} });
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
        <strong className='element-name'>DeFi Section</strong>
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
        uniqueId={id}
        handleSelect={handleSelect}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    </div>
  );
};

export default DraggableDeFiSection; 