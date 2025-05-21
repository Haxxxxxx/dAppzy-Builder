import React, { useContext, useMemo, useRef, useEffect, forwardRef, useState } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';
import { Image, Span, Button, MintingModule, Heading, Paragraph, Section, Div } from '../../SelectableElements';
import { mintingSectionStyles } from './DefaultWeb3Styles';
import { defaultMintingStyles } from './defaultMintingStyles';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { Web3Configs } from '../../../configs/Web3/Web3Configs';

/**
 * MintingSection component for rendering and managing minting functionality.
 * Supports drag and drop, quantity controls, and linked value updates.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the minting section
 * @param {Object} props.configuration - Configuration object for the minting section
 * @param {Function} props.onDropItem - Function to handle item drops
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 * @param {Object} props.structure - Structure object for the minting section
 */
const SectionWithRef = forwardRef((props, ref) => (
  <Section {...props} ref={ref} />
));

const MintingSection = forwardRef(({
  handleSelect,
  id,
  children,
  onDropItem,
  handleOpenMediaPanel,
}, ref) => {
  const mintingRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);
  const { walletAddress, balance, isConnected: contextConnected, isLoading, walletId } = useWalletContext();
  
  // Generate a unique ID if none is provided
  const sectionId = id || `minting-section-${Date.now()}`;
  
  // Get settings from the element's content
  const mintingElement = useMemo(
    () => elements.find((el) => el.id === sectionId),
    [elements, sectionId]
  );

  // Get configuration from Web3Configs
  const config = Web3Configs.mintingSection;
  
  const handleMintingDrop = (droppedItem, parentId = sectionId) => {
    if (droppedItem.type === 'mintingModule') {
      // Create content container first
      const contentContainerId = `${sectionId}-content`;
      const contentContainer = {
        id: contentContainerId,
        type: 'div',
        styles: {
          ...defaultMintingStyles.mintingContent,
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '20px'
        },
        children: [],
        parentId: sectionId,
      };

      // Add default content to container from configuration
      const defaultContent = config.children || [];
    
      // Create all content elements first
      const contentIds = defaultContent.map(child => {
        const newId = addNewElement(child.type, 1, null, contentContainerId);
        // Update the element with content and styles
        setElements(prev => prev.map(el => {
          if (el.id === newId) {
            return {
              ...el,
              content: child.content,
              styles: merge(
                child.styles || {},
                defaultMintingStyles[`minting${child.moduleType.charAt(0).toUpperCase() + child.moduleType.slice(1)}`] || {}
              ),
              settings: child.settings || {}
            };
          }
          return el;
        }));
        return newId;
      });

      // Add content container and update its children
      setElements(prev => {
        const newElements = [...prev, contentContainer];
        return newElements.map(el => {
          if (el.id === contentContainerId) {
            return {
              ...el,
              children: contentIds
            };
          }
          if (el.id === sectionId) {
            return {
              ...el,
              children: [contentContainerId],
              configuration: mintingElement.configuration
            };
          }
          return el;
        });
      });
    } else {
      // Simple drop handler that just adds the element
      addNewElement(droppedItem.type, droppedItem.level || 1, null, parentId);
    }
  };

  const { isOverCurrent, drop } = useElementDrop({
    id: sectionId,
    elementRef: mintingRef,
    onDropItem: (item) => handleMintingDrop(item, sectionId),
  });

  const handleInnerDivClick = (e, divId) => {
    e.stopPropagation();
    const element = findElementById(divId, elements);
    setSelectedElement(element || { id: divId, type: 'div', styles: {} });
  };

  const {
    activeDrop,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    draggedId,
  } = useReorderDrop(findElementById, elements, setElements);

  const renderContainerChildren = (containerId) => {
    const container = findElementById(containerId, elements);
    if (!container || !container.children) return null;

    return container.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;

      return (
        <div key={childId} style={{ position: 'relative' }}>
          {renderElement(
            child,
            elements,
            null,
            setSelectedElement,
            setElements,
            null,
            undefined,
            handleOpenMediaPanel
          )}
        </div>
      );
    });
  };

  // Get the content container element
  const contentContainer = findElementById(`${sectionId}-content`, elements);

  // Merge styles for container
  const contentContainerStyles = merge(
    {},
    defaultMintingStyles.mintingContent,
    {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      padding: '20px'
    },
    contentContainer?.styles || {}
  );

  // Merge styles for Minting section
  const mergedMintingStyles = merge(
    {},
    config.styles,
    mintingElement?.styles || {}
  );

  return (
    <SectionWithRef
      id={sectionId}
      style={{
        ...mergedMintingStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e);
      }}
      ref={(node) => {
        mintingRef.current = node;
        drop(node);
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
    >
      <Div
        id={`${sectionId}-content`}
        parentId={`${sectionId}-content`}
        styles={contentContainerStyles}
            handleOpenMediaPanel={handleOpenMediaPanel}
        onDropItem={(item) => handleMintingDrop(item, `${sectionId}-content`)}
        onClick={(e) => handleInnerDivClick(e, `${sectionId}-content`)}
      >
        {renderContainerChildren(`${sectionId}-content`)}
      </Div>
    </SectionWithRef>
  );
});

export default MintingSection;
