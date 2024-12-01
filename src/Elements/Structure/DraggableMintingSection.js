import React, { useContext } from 'react';
import { useDrag } from 'react-dnd';
import { EditableContext } from '../../context/EditableContext';
import MintingSection from '../Sections/Web3Related/MintingSection';
import { structureConfigurations } from '../../configs/structureConfigurations'; // Adjust the import path as needed

const DraggableMintingSection = ({ id, configuration, isEditing, showDescription = false, contentListWidth }) => {
    const { addNewElement, setElements, elements, setSelectedElement, findElementById } = useContext(EditableContext);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'ELEMENT',
        item: { type: 'mintingSection', configuration },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (monitor.didDrop() && !isEditing) {
                const newId = addNewElement('mintingSection', 1, null, null, configuration);
                setElements((prevElements) =>
                    prevElements.map((el) => (el.id === newId ? { ...el, configuration } : el))
                );
            }
        },
    }), [configuration, isEditing, addNewElement, setElements]);

    const mintingSection = findElementById(id, elements);

    // Fetch children from the structureConfigurations using configuration
    const template = structureConfigurations[configuration] || {};
    const childrenFromConfiguration = template.children || [];
    const childrenFromElements = mintingSection?.children?.map((childId) => findElementById(childId, elements)) || [];

    const children = childrenFromElements.length > 0 ? childrenFromElements : childrenFromConfiguration;

    if (showDescription) {
        return (
            <div
                ref={drag}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    padding: '8px',
                    margin: '8px 0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'move',
                }}
            >
                <strong>Minting Section</strong>
                <p>A section designed for minting NFTs with title, description, and rare items.</p>
            </div>
        );
    }

    return (
        <MintingSection
            uniqueId={id}
            children={children}
            setSelectedElement={setSelectedElement}
        />
    );
};

export default DraggableMintingSection;
