import React, { useContext, useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';
import { Image, Span, Link } from '../SelectableElements';
import useElementDrop from '../../utils/useElementDrop';
import DeFiFooter from '../Sections/Footers/DeFiFooter';

const DraggableFooter = ({
  id,
  configuration,
  isEditing,
  showDescription = false,
  contentListWidth,
  handleOpenMediaPanel,
  imgSrc,
  label,
}) => {
  const {
    addNewElement,
    setElements,
    elements,
    findElementById,
    setSelectedElement,
    updateStyles,
  } = useContext(EditableContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  const navRef = useRef(null);

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

  const { isOverCurrent, drop } = useElementDrop({
    id: id,
    elementRef: navRef,
    onDropItem,
  });

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { id, type: 'footer', configuration },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEditing) {
        const topLevelElements = elements.filter(el => !el.parentId) + 1;
        const index = topLevelElements.length;

        const newId = addNewElement('footer', 1, index, null, configuration);
        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === newId ? { ...el, configuration } : el
          )
        );
      }
    },
  }), [configuration, isEditing, addNewElement, setElements, elements]);

  const footer = findElementById(id, elements);
  const resolvedChildren =
    footer?.children?.map((childId) => findElementById(childId, elements)) || [];

  const toggleModal = () => setModalOpen((prev) => !prev);

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

  const titles = {
    customTemplate: 'Custom Footer',
    detailedFooter: 'Detailed Footer',
    templateFooter: 'Template Footer',
    defiFooter: 'DeFi Footer',
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'footer', styles: footer?.styles });
  };

  // Handle preview display
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
        <strong className='element-name'>{titles[configuration]}</strong>
      </div>
    );
  }

  if (configuration === 'defiFooter') {
    return (
      <DeFiFooter
        handleSelect={handleSelect}
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    );
  }

  let FooterComponent;
  if (configuration === 'customTemplate') {
    FooterComponent = (
      <SimpleFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'detailedFooter') {
    FooterComponent = (
      <DetailedFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  } else if (configuration === 'templateFooter') {
    FooterComponent = (
      <TemplateFooter
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={resolvedChildren}
        onDropItem={onDropItem}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  }

  if (isEditing) {
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
        onClick={toggleModal}
      >
        <strong>{label}</strong>
        {FooterComponent}
      </div>
    );
  }

  return FooterComponent;
};

export default DraggableFooter;
