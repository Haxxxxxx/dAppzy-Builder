import React, { useContext, forwardRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import DeFiSection from '../Sections/Web3Related/DeFiSection';
import { DEFI_MODULE } from '../../constants/elementTypes';

/**
 * DraggableDeFi — canvas wrapper for DeFi sections.
 * Section creation is handled by LayoutCard → ContentList → buildSectionTree.
 * This component only handles on-canvas rendering and selection.
 */
const DraggableDeFi = forwardRef(({
  id,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}, ref) => {
  const { elements, findElementById, setSelectedElement } = useContext(EditableContext);

  const sectionId = id || `defi-section-${Date.now()}`;

  const handleSelect = (id, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setSelectedElement({ id, type: DEFI_MODULE, styles: findElementById(id, elements)?.styles });
  };

  return (
    <DeFiSection
      id={sectionId}
      contentListWidth={contentListWidth}
      handlePanelToggle={handlePanelToggle}
      handleOpenMediaPanel={handleOpenMediaPanel}
      handleSelect={handleSelect}
      ref={ref}
    />
  );
});

DraggableDeFi.displayName = 'DraggableDeFi';

export default DraggableDeFi;
