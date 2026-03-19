import React, { useContext, useMemo } from 'react';
import { EditableContext } from '../../context/EditableContext';
import SimpleFooter from '../Sections/Footers/SimpleFooter';
import DetailedFooter from '../Sections/Footers/DetailedFooter';
import TemplateFooter from '../Sections/Footers/TemplateFooter';
import DeFiFooter from '../Sections/Footers/DeFiFooter';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { FOOTER, HEADING, PARAGRAPH, BUTTON } from '../../constants/elementTypes';
import { hasDuplicateElement, DROP_REJECTION_REASONS } from '../../utils/dndUtils';
import { useToast } from '../../context/ToastContext';

/**
 * DraggableFooter — canvas wrapper for footer sections.
 * Section creation is handled by LayoutCard → ContentList → buildSectionTree.
 * This component only handles on-canvas rendering and child-drop logic.
 */
const DraggableFooter = ({
  id,
  configuration,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { addNewElement, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const { showToast } = useToast();

  // Handle drop events within the footer section
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentSection = findElementById(id, elements);
    if (!currentSection) return;

    if (item.type === FOOTER) {
      showToast(DROP_REJECTION_REASONS.SELF_DROP, 'info');
      return;
    }

    if (item.type === HEADING || item.type === PARAGRAPH || item.type === BUTTON) {
      const existingChildren = currentSection.children
        ?.map(childId => findElementById(childId, elements))
        .filter(Boolean);
      if (hasDuplicateElement(existingChildren, item)) {
        showToast(DROP_REJECTION_REASONS.DUPLICATE, 'info');
        return;
      }
    }

    const elementId = addNewElement(
      item.type,
      1,
      index,
      id,
      {
        type: item.type,
        content: item.content || '',
        styles: item.styles || {},
        configuration: item.configuration || {}
      }
    );

    requestAnimationFrame(() => {
      setSelectedElement({
        id: elementId,
        type: item.type,
        parentId: id,
        index: index
      });
    });
  };

  const footerElement = useMemo(() => findElementById(id, elements), [id, elements, findElementById]);

  const configChildren = useMemo(() =>
    structureConfigurations[configuration]?.children || [],
    [configuration]
  );

  const resolvedChildren = useMemo(() => {
    if (!footerElement?.children?.length) return [];
    return footerElement.children
      .map(childId => findElementById(childId, elements))
      .filter(Boolean);
  }, [footerElement?.children, elements, findElementById]);

  const childrenToRender = useMemo(() =>
    resolvedChildren.length > 0 ? resolvedChildren : configChildren,
    [resolvedChildren, configChildren]
  );

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: FOOTER, styles: footerElement?.styles });
  };

  const FOOTER_COMPONENTS = {
    simpleFooter: SimpleFooter,
    detailedFooter: DetailedFooter,
    advancedFooter: TemplateFooter,
    defiFooter: DeFiFooter,
  };

  const FooterComponent = FOOTER_COMPONENTS[configuration];
  if (!FooterComponent) return null;

  return (
    <FooterComponent
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

export default DraggableFooter;
