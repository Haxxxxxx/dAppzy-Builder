import React, { useContext, Suspense } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { projectStorage } from '../../utils/storageManager';
import { Modal } from 'antd';
import editorRegistry from '../../Editors/editorRegistry';
import settingsRegistry from './SettingsPanels/settingsRegistry';
import '../css/EditorPanel.css';
import CollapsibleSection from './SettingsPanels/LinkSettings/CollapsibleSection';
import ErrorBoundary from '../ErrorBoundary';

const EditorPanel = ({ pageSettings, viewMode, setViewMode, searchQuery }) => {
  const { selectedElement, setSelectedElement, setElements, elements, styleEditingMode, setStyleEditingMode, activeBreakpoint } = useContext(EditableContext);

  const getAncestorPath = (element) => {
    if (!element) return [];
    const path = [];
    let current = elements.find((el) => el.id === element.parentId);
    while (current && path.length < 4) {
      path.unshift(current);
      current = elements.find((el) => el.id === current.parentId);
    }
    return path;
  };

  const getRelevantEditors = (element) => {
    if (!element) return [];

    const { TypographyEditor, DisplayEditor, BackgroundEditor, BorderEditor, SizeEditor,
      SpacingEditor, ShadowEditor, OpacityEditor, FilterEditor, TransformEditor,
      TransitionEditor, PositionEditor } = editorRegistry;

    const editors = [];

    // Common editors for all elements
    editors.push({
      title: "Typography",
      component: <Suspense fallback={null}><TypographyEditor /></Suspense>
    });

    // Container elements (div, section, etc.)
    const containerElements = ['div', 'section', 'navbar', 'footer', 'header', 'main',
      'article', 'aside', 'form', 'ul', 'ol', 'defiSection', 'defiNavbar', 'defiFooter'];

    if (containerElements.includes(element.type)) {
      editors.push(
        {
          title: "Display & Layout",
          component: <Suspense fallback={null}><DisplayEditor /></Suspense>
        },
        {
          title: "Background & Global Settings",
          component: <Suspense fallback={null}><BackgroundEditor pageSettings={pageSettings} /></Suspense>
        },
        {
          title: "Borders",
          component: <Suspense fallback={null}><BorderEditor /></Suspense>
        },
        {
          title: "Size",
          component: <Suspense fallback={null}><SizeEditor /></Suspense>
        },
        {
          title: "Spacing",
          component: <Suspense fallback={null}><SpacingEditor /></Suspense>
        }
      );
    }

    // Text elements
    const textElements = ['title', 'paragraph', 'blockquote', 'code', 'pre', 'caption', 'span', 'p'];
    if (textElements.includes(element.type)) {
      editors.push(
        {
          title: "Background & Global Settings",
          component: <Suspense fallback={null}><BackgroundEditor pageSettings={pageSettings} /></Suspense>
        }
      );
    }

    // Media elements
    const mediaElements = ['image', 'video'];
    if (mediaElements.includes(element.type)) {
      editors.push(
        {
          title: "Size",
          component: <Suspense fallback={null}><SizeEditor /></Suspense>
        }
      );
    }

    // Common editors for all elements
    editors.push(
      {
        title: "Shadow",
        component: <Suspense fallback={null}><ShadowEditor /></Suspense>
      },
      {
        title: "Opacity",
        component: <Suspense fallback={null}><OpacityEditor /></Suspense>
      },
      {
        title: "Filters",
        component: <Suspense fallback={null}><FilterEditor /></Suspense>
      },
      {
        title: "Transform",
        component: <Suspense fallback={null}><TransformEditor /></Suspense>
      },
      {
        title: "Transition",
        component: <Suspense fallback={null}><TransitionEditor /></Suspense>
      },
      {
        title: "Position",
        component: <Suspense fallback={null}><PositionEditor /></Suspense>
      }
    );

    return editors;
  };

  const isTextualElement = (element) => {
    if (!element || !element.type) return false;

    const textualElements = [
      // Basic text elements
      'title', 'description', 'paragraph', 'p', 'blockquote',
      'code', 'pre', 'caption', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Link elements
      'a', 'link', 'linkblock', 'anchor',
      // Other text containers
      'label', 'legend', 'figcaption', 'cite', 'q', 'em', 'strong', 'mark',
      'small', 'sub', 'sup', 'time', 'abbr', 'dfn', 'kbd', 'samp', 'var'
    ];

    return textualElements.includes(element.type);
  };

  const renderSettingsView = () => {
    if (!selectedElement) return <p>Select an element to edit its settings.</p>;

    // Check if the element has content that can be edited
    const hasEditableContent = selectedElement.content !== undefined;
    const hasDisplaySettings = selectedElement.type === 'defiNavbar' || 
                             selectedElement.type === 'defiFooter' || 
                             selectedElement.type === 'video' || 
                             selectedElement.type === 'mintingSection' || 
                             selectedElement.type === 'defiSection' ||
                             selectedElement.type === 'defiModule';

    const { DeFiSectionSettings, DeFiModuleSettings, LinkSettings, TextualSettings,
      WalletSettings, VideoSettings, YoutubeSettings, IconSettings, CandyMachineSettings,
      ListSettings, FormSettings, TableSettings } = settingsRegistry;

    // Handle DeFi elements first
    if (selectedElement.type === 'defiSection') {
      return <Suspense fallback={null}><DeFiSectionSettings /></Suspense>;
    }
    if (selectedElement.type === 'defiModule') {
      return <Suspense fallback={null}><DeFiModuleSettings /></Suspense>;
    }

    // Handle link elements (including buttons)
    if (selectedElement.type === 'a' || selectedElement.type === 'link' ||
        selectedElement.type === 'linkblock' || selectedElement.type === 'anchor' ||
        selectedElement.type === 'button') {
      return <Suspense fallback={null}><LinkSettings settings={selectedElement.settings || {}} /></Suspense>;
    }

    // Handle text elements
    if (isTextualElement(selectedElement)) {
      return <Suspense fallback={null}><TextualSettings settings={selectedElement.settings || {}} /></Suspense>;
    }

    switch (selectedElement.type) {
      case 'connectWalletButton':
        return <Suspense fallback={null}><WalletSettings settings={selectedElement.settings || {}} /></Suspense>;
      case 'video':
        return <Suspense fallback={null}><VideoSettings settings={selectedElement.settings || {}} /></Suspense>;
      case 'youtubeVideo':
        return <Suspense fallback={null}><YoutubeSettings settings={selectedElement.settings || {}} /></Suspense>;
      case 'icon':
        return <Suspense fallback={null}><IconSettings /></Suspense>;
      case 'mintingSection':
        return <Suspense fallback={null}><CandyMachineSettings settings={selectedElement.settings || {}} /></Suspense>;
      case 'defiNavbar':
      case 'defiFooter':
        return (
          <>
            <Suspense fallback={null}><editorRegistry.BackgroundEditor pageSettings={pageSettings} /></Suspense>
            <Suspense fallback={null}><editorRegistry.BorderEditor /></Suspense>
            <Suspense fallback={null}><editorRegistry.SizeEditor /></Suspense>
            <Suspense fallback={null}><editorRegistry.TypographyEditor /></Suspense>
          </>
        );
      case 'list':
      case 'list-item':
        return <Suspense fallback={null}><ListSettings settings={selectedElement.settings || {}} /></Suspense>;
      case 'form':
        return <Suspense fallback={null}><FormSettings settings={selectedElement.settings || {}} /></Suspense>;
      case 'table':
      case 'table-row':
      case 'table-cell':
        return <Suspense fallback={null}><TableSettings /></Suspense>;
      default:
        return (
          <div className="no-settings-message">
            {hasEditableContent && !hasDisplaySettings ? (
              <>
                <p>This element can be edited directly.</p>
                <button 
                  className="edit-content-button"
                  onClick={() => {
                    setViewMode('content');
                  }}
                >
                  <span className="button-icon">✏️</span>
                  Edit Content
                </button>
              </>
            ) : (
              <>
                <p>No specific settings available for this element.</p>
                <p>Check back later for more customization options!</p>
              </>
            )}
          </div>
        );
    }
  };

  const renderContent = () => {
    if (!selectedElement) {
      return <p>Select an element to edit.</p>;
    }

    switch (viewMode) {
      case 'style':
        return (
          <div className="style-editor">
            <div className="style-state-toggle">
              {['normal', 'hover', 'focus'].map((mode) => (
                <button
                  key={mode}
                  className={`state-toggle-btn ${styleEditingMode === mode ? 'active' : ''}`}
                  onClick={() => setStyleEditingMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {styleEditingMode !== 'normal' && (
              <div className="state-editing-notice">
                Editing <strong>:{styleEditingMode}</strong> state styles
              </div>
            )}
            {activeBreakpoint !== 'desktop' && (
              <div className="state-editing-notice">
                Editing <strong>{activeBreakpoint}</strong> breakpoint styles
              </div>
            )}
            {getRelevantEditors(selectedElement).map((editor, index) => (
              <CollapsibleSection key={index} title={editor.title}>
                {editor.component}
              </CollapsibleSection>
            ))}
          </div>
        );
      case 'settings':
        return (
          <div className="settings-view">
            <ErrorBoundary name={`${selectedElement.type} settings`}>
              {renderSettingsView()}
            </ErrorBoundary>
          </div>
        );
      case 'content':
      case 'display':
        return (
          <div className="content-view">
            <ErrorBoundary name={`${selectedElement.type} settings`}>
              {renderSettingsView()}
            </ErrorBoundary>
          </div>
        );
      default:
        return null;
    }
  };

  const ancestorPath = getAncestorPath(selectedElement);

  const moveSelectedElement = (direction) => {
    if (!selectedElement) return;
    setElements((prev) => {
      const el = prev.find(e => e.id === selectedElement.id);
      if (!el?.parentId) return prev;
      const parent = prev.find(e => e.id === el.parentId);
      if (!parent?.children) return prev;
      const idx = parent.children.indexOf(selectedElement.id);
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= parent.children.length) return prev;
      const newChildren = [...parent.children];
      [newChildren[idx], newChildren[newIdx]] = [newChildren[newIdx], newChildren[idx]];
      return prev.map(e => e.id === parent.id ? { ...e, children: newChildren } : e);
    });
  };

  const getSiblingInfo = () => {
    if (!selectedElement) return { isFirst: true, isLast: true, hasParent: false };
    const el = elements.find(e => e.id === selectedElement.id);
    if (!el?.parentId) return { isFirst: true, isLast: true, hasParent: false };
    const parent = elements.find(e => e.id === el.parentId);
    if (!parent?.children) return { isFirst: true, isLast: true, hasParent: false };
    const idx = parent.children.indexOf(selectedElement.id);
    return { isFirst: idx === 0, isLast: idx === parent.children.length - 1, hasParent: true };
  };

  const { isFirst, isLast, hasParent } = getSiblingInfo();

  return (
    <div className="editor-panel">
      {selectedElement && ancestorPath.length > 0 && (
        <div className="editor-breadcrumb">
          {ancestorPath.map((ancestor, i) => (
            <span key={ancestor.id}>
              <button
                className="breadcrumb-link"
                onClick={() => setSelectedElement({ id: ancestor.id, type: ancestor.type })}
              >
                {ancestor.label || ancestor.type}
              </button>
              <span className="breadcrumb-sep">/</span>
            </span>
          ))}
          <span className="breadcrumb-current">{selectedElement.label || selectedElement.type}</span>
        </div>
      )}
      {selectedElement && hasParent && (
        <div className="editor-reorder-bar">
          <button
            className="editor-reorder-btn"
            disabled={isFirst}
            onClick={() => moveSelectedElement(-1)}
            title="Move element up"
          >
            <span className="material-symbols-outlined">arrow_upward</span>
            Move Up
          </button>
          <button
            className="editor-reorder-btn"
            disabled={isLast}
            onClick={() => moveSelectedElement(1)}
            title="Move element down"
          >
            <span className="material-symbols-outlined">arrow_downward</span>
            Move Down
          </button>
        </div>
      )}
      {renderContent()}
      <CollapsibleSection title="Keyboard Shortcuts">
        <div className="shortcut-hints">
          {[
            ['\u2318/Ctrl + Z', 'Undo'],
            ['\u2318/Ctrl + Shift + Z', 'Redo'],
            ['\u2318/Ctrl + C', 'Copy'],
            ['\u2318/Ctrl + V', 'Paste'],
            ['\u2318/Ctrl + D', 'Duplicate'],
            ['\u2318/Ctrl + S', 'Save'],
            ['Delete', 'Remove element'],
            ['Esc', 'Deselect'],
            ['\u2190\u2191\u2192\u2193', 'Nudge 1px'],
            ['Shift + \u2190\u2191\u2192\u2193', 'Nudge 10px'],
          ].map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '12px' }}>
              <kbd style={{ background: 'var(--bg-tertiary, #f0f0f0)', padding: '1px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '11px' }}>{key}</kbd>
              <span style={{ color: 'var(--text-secondary, #666)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
      {elements.length > 0 && (
        <button
          onClick={() => {
            Modal.confirm({
              title: 'Clear All Elements',
              content: 'Are you sure you want to clear all elements? This cannot be undone.',
              okText: 'Clear All',
              okType: 'danger',
              cancelText: 'Cancel',
              onOk: () => {
                projectStorage.removeElements();
                // Clear chunked storage keys
                const chunkKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('editableElements_chunk_')) {
                    chunkKeys.push(key);
                  }
                }
                chunkKeys.forEach(key => projectStorage.removeChunk(key));
                projectStorage.removeChunk('editableElements_chunks');
                setElements([]);
              },
            });
          }}
          style={{
            marginTop: '16px',
            padding: '8px',
            cursor: 'pointer',
            background: '#d9534f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Clear All Elements
        </button>
      )}
    </div>
  );
};

export default EditorPanel;
