import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { defaultSectionStyles } from './defaultSectionStyles.js';
import { Heading, Paragraph, Button, Image, Span } from '../../SelectableElements';

const SectionOne = ({
    uniqueId,
    children = [],
    onDropItem,
    handleOpenMediaPanel,
    handleSelect,
}) => {
    const sectionRef = useRef(null);
    const { elements, updateStyles } = useContext(EditableContext);

    // Make this section droppable
    const { isOverCurrent, drop } = useElementDrop({
        id: uniqueId,
        elementRef: sectionRef,
        onDropItem,
    });

    const sectionElement = elements.find((el) => el.id === uniqueId);

    // Apply default styles if none exist
    useEffect(() => {
        if (!sectionElement) return;
        const noCustomStyles =
            !sectionElement.styles || Object.keys(sectionElement.styles).length === 0;
        if (noCustomStyles) {
            updateStyles(sectionElement.id, { ...defaultSectionStyles.sectionContainer });
        }
    }, [sectionElement, updateStyles]);

    const containerStyles = {
        ...defaultSectionStyles.sectionContainer,
        ...(sectionElement?.styles || {}),
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
    };

    return (
        <section
            ref={(node) => {
                sectionRef.current = node;
                drop(node);
            }}
            style={containerStyles}
            onClick={(e) => {
                e.stopPropagation();
                handleSelect(e);
            }}
        >
            <div style={defaultSectionStyles.labelContainer}>
                {children
                    .filter((child) => child.type === 'span')
                    .map((child) => (
                        <Span
                            key={child.id}
                            id={child.id}
                            content={child.content}
                            styles={
                                { ...defaultSectionStyles.label, ...(child.styles || {}) }
                            }
                        />
                    ))}
            </div>

            <div style={defaultSectionStyles.contentWrapper}>
                {children
                    .filter((child) => child.type === 'heading')
                    .map((child) => (
                        <Heading
                            key={child.id}
                            id={child.id}
                            content={child.content}
                            styles={{ ...defaultSectionStyles.heading, ...(child.styles || {}) }}
                        />
                    ))}
                {children
                    .filter((child) => child.type === 'paragraph')
                    .map((child) => (
                        <Paragraph
                            key={child.id}
                            id={child.id}
                            content={child.content}
                            styles={{ ...defaultSectionStyles.paragraph, ...(child.styles || {}) }}
                        />
                    ))}
                {/* Button container for side-by-side buttons */}
                <div style={defaultSectionStyles.buttonContainer}>
                    {children
                        .filter((child) => child.type === 'button')
                        .map((child, index) => (
                            <Button
                                key={child.id}
                                id={child.id}
                                content={child.content}
                                styles={
                                    index === 0
                                        ? { ...defaultSectionStyles.primaryButton, ...(child.styles || {}) }
                                        : { ...defaultSectionStyles.secondaryButton, ...(child.styles || {}) }
                                }
                            />
                        ))}
                </div>
            </div>
            <div style={defaultSectionStyles.imageContainer}>
                {children
                    .filter((child) => child.type === 'image')
                    .map((child) => (
                        <Image
                            key={child.id}
                            id={child.id}
                            src={child.content}
                            styles={{ ...defaultSectionStyles.image, ...(child.styles || {}) }}
                            handleOpenMediaPanel={handleOpenMediaPanel}
                            handleDrop={onDropItem}
                        />
                    ))}
            </div>
        </section>
    );
};

export default SectionOne;
