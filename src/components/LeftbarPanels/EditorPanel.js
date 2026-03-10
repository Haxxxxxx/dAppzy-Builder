import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';
import TypographyEditor from '../../Editors/TypographyEditor';
import BorderEditor from '../../Editors/BorderEditor';
import SizeEditor from '../../Editors/SizeEditor';
import SpacingEditor from '../../Editors/SpacingEditor';
import DisplayEditor from '../../Editors/DisplayEditor';
import ShadowEditor from '../../Editors/ShadowEditor';
import OpacityEditor from '../../Editors/OpacityEditor';
import TransformEditor from '../../Editors/TransformEditor';
import PositionEditor from '../../Editors/PositionEditor';
import CandyMachineSettings from '../LeftbarPanels/SettingsPanels/CandyMachineSettings';
import WalletSettings from './SettingsPanels/WalletSettings';
import LinkSettings from './SettingsPanels/LinkSettings';
import FilterEditor from '../../Editors/FilterEditor';
import TransitionEditor from '../../Editors/TransitionEditor';
import BackgroundEditor from '../../Editors/BackgroundEditor';
import TextualSettings from './SettingsPanels/TextualSettings';
import ListSettings from './SettingsPanels/ListSettings';
import ImageSettings from './SettingsPanels/ImageSettings';
import VideoSettings from './SettingsPanels/VideoSettings';
import YoutubeSettings from './SettingsPanels/YoutubeSettings';
import DeFiSectionSettings from './SettingsPanels/DeFiSectionSettings';
import '../css/EditorPanel.css';
import CollapsibleSection from './SettingsPanels/LinkSettings/CollapsibleSection';
import BackgroundSettings from './SettingsPanels/BackgroundSettings';
import FormSettings from './SettingsPanels/FormSettings';
import DeFiModuleSettings from './SettingsPanels/DeFiModuleSettings';
import TableSettings from './SettingsPanels/TableSettings';
import IconSettings from './SettingsPanels/IconSettings';
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

    const editors = [];

    // Common editors for all elements
    editors.push({
      title: "Typography",
      component: <TypographyEditor />
    });

    // Container elements (div, section, etc.)
    const containerElements = ['div', 'section', 'navbar', 'footer', 'header', 'main',
      'article', 'aside', 'form', 'ul', 'ol', 'defiSection', 'defiNavbar', 'defiFooter'];

    if (containerElements.includes(element.type)) {
      editors.push(
        {
          title: "Display & Layout",
          component: <DisplayEditor />
        },
        {
          title: "Background & Global Settings",
          component: <BackgroundEditor pageSettings={pageSettings} />
        },
        {
          title: "Borders",
          component: <BorderEditor />
        },
        {
          title: "Size",
          component: <SizeEditor />
        },
        {
          title: "Spacing",
          component: <SpacingEditor />
        }
      );
    }

    // Text elements
    const textElements = ['title', 'paragraph', 'blockquote', 'code', 'pre', 'caption', 'span', 'p'];
    if (textElements.includes(element.type)) {
      editors.push(
        {
          title: "Background & Global Settings",
          component: <BackgroundEditor pageSettings={pageSettings} />
        }
      );
    }

    // Media elements
    const mediaElements = ['image', 'video'];
    if (mediaElements.includes(element.type)) {
      editors.push(
        {
          title: "Size",
          component: <SizeEditor />
        }
      );
    }

    // Common editors for all elements
    editors.push(
      {
        title: "Shadow",
        component: <ShadowEditor />
      },
      {
        title: "Opacity",
        component: <OpacityEditor />
      },
      {
        title: "Filters",
        component: <FilterEditor />
      },
      {
        title: "Transform",
        component: <TransformEditor />
      },
      {
        title: "Transition",
        component: <TransitionEditor />
      },
      {
        title: "Position",
        component: <PositionEditor />
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

    // Handle DeFi elements first
    if (selectedElement.type === 'defiSection') {
      return <DeFiSectionSettings />;
    }
    if (selectedElement.type === 'defiModule') {
      return <DeFiModuleSettings />;
    }

    // Handle link elements (including buttons)
    if (selectedElement.type === 'a' || selectedElement.type === 'link' || 
        selectedElement.type === 'linkblock' || selectedElement.type === 'anchor' ||
        selectedElement.type === 'button') {
      return <LinkSettings settings={selectedElement.settings || {}} />;
    }

    // Handle text elements
    if (isTextualElement(selectedElement)) {
      return <TextualSettings settings={selectedElement.settings || {}} />;
    }

    switch (selectedElement.type) {
      case 'connectWalletButton':
        return <WalletSettings settings={selectedElement.settings || {}} />;
      case 'video':
        return <VideoSettings settings={selectedElement.settings || {}} />;
      case 'youtubeVideo':
        return <YoutubeSettings settings={selectedElement.settings || {}} />;
      case 'icon':
        return <IconSettings />;
      case 'mintingSection':
        return <CandyMachineSettings settings={selectedElement.settings || {}} />;
      case 'defiNavbar':
      case 'defiFooter':
        return (
          <>
            <BackgroundEditor pageSettings={pageSettings} />
            <BorderEditor />
            <SizeEditor />
            <TypographyEditor />
          </>
        );
      case 'list':
      case 'list-item':
        return <ListSettings settings={selectedElement.settings || {}} />;
      case 'form':
        return <FormSettings settings={selectedElement.settings || {}} />;
      case 'table':
      case 'table-row':
      case 'table-cell':
        return <TableSettings />;
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
            if (!window.confirm('Are you sure you want to clear all elements? This cannot be undone.')) return;
            localStorage.removeItem('editableElements');
            // Clear chunked storage keys
            const chunkKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('editableElements_chunk_')) {
                chunkKeys.push(key);
              }
            }
            chunkKeys.forEach(key => localStorage.removeItem(key));
            localStorage.removeItem('editableElements_chunks');
            setElements([]);
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
