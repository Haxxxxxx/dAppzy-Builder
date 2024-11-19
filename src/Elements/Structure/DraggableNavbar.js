import React, { useContext, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import Image from '../Media/Image';
import Button from '../Interact/Button';
import Span from '../Texts/Span';
import DropZone from '../../utils/DropZone'; // Import the DropZone component

const DraggableNavbar = ({ configuration, isEditing, showDescription = false }) => {
  const { addNewElement, setElements, setSelectedElement, selectedElement } = useContext(EditableContext);
  const [{ isDragging }, drag] = useDrag(
    () => ({
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
    }),
    [configuration, isEditing, addNewElement, setElements]
  );

  // Use a unique identifier for this instance
  const uniqueId = useMemo(() => `navbar-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`, []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle selecting the entire navbar element
  const handleSelectNavbar = (e) => {
    e.stopPropagation(); // Prevents the click from bubbling up
    setSelectedElement({
      id: uniqueId,
      type: 'navbar',
      configuration,
    });
    setIsModalOpen(true);
  };

  const navbarContent = showDescription ? (
    <nav
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
      {configuration === 'twoColumn' ? 'Two-column Navbar' : configuration === 'threeColumn' ? 'Three-column Navbar' : 'logo-left-links-centered-buttons-right'}
    </nav>
  ) : (
    <>
      {configuration === 'twoColumn' && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Image id={`${uniqueId}-logo`} width="100px" height="50px" src="" />
          </div>
          <div>
            <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
              <li><Span id={`${uniqueId}-home`} content="Home" /></li>
              <li><Span id={`${uniqueId}-about`} content="About" /></li>
              <li><Span id={`${uniqueId}-contact`} content="Contact" /></li>
            </ul>
          </div>
        </nav>
      )}
      {configuration === 'threeColumn' && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
          <div>
            <Image id={`${uniqueId}-logo`} width="100px" height="50px" />
          </div>
          <div>
            <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
              <li><Span id={`${uniqueId}-home`} content="Home" /></li>
              <li><Span id={`${uniqueId}-services`} content="Services" /></li>
              <li><Span id={`${uniqueId}-contact`} content="Contact" /></li>
            </ul>
          </div>
          <div>
            <Button id={`${uniqueId}-cta`} content="Call to Action" />
          </div>
        </nav>
      )}
      {configuration === 'customTemplate' && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              id={`${uniqueId}-logo`}
              src="http://bafybeiar3s4oejrrcgzsghcdiupg5ey62rkfs5db6dzc6wj32yaymu6fiq.ipfs.localhost:8080" // Specify the IPFS source here
              styles={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
            <Span id={`${uniqueId}-title`} content="3S.Template" styles={{ marginLeft: '8px', fontSize: '1.5rem' }} />
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            color: 'var(--CoolGray-90, #21272A)', // Properly wrapped variable and fallback
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '100%'
          }}>
            <Span id={`${uniqueId}-link1`} content="Link" />
            <Span id={`${uniqueId}-link2`} content="Link" />
            <Span id={`${uniqueId}-link3`} content="Link" />
            <Span id={`${uniqueId}-link4`} content="Link" />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button
              id={`${uniqueId}-button1`}
              content="Button Text"
              styles={{
                border: 'none',
                padding: '16px 28px ',
                height: '48px',
                fontFamily: 'Roboto, sans-serif', // Apply desired font family
              }}
            />
            <Button
              id={`${uniqueId}-button2`}
              content="Button Text"
              styles={{
                backgroundColor: 'var(--dark-grey, #334155)',
                color: '#fff',
                padding: '16px 28px ',
                border: 'none',
                height: '48px',
                fontFamily: 'Roboto, sans-serif', // Apply desired font family
              }}
            />
          </div>


        </nav>
      )}

    </>
  );

  return selectedElement?.id === uniqueId ? (
    <>
      {navbarContent}
      <DropZone
        index={null} // Adjust the index or pass necessary props as per your logic
        onDrop={(item) => addNewElement(item.type, 1)}
        text="Drop here to create a new section below"
      />
    </>
  ) : (
    navbarContent
  );
};

export default DraggableNavbar;
