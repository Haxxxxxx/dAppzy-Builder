import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import HeroOne from '../Sections/Heros/HeroOne';
import HeroTwo from '../Sections/Heros/HeroTwo';
import HeroThree from '../Sections/Heros/HeroThree';

const DraggableHero = ({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  children,
  handleOpenMediaPanel,
  imgSrc, // Image source for the navbar preview
  label, // Label for the navbar
}) => {

  const { addNewElement, setElements, elements, findElementById, handleRemoveElement } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const modalRef = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'hero', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        // Just add the hero element with configuration as structure
        const newId = addNewElement('hero', 1, null, null, configuration);

        // Now update the element with the given configuration
        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === newId ? { ...el, configuration } : el
          )
        );
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


  const hero = findElementById(id, elements);
  const resolvedChildren = hero?.children?.map((childId) => findElementById(childId, elements)) || [];

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

  const descriptions = {
    heroOne: 'A simple hero section with title, subtitle, and a button.',
    heroTwo: 'Another hero section with a different layout and styling.',
    heroThree: 'A more detailed hero section.',
  };

  const titles = {
    heroOne: 'Hero Section One',
    heroTwo: 'Hero Section Two',
    heroThree: 'Hero Section Three',
  };

  if (showDescription) {
    return (

      <div className='bento-extract-display' onClick={toggleModal}
      >

        <div
          ref={drag}
          style={{
            opacity: isDragging ? 0.5 : 1,
            padding: '8px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'move',
            backgroundColor: "#FBFBFB",
            color: '#686868'
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
              border: '1px solid #ddd',
            }}
          />
        </div>
        {/* <p>{descriptions[configuration]}</p> */}
        <strong className='element-name'>{label}</strong>
      </div>

    );
  }

  let HeroComponent;
  if (configuration === 'heroOne') {
    HeroComponent = (
      <HeroOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    );
  } else if (configuration === 'heroTwo') {
    HeroComponent = (
      <HeroTwo
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
      />
    );
  } else if (configuration === 'heroThree') {
    HeroComponent = (
      <HeroThree
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    );
  }

  return (
    <div
      ref={drag}
      style={{
        position: 'relative',
        border: isDragging ? '1px dashed #000' : 'none',
        backgroundColor: '#f9f9f9',
      }}

    >


      {HeroComponent}
    </div>
  );
};

export default DraggableHero;
