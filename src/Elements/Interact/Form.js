import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import FormStructureModal from '../../utils/SectionQuickAdd/FormStructureModal';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils'; // Ensure this utility renders child elements correctly

const Form = ({ id }) => {
  const { selectedElement, elements, addNewElement, setSelectedElement, setElements } =
    useContext(EditableContext);
  const formElement = elements.find((el) => el.id === id);
  const { children = [], styles = {} } = formElement || {};
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDrop = (item, parentId) => {
    const newId = addNewElement(item.type, 1, null, parentId);
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === parentId ? { ...el, children: [...el.children, newId] } : el
      )
    );
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'form', styles });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleFormStructureSubmit = (structureId, customFields) => {
    const structureTemplates = {
      basic: ['text', 'email'],
      registration: ['text', 'email', 'password'],
      contact: ['text', 'email', 'textarea'],
    };

    const fields = structureTemplates[structureId] || [];
    const allFields = [...fields, ...customFields.map((field) => field.type)];

    const newChildren = allFields.map((fieldType) => {
      const newId = addNewElement('input', 1, null, id);
      return newId;
    });

    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, children: [...el.children, ...newChildren] } : el
      )
    );

    setIsModalOpen(false);
  };

  return (
    <>
      <div>
        <form
          id={id}
          onClick={handleSelect}
          style={{
            ...styles,
            padding: '10px',
            border: selectedElement?.id === id ? '1px dashed blue' : '1px solid #ccc',
          }}
        >
          {children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? renderElement(childElement, elements) : null; // Use renderElement for rendering
          })}
          <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
        </form>
        <button onClick={handleOpenModal}>Edit Form Structure</button>
      </div>
      <FormStructureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormStructureSubmit}
        editingFormId={id} // Pass the current form ID
      />
    </>
  );
};

export default Form;
