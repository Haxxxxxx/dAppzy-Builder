import React, { useContext, useEffect, useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import MintingSection from '../Sections/Web3Related/MintingSection';
import '../../components/css/LeftBar.css';

const DraggableMinting = ({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc, // Image source for the navbar preview
  label, // Label for the navbar
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const modalRef = useRef(null);

  // Set up drag-and-drop functionality
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
          prevElements.map((el) =>
            el.id === newId ? { ...el, configuration } : el
          )
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);
  // Handle dropping items inside this navbar
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
  // Find the current minting section and its children
  const minting = findElementById(id, elements);
  const children = minting?.children?.map((childId) => findElementById(childId, elements)) || [];

  // Modal toggle logic
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

  // Handle selection
  const handleSelect = () => {
    setSelectedElement({ id, type: 'mintingSection', styles: minting?.styles });
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
        {/* <p>{descriptions[configuration]}</p> */}
      </div>
    );
  }

  // Render the minting section
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
      onClick={(e) => {
        toggleModal(); // Show/hide modal
      }}
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
      />
      <strong>{label}</strong>
      <MintingSection
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

export default DraggableMinting;
