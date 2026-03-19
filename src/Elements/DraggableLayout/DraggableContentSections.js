import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';
import SectionOne from '../Sections/ContentSections/SectionOne';
import SectionTwo from '../Sections/ContentSections/SectionTwo';
import SectionThree from '../Sections/ContentSections/SectionThree';
import SectionFour from '../Sections/ContentSections/SectionFour';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';
import { CONTENT_SECTION, DIV, SECTION } from '../../constants/elementTypes';
import { hasDuplicateElement, DROP_REJECTION_REASONS } from '../../utils/dndUtils';
import { useToast } from '../../context/ToastContext';

/**
 * DraggableContentSections — canvas wrapper for content sections.
 * Section creation is handled by LayoutCard → ContentList → buildSectionTree.
 * This component only handles on-canvas rendering and child-drop logic.
 */

// Generic renderer for section configs that don't have a dedicated component
const GenericSectionRenderer = ({
  uniqueId,
  handleSelect,
  handleOpenMediaPanel,
  sectionElement,
  elements,
  findElementById,
  setSelectedElement,
  setElements,
}) => {
  if (!sectionElement || !sectionElement.children) return null;

  const renderChildTree = (childId) => {
    const child = findElementById(childId, elements);
    if (!child) return null;

    if (child.children && child.children.length > 0) {
      return (
        <div
          key={childId}
          id={childId}
          style={child.styles || {}}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement({ id: child.id, type: child.type || DIV, styles: child.styles || {}, ...child });
          }}
        >
          {child.children.map(nestedId => renderChildTree(nestedId))}
        </div>
      );
    }

    return renderElement(
      child,
      elements,
      null,
      setSelectedElement,
      setElements,
      null,
      undefined,
      null,
      false,
      handleOpenMediaPanel
    );
  };

  const sectionStyles = sectionElement.styles || {};

  return (
    <div
      id={uniqueId}
      style={{
        ...sectionStyles,
        width: '100%',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(e);
      }}
    >
      {sectionElement.children.map(childId => renderChildTree(childId))}
    </div>
  );
};

const DraggableContentSections = ({
  id,
  configuration,
  handleOpenMediaPanel,
}) => {
  const {
    addNewElement,
    setElements,
    elements,
    findElementById,
    setSelectedElement,
    generateUniqueId
  } = useContext(EditableContext);
  const { showToast } = useToast();

  // Handle drop events within the content section
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentSection = findElementById(id, elements);
    if (!currentSection) return;

    if (item.type === CONTENT_SECTION) {
      showToast(DROP_REJECTION_REASONS.SELF_DROP, 'info');
      return;
    }

    const containerMap = {
      heading: 'content',
      paragraph: 'content',
      button: 'buttons',
      image: 'image'
    };

    const containerType = containerMap[item.type];
    if (!containerType) {
      showToast(DROP_REJECTION_REASONS.INVALID_TYPE, 'info');
      return;
    }

    const container = currentSection.children
      ?.map(childId => findElementById(childId, elements))
      ?.find(el => el?.part === containerType);

    if (!container) return;

    const existingElements = container.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    if (hasDuplicateElement(existingElements, item)) {
      showToast(DROP_REJECTION_REASONS.DUPLICATE, 'info');
      return;
    }

    const newId = generateUniqueId(item.type || 'element');

    const baseStyles = {
      heading: {
        color: '#1A1A1A',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        lineHeight: '1.2'
      },
      paragraph: {
        color: '#4A4A4A',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        marginBottom: '1.5rem'
      },
      image: {
        width: '100%',
        height: 'auto',
        borderRadius: '12px',
        objectFit: 'cover',
      }
    };

    const elementId = addNewElement(
      item.type,
      1,
      index,
      container.id,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: { ...(baseStyles[item.type] || {}), ...(item.styles || {}) },
        children: item.children || [],
        parentId: container.id,
        configuration: currentSection.configuration
      }
    );

    setElements(prevElements => {
      return prevElements.map(el => {
        if (el.id === container.id) {
          const updatedChildren = [...(el.children || [])];
          updatedChildren.splice(index, 0, elementId);
          return { ...el, children: updatedChildren };
        }
        return el;
      });
    });

    setSelectedElement({
      id: elementId,
      type: item.type,
      parentId: container.id,
      index: index
    });
  };

  const sectionElement = findElementById(id, elements);

  const SECTION_COMPONENTS = {
    sectionOne: SectionOne,
    sectionTwo: SectionTwo,
    sectionThree: SectionThree,
    sectionFour: SectionFour,
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    const element = findElementById(id, elements);
    setSelectedElement(element || { id, type: SECTION, styles: {} });
  };

  const sharedProps = {
    handleSelect,
    uniqueId: id,
    onDropItem,
    handleOpenMediaPanel,
  };

  const SectionComponent = SECTION_COMPONENTS[configuration];

  if (SectionComponent) {
    return <SectionComponent {...sharedProps} />;
  }

  // Generic section rendering for configs without a dedicated component
  return (
    <GenericSectionRenderer
      {...sharedProps}
      sectionElement={sectionElement}
      elements={elements}
      findElementById={findElementById}
      setSelectedElement={setSelectedElement}
      setElements={setElements}
    />
  );
};

export default DraggableContentSections;
