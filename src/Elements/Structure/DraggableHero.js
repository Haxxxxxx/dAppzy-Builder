import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import HeroOne from '../Sections/Heros/HeroOne';
import HeroTwo from '../Sections/Heros/HeroTwo';
import HeroThree from '../Sections/Heros/HeroThree';
import DropZone from '../../utils/DropZone';
import RemovableWrapper from '../../utils/RemovableWrapper';

const DraggableHero = ({ id, configuration, isEditing, showDescription = false, contentListWidth, children }) => {
  const { addNewElement, setElements, elements, findElementById, handleRemoveElement } = useContext(EditableContext);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'hero', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const newId = addNewElement('hero', 1, null, null, configuration);
        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === newId ? { ...el, configuration } : el
          )
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);

  const uniqueId = useMemo(() => `hero-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);

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

  const hero = findElementById(id, elements);
  const resolvedChildren = hero?.children?.map((childId) => findElementById(childId, elements)) || [];

  const handleRemove = () => {
    handleRemoveElement(id);
  };

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

  let HeroComponent;
  if (configuration === 'heroOne') {
    HeroComponent = (
      <HeroOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
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
      />
    );
  }

  return (
    <div
      ref={drag}
      style={{
        position: 'relative',
        border: isDragging ? '1px dashed #000' : 'none',
        marginBottom: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}
    >
      {/* Render the Hero Component */}
      {HeroComponent}

      {/* Remove Button */}
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

export default DraggableHero;
