import React, { useContext, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import Image from './Image';
import Button from '../Interact/Button';
import Span from '../Texts/Span';

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
            {configuration === 'twoColumn' ? 'Two-column Navbar' : 'Three-column Navbar'}
        </div>
    ) : (
        <div
            id={uniqueId}
            ref={drag}
            onClick={handleSelectNavbar}
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
            {configuration === 'twoColumn' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Image id={`${uniqueId}-logo`} width="100px" height="50px" />
                        </div>
                        <div>
                            <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
                                <li><Span id={`${uniqueId}-home`} content="Home" /></li>
                                <li><Span id={`${uniqueId}-about`} content="About" /></li>
                                <li><Span id={`${uniqueId}-contact`} content="Contact" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            {configuration === 'threeColumn' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
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
                    </div>
                </div>
            )}
        </div>
    );

    return isEditing ? (
        <>{navbarContent}</>
    ) : (
        <div>{navbarContent}</div>
    );
};

export default DraggableNavbar;
