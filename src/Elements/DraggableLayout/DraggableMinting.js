import React, { forwardRef } from 'react';
import MintingSection from '../Sections/Web3Related/MintingSection';

/**
 * DraggableMinting — canvas wrapper for minting sections.
 * Section creation is handled by LayoutCard → ContentList → buildSectionTree.
 * This component only handles on-canvas rendering.
 */
const DraggableMinting = forwardRef(({
  id,
  handleOpenMediaPanel,
}, ref) => {
  const sectionId = id || `minting-section-${Date.now()}`;

  return (
    <MintingSection
      id={sectionId}
      handleOpenMediaPanel={handleOpenMediaPanel}
      ref={ref}
    />
  );
});

DraggableMinting.displayName = 'DraggableMinting';

export default DraggableMinting;
