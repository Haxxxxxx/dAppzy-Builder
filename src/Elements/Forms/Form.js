import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';

const Form = ({ id }) => {
  const { selectedElement, elements, addNewElement, setSelectedElement, setElements } = useContext(EditableContext);
  
  const formElement = elements.find((el) => el.id === id);
  const { children = [], styles = {} } = formElement || {};

  // Auto-populate a basic structure if no fields exist
  useEffect(() => {
    if (formElement && children.length === 0) {
      // Define the basic structure with field types and default labels
      const basicStructure = [
        { fieldType: 'text', label: 'Text:' },
        { fieldType: 'email', label: 'Email:' }
      ];
      const newChildren = basicStructure.map((field) => {
        // Pass index as 0 and the configuration as the fifth parameter.
        return addNewElement('input', 1, 0, id, { fieldType: field.fieldType, label: field.label });
      });
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === id ? { ...el, children: newChildren } : el
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formElement]);

  const handleDrop = (item, parentId) => {
    const newId = addNewElement(item.type, 1, 0, parentId, null);
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

  return (
    <div>
      <form
        id={id}
        onClick={handleSelect}
        style={{
          ...styles,
          padding: '10px'
        }}
      >
        {children.length === 0 ? (
          <div
            className="empty-placeholder"
            style={{
              color: '#888',
              fontStyle: 'italic',
              textAlign: 'center',
              fontFamily: 'Montserrat'
            }}
          >
            Empty Form – Drop fields here
          </div>
        ) : (
          children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            if (!childElement) return null;
            // If the element is an input, render it with its label
            if (childElement.type === 'input') {
              const labelText = childElement.configuration?.label || '';
              return (
                <div
                  key={childId}
                  className="form-field"
                  style={{
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily:'Montserrat'
                  }}
                >
                  <label
                    style={{
                      marginRight: '10px',
                      fontWeight: 'bold',
                      // Remove or adjust border after debugging
                      // border: '1px solid red',
                      padding: '2px'
                    }}
                  >
                    {labelText}
                  </label>
                  {renderElement(childElement, elements)}
                </div>
              );
            }
            return renderElement(childElement, elements);
          })
        )}
        <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
      </form>
    </div>
  );
};

export default Form;
