import React, { useContext, useMemo } from 'react';
import { EditableContext } from '../../context/EditableContext';
import HeroOne from '../Sections/Heros/HeroOne';
import HeroTwo from '../Sections/Heros/HeroTwo';
import HeroThree from '../Sections/Heros/HeroThree';
import { structureConfigurations } from '../../configs/structureConfigurations.js';
import { HERO, HEADING, BUTTON, DIV } from '../../constants/elementTypes';
import { hasDuplicateElement, DROP_REJECTION_REASONS } from '../../utils/dndUtils';
import { useToast } from '../../context/ToastContext';
import { renderElement } from '../../utils/LeftBarUtils/RenderUtils';

// Generic renderer for hero configs that don't have a dedicated component
const GenericHeroRenderer = ({
  uniqueId,
  handleSelect,
  handleOpenMediaPanel,
  heroElement,
  elements,
  findElementById,
  setSelectedElement,
  setElements,
}) => {
  if (!heroElement || !heroElement.children) return null;

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

  const sectionStyles = heroElement.styles || {};

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
      {heroElement.children.map(childId => renderChildTree(childId))}
    </div>
  );
};

/**
 * DraggableHero — canvas wrapper for hero sections.
 * Section creation is handled by LayoutCard → ContentList → buildSectionTree.
 * This component only handles on-canvas rendering and child-drop logic.
 */
const DraggableHero = ({
  id,
  configuration,
  contentListWidth,
  handlePanelToggle,
  handleOpenMediaPanel,
}) => {
  const { addNewElement, setElements, elements, findElementById, setSelectedElement } = useContext(EditableContext);
  const { showToast } = useToast();

  // Handle drop events within the hero section
  const onDropItem = (item, index, dropInfo) => {
    if (!item || !dropInfo?.isWithinBounds) return;

    const currentSection = findElementById(id, elements);
    if (!currentSection) return;

    if (item.type === HERO) {
      showToast(DROP_REJECTION_REASONS.SELF_DROP, 'info');
      return;
    }

    if (item.type === HEADING || item.type === BUTTON) {
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

  const heroElement = useMemo(() => findElementById(id, elements), [id, elements, findElementById]);

  const configChildren = useMemo(() =>
    structureConfigurations[configuration]?.children || [],
    [configuration]
  );

  const resolvedChildren = useMemo(() => {
    if (!heroElement?.children?.length) return [];
    return heroElement.children
      .map(childId => findElementById(childId, elements))
      .filter(Boolean);
  }, [heroElement?.children, elements, findElementById]);

  const childrenToRender = useMemo(() =>
    resolvedChildren.length > 0 ? resolvedChildren : configChildren,
    [resolvedChildren, configChildren]
  );

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: HERO, styles: heroElement?.styles });
  };

  const HERO_COMPONENTS = {
    heroOne: HeroOne,
    heroTwo: HeroTwo,
    heroThree: HeroThree,
  };

  const HeroComponent = HERO_COMPONENTS[configuration];

  if (HeroComponent) {
    return (
      <HeroComponent
        uniqueId={id}
        contentListWidth={contentListWidth}
        children={childrenToRender}
        onDropItem={onDropItem}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        handleSelect={handleSelect}
      />
    );
  }

  // Generic hero rendering for configs without a dedicated component (e.g. videoHero)
  return (
    <GenericHeroRenderer
      uniqueId={id}
      handleSelect={handleSelect}
      handleOpenMediaPanel={handleOpenMediaPanel}
      heroElement={heroElement}
      elements={elements}
      findElementById={findElementById}
      setSelectedElement={setSelectedElement}
      setElements={setElements}
    />
  );
};

export default DraggableHero;
