import React, { useContext, useMemo } from 'react';
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
}) => {
  const { addNewElement, setElements, elements, findElementById, handleRemoveElement } = useContext(EditableContext);

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

  const uniqueId = useMemo(
    () => `hero-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    []
  );

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
  const resolvedChildren =
    hero?.children?.map((childId) => findElementById(childId, elements)) || [];

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

      <div className='bento-extract-display'>
          <strong>{titles[configuration]}</strong>

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
          <p>{descriptions[configuration]}</p>
        </div>
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
