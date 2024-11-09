// DraggableFooter.js
import React, { useContext, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import Span from '../Texts/Span';
import Button from '../Interact/Button';

const DraggableFooter = ({ configuration, isEditing, showDescription = false }) => {
  const { addNewElement, setElements, setSelectedElement, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'ELEMENT',
      item: { type: 'footer', configuration },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (monitor.didDrop() && !isEditing) {
          const newId = addNewElement('footer', 1, null, null, configuration);
          setElements((prevElements) =>
            prevElements.map((el) => (el.id === newId ? { ...el, configuration } : el))
          );
        }
      },
    }),
    [configuration, isEditing, addNewElement, setElements]
  );

  // Use a unique identifier for this instance
  const uniqueId = useMemo(() => `footer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle selecting the entire footer element
  const handleSelectFooter = (e) => {
    e.stopPropagation(); // Prevents the click from bubbling up
    setSelectedElement({
      id: uniqueId,
      type: 'footer',
      configuration,
    });
    setIsModalOpen(true);
  };

  const footerContent = showDescription ? (
    <div
      id={uniqueId}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditing ? 'default' : 'move',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#e0e0e0',
        border: selectedElement?.id === uniqueId ? '2px solid blue' : '2px solid #333',
        borderRadius: '8px',
      }}
    >
      {configuration === 'simple' ? 'Simple Footer' : 'Detailed Footer'}
    </div>
  ) : (
    <div
      id={uniqueId}
      ref={drag}
      onClick={handleSelectFooter}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditing ? 'default' : 'move',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#e0e0e0',
        border: selectedElement?.id === uniqueId ? '2px solid blue' : '2px solid #333',
        borderRadius: '8px',
      }}
    >
      {configuration === 'simple' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Span id={`${uniqueId}-copyright`} content="© 2024 My Company" />
          </div>
        </div>
      )}
      {configuration === 'detailed' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Span id={`${uniqueId}-address`} content="123 Main St, Anytown, USA" />
            </div>
            <div>
              <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
                <li><Span id={`${uniqueId}-privacy`} content="Privacy Policy" /></li>
                <li><Span id={`${uniqueId}-terms`} content="Terms of Service" /></li>
                <li><Span id={`${uniqueId}-contact`} content="Contact Us" /></li>
              </ul>
            </div>
            <div>
              <Button id={`${uniqueId}-cta`} content="Subscribe" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return isEditing ? (
    <>{footerContent}</>
  ) : (
    <div>{footerContent}</div>
  );
};

export default DraggableFooter;
