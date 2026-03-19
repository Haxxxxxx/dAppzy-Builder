import React, { useContext, useMemo, forwardRef } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Section from '../../Structure/Section';
import { defaultMintingStyles } from './defaultMintingStyles';
import { Web3Configs } from '../../../configs/Web3/Web3Configs';

/**
 * MintingSection — renders a minting section on the canvas.
 * Delegates all child rendering, selection, and reordering to Section.js.
 * Structure is created by DraggableMinting on drop.
 */
const MintingSection = forwardRef(({
  id,
  handleOpenMediaPanel,
}, ref) => {
  const {
    elements,
    setElements,
    findElementById,
    generateUniqueId,
    addNewElement,
  } = useContext(EditableContext);

  const sectionId = id || `minting-section-${Date.now()}`;

  const mintingElement = useMemo(
    () => elements.find((el) => el.id === sectionId),
    [elements, sectionId]
  );

  const config = Web3Configs.mintingSection;

  // Handle dropping new modules — append to existing content container
  const handleMintingDrop = (item) => {
    if (item.type === 'mintingModule') {
      const contentContainerId = `${sectionId}-content`;
      const moduleType = item.moduleType || 'minting';

      const newModule = {
        id: generateUniqueId('mintingModule'),
        type: 'mintingModule',
        moduleType,
        content: item.content || config.children?.find(c => c.moduleType === moduleType)?.content || {},
        styles: item.styles || { ...defaultMintingStyles.mintingModule },
        settings: item.settings || {},
        parentId: contentContainerId,
        children: [],
      };

      setElements((prev) => [
        ...prev.map((el) => {
          if (el.id === contentContainerId) {
            return { ...el, children: [...(el.children || []), newModule.id] };
          }
          return el;
        }),
        newModule,
      ]);
    } else {
      addNewElement(item.type, item.level || 1, null, sectionId);
    }
  };

  // Merge styles: config defaults < stored styles
  const sectionStyles = useMemo(() => ({
    ...config.styles,
    ...(mintingElement?.styles || {}),
    position: 'relative',
    boxSizing: 'border-box',
  }), [config.styles, mintingElement?.styles]);

  return (
    <Section
      ref={ref}
      id={sectionId}
      onDropItem={handleMintingDrop}
      handleOpenMediaPanel={handleOpenMediaPanel}
      styles={sectionStyles}
    />
  );
});

MintingSection.displayName = 'MintingSection';

export default MintingSection;
