import React, { useContext, useMemo, useRef, useEffect, forwardRef } from 'react';
import merge from 'lodash/merge';
import { EditableContext } from '../../../context/EditableContext';
import useElementDrop from '../../../utils/useElementDrop';
import { 
  Div, 
  Heading, 
  Paragraph, 
  Button, 
  Span,
  LinkBlock,
  Icon
} from '../../SelectableElements';
import HFlexLayout from '../../Structure/HFlex';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { DetailedFooterStyles } from './defaultFooterStyles';

const FooterWithRef = forwardRef((props, ref) => (
  <footer {...props} ref={ref} />
));

const getStyleFromKey = (styles, key) => {
  if (!key) return {};
  if (typeof key === 'string') return styles[key] || {};
  if (typeof key === 'object' && key.key) return styles[key.key] || {};
  return {};
};

const DetailedFooter = forwardRef(({ handleSelect, uniqueId, handleOpenMediaPanel }, ref) => {
  const footerRef = useRef(null);
  const defaultInjectedRef = useRef(false);
  const {
    elements,
    setElements,
    setSelectedElement,
    findElementById,
    updateStyles,
    addNewElement,
  } = useContext(EditableContext);

  const footerElement = useMemo(
    () => elements.find((el) => el.id === uniqueId),
    [elements, uniqueId]
  );

  // Get config and styles from structureConfigurations
  const config = useMemo(() => structureConfigurations.detailedFooter || {}, []);
  const configStyles = useMemo(() => config.styles || {}, [config]);
  const childrenConfig = config.children || [];

  useEffect(() => {
    if (!footerElement || defaultInjectedRef.current) return;

    updateStyles(footerElement.id, merge({}, DetailedFooterStyles.footerSection, configStyles));

    // Batch creation: collect all new elements and relationships in memory
    const newElements = [];
    const relationships = [];

    // Recursive function to create elements and their children in memory
    const createElementTree = (configNode, parentId) => {
      const newId = addNewElement(configNode.type, 1, null, parentId, { skipState: true });
      let baseStyle = {};
      switch (configNode.type) {
        case 'heading':
          baseStyle = DetailedFooterStyles.footerTitle || {};
          break;
        case 'paragraph':
          baseStyle = DetailedFooterStyles.footerText || {};
          break;
        case 'span':
          baseStyle = DetailedFooterStyles.footerText || {};
          break;
        case 'button':
          baseStyle = DetailedFooterStyles.footerButton || {};
          break;
        case 'icon':
          baseStyle = { width: '40px', height: '40px' };
          break;
        case 'linkblock':
          baseStyle = { 
            fontSize: '1rem', 
            color: '#1a1a1a', 
            textDecoration: 'none' 
          };
          break;
        default:
          baseStyle = {};
      }
      newElements.push({
        id: newId,
        type: configNode.type,
        content: configNode.content,
        styles: merge({}, baseStyle, configNode.styles || {}),
        src: configNode.src,
        href: configNode.href,
        parentId,
        children: []
      });
      // Recursively create children if present
      if (configNode.children && configNode.children.length > 0) {
        const childIds = configNode.children.map(child => createElementTree(child, newId));
        relationships.push({ id: newId, children: childIds });
      }
      return newId;
    };

    // Start recursion for all top-level children
    const topLevelIds = childrenConfig.map(child => createElementTree(child, uniqueId));
    relationships.push({ id: uniqueId, children: topLevelIds });

    // Batch update all new elements and relationships in a single setElements call
    setElements(prev => {
      // Remove any elements with ids matching newElements (to avoid duplicates)
      const newIds = newElements.map(el => el.id);
      let filtered = prev.filter(el => !newIds.includes(el.id));
      // Add all new elements
      filtered = [...filtered, ...newElements];
      // Apply children relationships
      relationships.forEach(rel => {
        filtered = filtered.map(el => el.id === rel.id ? { ...el, children: rel.children } : el);
      });
      return filtered;
    });
    defaultInjectedRef.current = true;
  }, [footerElement, uniqueId, elements, findElementById, setElements, addNewElement, updateStyles, config, configStyles]);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: footerRef,
    onDropItem: (item) => addNewElement(item.type, item.level || 1, null, uniqueId),
  });

  // Helper to render children recursively
  const renderFooterChildren = (footerId) => {
    const footer = findElementById(footerId, elements);
    if (!footer || !footer.children) return null;
    return footer.children.map((childId) => {
      const child = findElementById(childId, elements);
      if (!child) return null;
      switch (child.type) {
        case 'hflex':
          return <HFlexLayout key={child.id} id={child.id} />;
        case 'icon':
          return <Icon key={child.id} id={child.id} styles={child.styles} />;
        case 'linkblock':
          return <LinkBlock key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'div':
          return (
            <Div key={child.id} id={child.id} styles={child.styles}>
              {renderFooterChildren(child.id)}
            </Div>
          );
        case 'heading':
          return <Heading key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'paragraph':
          return <Paragraph key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'span':
          return <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        case 'button':
          return <Button key={child.id} id={child.id} content={child.content} styles={child.styles} />;
        default:
          return null;
      }
    });
  };

  // Merge styles for footer
  const mergedFooterStyles = merge({}, DetailedFooterStyles.footerSection, configStyles, footerElement?.styles || {});

  return (
    <FooterWithRef
      id={uniqueId}
      style={{
        ...mergedFooterStyles,
        ...(isOverCurrent ? { outline: '2px dashed #4D70FF' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect?.(e, uniqueId);
      }}
      ref={(node) => {
        footerRef.current = node;
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
      {renderFooterChildren(uniqueId)}
    </FooterWithRef>
  );
});

export default DetailedFooter;
