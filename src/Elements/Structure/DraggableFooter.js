import React, { useContext, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import Span from '../Texts/Span';
import Button from '../Interact/Button';
import Image from '../Media/Image'; // Example if you want images
import DropZone from '../../utils/DropZone'; // Import the DropZone component

const DraggableFooter = ({ configuration, isEditing, showDescription = false }) => {
  const { addNewElement, setElements, setSelectedElement, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(() => ({
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
  }), [configuration, isEditing, addNewElement, setElements]);

  // Unique ID generation
  const uniqueId = useMemo(() => `footer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle selecting the footer
  const handleSelectFooter = (e) => {
    e.stopPropagation();
    setSelectedElement({
      id: uniqueId,
      type: 'footer',
      configuration,
    });
    setIsModalOpen(true);
  };

  const footerContent = showDescription ? (
    <footer
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
      {configuration === 'simple' ? 'Simple Footer Description' : 'Detailed Footer Description'}
    </footer>
  ) : (
    <>
      {configuration === 'simple' && (
        <footer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Span id={`${uniqueId}-simple-message`} content="Simple Footer - © 2024 My Company" />
          <div style={{ marginLeft: '16px' }}>
            <Button id={`${uniqueId}-simple-cta`} content="Subscribe" />
          </div>
        </footer>
      )}
      {configuration === 'detailed' && (
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Span id={`${uniqueId}-company-info`} content="Company Name, Address Line 1, Address Line 2" />
            <div style={{ marginTop: '8px' }}>
              <Button id={`${uniqueId}-contact`} content="Contact Us" />
            </div>
          </div>
          <div>
            <ul style={{ display: 'flex', flexDirection: 'column', listStyleType: 'none', padding: 0 }}>
              <li><Span id={`${uniqueId}-privacy`} content="Privacy Policy" /></li>
              <li><Span id={`${uniqueId}-terms`} content="Terms of Service" /></li>
              <li><Span id={`${uniqueId}-support`} content="Support" /></li>
            </ul>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Span id={`${uniqueId}-social-media`} content="Follow us: [Social Links]" />
          </div>
        </footer>
      )}
    </>
  );

  return selectedElement?.id === uniqueId ? (
    <>
      {footerContent}
      <DropZone
        index={null} // Adjust as per your needs
        onDrop={(item) => addNewElement(item.type, 1)}
        text="Drop here to create a new section below"
      />
    </>
  ) : (
    footerContent
  );
};

export default DraggableFooter;
