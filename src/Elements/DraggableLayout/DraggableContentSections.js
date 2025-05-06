import React, { useContext, useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SectionOne from '../Sections/ContentSections/SectionOne';
import SectionTwo from '../Sections/ContentSections/SectionTwo';
import SectionThree from '../Sections/ContentSections/SectionThree';
import SectionFour from '../Sections/ContentSections/SectionFour';

const DraggableContentSections = ({
  id,
  configuration,
  isEditing,
  showDescription,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
  imgSrc, // Image source for the preview
  label,   // Label to show in the navigation panel
}) => {
  const {
    addNewElement,
    setElements,
    elements,
    findElementById,
    setSelectedElement,
  } = useContext(EditableContext);

  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Setup drag behavior using react-dnd
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { id, type: 'ContentSection', structure: configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Handle drop events within the section (if needed)
  const onDropItem = (item, parentId) => {
    if (!item || !parentId) return;
    const parentElement = findElementById(parentId, elements);
    if (parentElement) {
      const newId = addNewElement(item.type, 1, null, parentId);
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? { ...el, children: [...new Set([...el.children, newId])] }
            : el
        )
      );
    }
  };

  const sectionElement = findElementById(id, elements);
  const children = sectionElement?.children?.map((childId) => findElementById(childId, elements)) || [];

  const toggleModal = () => setModalOpen((prev) => !prev);

  // Close modal if clicking outside
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

  // Set the current element as selected on click
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'ContentSection', styles: sectionElement?.styles });
  };

  // Render a preview with description if required
  if (showDescription) {
    return (
      <div className="bento-extract-display" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <img
          src={imgSrc}
          alt={label}
          style={{ width: '100%', height: 'auto', marginBottom: '8px', borderRadius: '4px' }}
        />
        <strong className="element-name">{label}</strong>
      </div>
    );
  }

  // Render the actual section component based on its configuration
  let SectionComponent;
  if (configuration === 'sectionOne') {
    SectionComponent = (
      <SectionOne
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'sectionTwo') {
    SectionComponent = (
      <SectionTwo
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'sectionThree') {
    SectionComponent = (
      <SectionThree
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  }else if (configuration === 'sectionFour') {
    SectionComponent = (
      <SectionFour
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={children}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
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
      onClick={(e) => {
        toggleModal();
      }}
    >
      <strong>{label}</strong>
      {SectionComponent}
    </div>
  );
};

export default DraggableContentSections;
