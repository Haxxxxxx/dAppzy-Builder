import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';
import CTAOne from '../Sections/CTAs/CTAOne';
import CTATwo from '../Sections/CTAs/CTATwo';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { CTA, BUTTON, HEADING, PARAGRAPH } from '../../constants/elementTypes';
import { hasDuplicateElement, DROP_REJECTION_REASONS } from '../../utils/dndUtils';
import { useToast } from '../../context/ToastContext';

/**
 * DraggableCTA — canvas wrapper for CTA sections.
 * Section creation is handled by LayoutCard → ContentList → buildSectionTree.
 * This component only handles on-canvas rendering and child-drop logic.
 */
const DraggableCTA = ({
  id,
  configuration,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { addNewElement, elements, findElementById, setSelectedElement, generateUniqueId } = useContext(EditableContext);
  const { showToast } = useToast();

  // Handle drop events within the CTA section
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentSection = findElementById(id, elements);
    if (!currentSection) return;

    if (item.type === CTA) {
      showToast(DROP_REJECTION_REASONS.SELF_DROP, 'info');
      return;
    }

    const existingElements = currentSection.children
      ?.map(childId => findElementById(childId, elements))
      .filter(Boolean);

    if (item.type === BUTTON || item.type === HEADING || item.type === PARAGRAPH) {
      if (hasDuplicateElement(existingElements, item)) {
        showToast(DROP_REJECTION_REASONS.DUPLICATE, 'info');
        return;
      }
    }

    const newId = generateUniqueId(item.type || 'element');

    const baseStyles = {
      button: {
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#4338CA'
        }
      },
      heading: {
        color: '#1A1A1A',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        lineHeight: '1.2'
      },
      paragraph: {
        color: '#4A4A4A',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        marginBottom: '2rem'
      }
    };

    const elementId = addNewElement(
      item.type,
      1,
      index,
      id,
      {
        id: newId,
        type: item.type,
        content: item.content || '',
        styles: {
          ...baseStyles[item.type],
          ...item.styles
        },
        configuration: item.configuration || {},
        children: item.children || []
      }
    );

    setSelectedElement({
      id: elementId,
      type: item.type,
      parentId: id,
      index: index
    });
  };

  const ctaElement = findElementById(id, elements);
  const configChildren = structureConfigurations[configuration]?.children || [];
  const resolvedChildren = (ctaElement?.children || [])
    .map((childId) => findElementById(childId, elements))
    .filter(Boolean);
  const childrenToRender = resolvedChildren.length > 0 ? resolvedChildren : configChildren;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: CTA, styles: ctaElement?.styles });
  };

  const CTA_COMPONENTS = {
    ctaOne: CTAOne,
    ctaTwo: CTATwo,
    ctaThree: CTAOne,
  };

  const CTAComponent = CTA_COMPONENTS[configuration];
  if (!CTAComponent) return null;

  return (
    <CTAComponent
      uniqueId={id}
      contentListWidth={contentListWidth}
      children={childrenToRender}
      onDropItem={onDropItem}
      handlePanelToggle={handlePanelToggle}
      handleOpenMediaPanel={handleOpenMediaPanel}
      handleSelect={handleSelect}
    />
  );
};

export default DraggableCTA;
