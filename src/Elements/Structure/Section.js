import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import { renderElement } from '../../utils/RenderUtils';
import StructureAndElementsModal from '../../utils/StructureAndElementsModal';

const Section = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const sectionElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = sectionElement || {};
  const sectionRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'section', styles });
    setIsModalOpen(true); // Open the modal when section is selected
  };

  const handleDrop = (item, parentId) => {
    if (!item || !parentId) return;

    console.log(`Dropping item of type ${item.type} into Section with id ${parentId}`);

    // Create and add the new element
    const newId = addNewElement(item.type, item.level || 1, null, parentId);

    // Update the parent's children list, preventing duplication
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === parentId
          ? { ...el, children: [...new Set([...el.children, newId])] }
          : el
      )
    );
  };

  const handleAddElement = (type) => {
    // Add new element to the current section
    const newId = addNewElement(type, 1, null, id);
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, children: [...new Set([...el.children, newId])] } : el
      )
    );
    setIsModalOpen(false); // Close the modal after adding
  };

  const handleSelectStructure = (structure) => {
    console.log('Selected structure:', structure);
  
    let elementsToAdd = [];
  
    // Ensure unique IDs are generated only once per element
    if (structure === 'title-text') {
      const headingId = addNewElement('heading', 1, null, id);
      const paragraphId = addNewElement('paragraph', 1, null, id);
      elementsToAdd = [headingId, paragraphId];
    } else if (structure === 'title-image') {
      const headingId = addNewElement('heading', 1, null, id);
      const imageId = addNewElement('image', 1, null, id);
      elementsToAdd = [headingId, imageId];
    } else if (structure === 'two-columns') {
      const column1Id = addNewElement('div', 1, null, id);
      const column2Id = addNewElement('div', 1, null, id);
      elementsToAdd = [column1Id, column2Id];
    }
  
    // Update the parent's children list without duplication
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id
          ? {
              ...el,
              children: [...new Set([...el.children, ...elementsToAdd])],
            }
          : el
      )
    );
  
    setIsModalOpen(false); // Close the modal after adding structure
  };
  

  return (
    <>
      <section
        id={id}
        ref={sectionRef}
        onClick={handleSelect}
        style={{ ...styles, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}
      >
        New Section
        <div className="children-container">
          {children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? renderElement(childElement, elements) : null;
          })}
        </div>
      </section>
      <DropZone onDrop={(item) => handleDrop(item, id)} text="Click on the section or Drop items here to add to this section" style={{ width: '100%' }} />

      {/* Modal for adding new elements or selecting structure */}
      <StructureAndElementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectStructure={handleSelectStructure}
        onAddElement={handleAddElement}
      />
    </>
  );
};

export default Section;