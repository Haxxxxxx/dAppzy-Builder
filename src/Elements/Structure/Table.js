import React, { useContext, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrag } from 'react-dnd';

const TableCell = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = '' } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'table-cell' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      updateContent(id, e.target.innerText);
    }
  };

  return (
    <td
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{
        cursor: 'text',
        padding: '8px',
        border: '1px solid #ccc',
        outline: 'none',
      }}
    >
      {content || 'Editable Cell'}
    </td>
  );
};

const TableRow = ({ id }) => {
  const { elements, addNewElement, setElements } = useContext(EditableContext);
  const rowElement = elements.find((el) => el.id === id);
  const { children = [] } = rowElement || {};

  useEffect(() => {
    if (rowElement && children.length === 0) {
      const newCellId = addNewElement('table-cell', 1, null, id);
      setElements((prevElements) =>
        prevElements.map((el) => (el.id === id ? { ...el, children: [newCellId] } : el))
      );
    }
  }, [rowElement, id, addNewElement, setElements]);

  return (
    <tr>
      {children.map((childId) => {
        const childElement = elements.find((el) => el.id === childId);
        return childElement ? <TableCell key={childId} id={childId} /> : null;
      })}
    </tr>
  );
};

const Table = ({ id }) => {
  const { elements, addNewElement, setElements, setSelectedElement } = useContext(EditableContext);
  const tableElement = elements.find((el) => el.id === id);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type: 'table', id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (tableElement && tableElement.children.length === 0) {
      const newRowId = addNewElement('table-row', 1, null, id);
      const newCellId = addNewElement('table-cell', 1, null, newRowId);

      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === id ? { ...el, children: [newRowId] } : el
        )
      );

      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === newRowId ? { ...el, children: [newCellId] } : el
        )
      );

      setSelectedElement({ id: newCellId, type: 'table-cell' });
    }
  }, [tableElement, id, addNewElement, setElements, setSelectedElement]);

  const { children = [] } = tableElement || {};

  return (
    <table
      id={id}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        width: '100%',
        borderCollapse: 'collapse',
        margin: '16px 0',
        border: '1px solid #ccc',
      }}
    >
      <tbody>
        {children.length === 0 ? (
          <tr>
            <td
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#888', 
                fontFamily:'Montserrat'
              }}
            >
              Empty Table – Drop items here
            </td>
          </tr>
        ) : (
          children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? <TableRow key={childId} id={childId} /> : null;
          })
        )}
      </tbody>
    </table>
  );
};

export { Table, TableRow, TableCell };
