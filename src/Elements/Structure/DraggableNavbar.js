import React, { useContext, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import TwoColumnNavbar from '../Sections/Navbars/TwoColumnNavbar';
import ThreeColumnNavbar from '../Sections/Navbars/ThreeColumnNavbar';
import CustomTemplateNavbar from '../Sections/Navbars/CustomTemplateNavbar';

const DraggableNavbar = ({ id, configuration, isEditing, showDescription = false, contentListWidth }) => {
  const { addNewElement, setElements, elements, findElementById } = useContext(EditableContext);


  // Always call hooks, regardless of conditions
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'navbar', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const newId = addNewElement('navbar', 1, null, null, configuration);
        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === newId ? { ...el, configuration } : el
          )
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements]);

  const uniqueId = useMemo(() => `navbar-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);

  
  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;
  
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
  };
  
  // Safely find navbar
  const navbar = findElementById(id, elements);
  const children = navbar?.children?.map((childId) => findElementById(childId, elements)) || []; // Map child IDs to elements

  // Descriptions for each navbar configuration
  const descriptions = {
    twoColumn: 'A two-column navbar with logo and links.',
    threeColumn: 'A three-column navbar with logo, links, and a button.',
    customTemplate: 'A custom template navbar with logo, links, and buttons.',
  };

  const titles = {
    twoColumn: 'Two Columns',
    threeColumn: 'Three Columns',
    customTemplate: '3S Template Navbar',
  };

  // Show description mode
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

  // Choose the correct NavbarComponent based on configuration
  let NavbarComponent;
  if (configuration === 'customTemplate') {
    NavbarComponent = (
      <CustomTemplateNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem} // Pass the callback here
      />
    );
  } else if (configuration === 'twoColumn') {
    NavbarComponent = (
      <TwoColumnNavbar
        uniqueId={id}
        children={children}
        onDropItem={onDropItem} // Pass the callback here
      />
    );
  } else if (configuration === 'threeColumn') {
    NavbarComponent = (
      <ThreeColumnNavbar
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem} // Pass the callback here
      />
    );
  }

  return (
    <>
      {NavbarComponent}
    </>
  );
};

export default DraggableNavbar;
