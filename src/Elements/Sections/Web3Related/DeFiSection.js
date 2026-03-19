import React, { useContext, useMemo, forwardRef, useCallback } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Section from '../../Structure/Section';
import { defaultDeFiStyles } from './defaultDeFiStyles';
import { DEFI_MODULE } from '../../../constants/elementTypes';

const DeFiSection = forwardRef(({
  id,
  handlePanelToggle,
  handleOpenMediaPanel,
}, ref) => {
  const {
    elements,
    findElementById,
    setElements,
    generateUniqueId,
  } = useContext(EditableContext);

  const defiElement = useMemo(() => findElementById(id, elements), [id, elements, findElementById]);

  // Handle dropping new modules into the DeFi section
  const handleDeFiDrop = useCallback((item) => {
    if (item.type === DEFI_MODULE) {
      const contentContainerId = `${id}-content`;
      const moduleId = generateUniqueId(DEFI_MODULE);
      const newModule = {
        id: moduleId,
        type: DEFI_MODULE,
        moduleType: item.moduleType || 'aggregator',
        content: {
          title: item.content?.title || 'New DeFi Module',
          description: item.content?.description || 'Module description',
          stats: item.content?.stats || [],
          settings: { showStats: true, showButton: true, customColor: '#2A2A3C' },
        },
        styles: { ...defaultDeFiStyles.defiModule },
        settings: item.settings || {},
        parentId: contentContainerId,
        children: [],
      };

      setElements(prev => [
        ...prev.map(el => {
          if (el.id === contentContainerId) {
            return { ...el, children: [...(el.children || []), moduleId] };
          }
          return el;
        }),
        newModule,
      ]);
    }
  }, [id, generateUniqueId, setElements]);

  // Merge section styles: defaults < stored < required layout props
  const sectionStyles = useMemo(() => ({
    ...defaultDeFiStyles.defiSection,
    ...(defiElement?.styles || {}),
    position: 'relative',
    boxSizing: 'border-box',
  }), [defiElement?.styles]);

  return (
    <Section
      ref={ref}
      id={id}
      onDropItem={handleDeFiDrop}
      handlePanelToggle={handlePanelToggle}
      handleOpenMediaPanel={handleOpenMediaPanel}
      styles={sectionStyles}
    />
  );
});

DeFiSection.displayName = 'DeFiSection';

export default DeFiSection;
