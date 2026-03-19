import React, { useState, useEffect, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import SectionPanel from '../SectionsPanels/SectionPanel';
import { SECTION_CATEGORIES } from '../../configs/sectionRegistry';
import DraggableElement from '../../Elements/DraggableElements/DraggableElement';
import '../css/Sidebar.css';
import TypographyElements from './ElementsMapping/TypographyElements';
import StructureElements from './ElementsMapping/StructureElements';
import BasicElements, {
  InteractiveElements,
  ContentElements,
  NavigationElements,
  UtilityElements,
} from './ElementsMapping/BasicElements';
import Web3Elements from './ElementsMapping/Web3Elements';
import FormElements from './ElementsMapping/FormElements';
import MediaElements from './ElementsMapping/MediaElements';
import { loadBlocks, deleteBlock } from '../../services/blockService';
import { authStorage } from '../../utils/storageManager';

// Draggable card for a saved block
const DraggableSavedBlock = ({ block, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'savedBlock',
    item: { type: 'savedBlock', blockElements: block.elements, label: block.name },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [block]);

  return (
    <div className="bento-extract-display">
      <div
        ref={drag}
        style={{
          cursor: 'grab',
          opacity: isDragging ? 0.5 : 1,
          padding: '8px',
          margin: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
        }}
      >
        <div style={{
          width: '67px',
          height: '67px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #838389',
          borderRadius: '4px',
          fontSize: '20px',
          color: '#838389',
        }}>
          <span className="material-symbols-outlined">widgets</span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
            title="Delete block"
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              lineHeight: 1,
              color: '#838389',
              fontSize: '14px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
          </button>
        )}
      </div>
      <strong className="element-name">{block.name}</strong>
    </div>
  );
};

const DEFAULT_EXPANDED = {
  'Saved Blocks': true,
  Navbar: true,
  Hero: true,
  CTA: true,
  Footer: true,
  'Content Sections': true,
  'Web3 Sections': true,
  Structure: true,
  Basic: true,
  Interactive: true,
  Content: true,
  Navigation: true,
  Utility: true,
  Typography: true,
  Media: true,
  'Form Elements': true,
  Web3: true,
};

const NewElementPanel = ({ viewMode, searchQuery }) => {
  const [expandedSections, setExpandedSections] = useState(DEFAULT_EXPANDED);
  const [savedBlocks, setSavedBlocks] = useState([]);
  const [blocksLoaded, setBlocksLoaded] = useState(false);

  const userId = authStorage.getUserAccount();

  // Load saved blocks from Firestore on mount
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    loadBlocks(userId).then((blocks) => {
      if (!cancelled) {
        setSavedBlocks(blocks);
        setBlocksLoaded(true);
      }
    }).catch((err) => {
      if (import.meta.env.DEV) console.error('[SavedBlocks] Failed to load:', err);
      if (!cancelled) setBlocksLoaded(true);
    });
    return () => { cancelled = true; };
  }, [userId]);

  const handleDeleteBlock = useCallback(async (blockId) => {
    if (!userId) return;
    if (!window.confirm('Delete this saved block?')) return;
    try {
      await deleteBlock(userId, blockId);
      setSavedBlocks((prev) => prev.filter((b) => b.id !== blockId));
    } catch (err) {
      if (import.meta.env.DEV) console.error('[SavedBlocks] Failed to delete:', err);
    }
  }, [userId]);

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const elements = {
    Structure: StructureElements,
    Basic: BasicElements,
    Interactive: InteractiveElements,
    Content: ContentElements,
    Navigation: NavigationElements,
    Utility: UtilityElements,
    Typography: TypographyElements,
    Media: MediaElements,
    'Form Elements': FormElements,
    Web3: Web3Elements,
  };

  const layoutSections = [
    { name: 'Navbar', component: <SectionPanel category={SECTION_CATEGORIES.NAVBAR} emptyText="No navbars found." searchQuery={searchQuery} /> },
    { name: 'Hero', component: <SectionPanel category={SECTION_CATEGORIES.HERO} emptyText="No heroes found." searchQuery={searchQuery} /> },
    { name: 'CTA', component: <SectionPanel category={SECTION_CATEGORIES.CTA} emptyText="No CTAs found." searchQuery={searchQuery} /> },
    { name: 'Content Sections', component: <SectionPanel category={SECTION_CATEGORIES.CONTENT} emptyText="No content sections found." searchQuery={searchQuery} /> },
    { name: 'Web3 Sections', component: <SectionPanel category={SECTION_CATEGORIES.WEB3} emptyText="No web3 sections found." searchQuery={searchQuery} /> },
    { name: 'Footer', component: <SectionPanel category={SECTION_CATEGORIES.FOOTER} emptyText="No footers found." searchQuery={searchQuery} /> },
  ];

  // Filter elements based on search query (matches label, description, and tags)
  const filteredElements = Object.entries(elements)
    .map(([category, items]) => {
      const q = searchQuery.toLowerCase();
      return {
        category,
        items: items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q)))
        ),
      };
    })
    .filter((section) => section.items.length > 0);

  // Filter saved blocks by search query
  const filteredBlocks = searchQuery
    ? savedBlocks.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : savedBlocks;

  // Saved Blocks section component
  const savedBlocksSection = blocksLoaded && filteredBlocks.length > 0 ? (
    <div className="content-section">
      <h4 onClick={() => toggleSection('Saved Blocks')} className="toggle-header">
        <span>Saved Blocks</span>
        <span>{expandedSections['Saved Blocks'] ? '\u25BC' : '\u25B6'}</span>
      </h4>
      {expandedSections['Saved Blocks'] && (
        <div className="bento-display-elements">
          {filteredBlocks.map((block) => (
            <DraggableSavedBlock
              key={block.id}
              block={block}
              onDelete={handleDeleteBlock}
            />
          ))}
        </div>
      )}
      <hr />
    </div>
  ) : null;

  if (viewMode === 'layout') {
    // Display layout menu
    return (
      <div>
        {savedBlocksSection}
        {layoutSections.map(({ name, component }) => (
          <div key={name} className="content-section">
            <h4 onClick={() => toggleSection(name)} style={{ cursor: 'pointer' }}>
              {name} <span>{expandedSections[name] ? '\u25BC' : '\u25B6'}</span>
            </h4>
            {expandedSections[name] && <div className="bento-display-layout">{component}</div>}
            <hr />
          </div>
        ))}
      </div>
    );
  }

  // Default: Display elements menu
  return (
    <div>
      {savedBlocksSection}
      {filteredElements.map(({ category, items }) => (
        <div key={category} className="content-section">
          <h4 onClick={() => toggleSection(category)} className="toggle-header">
            <span>{category}</span>
            <span>{expandedSections[category] ? '\u25BC' : '\u25B6'}</span>
          </h4>
          {expandedSections[category] && (
            <div className="bento-display-elements">
              {items.map((item) => (
                <DraggableElement
                  key={item.type}
                  type={item.type}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  configuration={item.configuration}
                  styles={item.styles}
                  content={item.content}
                  children={item.children}
                />
              ))}
            </div>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default NewElementPanel;
