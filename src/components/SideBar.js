import React, { useState, useContext, Suspense } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/Sidebar.css';
import './css/SettingsPanel.css';
import CollapsibleSection from './LeftbarPanels/SettingsPanels/LinkSettings/CollapsibleSection';
import settingsRegistry from './LeftbarPanels/SettingsPanels/settingsRegistry';
import {
  LINK_TYPES, FORM_TYPES, LIST_TYPES,
  VIDEO_TYPES, TABLE_TYPES,
  isTextual, getMeta,
} from '../core/elementRegistry';

// Eagerly import editors shown on the default Content tab —
// React.lazy + Suspense can render with a stale context snapshot on first mount.
import DisplayEditor from '../Editors/DisplayEditor';
import SpacingEditor from '../Editors/SpacingEditor';

// Types that show content editing (not display/layout) on the first tab
const CONTENT_CATEGORIES = new Set([
  'textual', 'image', 'video', 'youtube', 'icon', 'form', 'list', 'table', 'defi', 'interactive',
]);

const NewElementPanel = React.lazy(() => import('./LeftbarPanels/NewElementPanel'));
const EditorPanel = React.lazy(() => import('./LeftbarPanels/EditorPanel'));

const SideBar = ({ pageSettings }) => {
  const [sidebarViewMode, setSidebarViewMode] = useState('elements');
  const [editorViewMode, setEditorViewMode] = useState('content');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedElement, updateElementProperties } = useContext(EditableContext);

  // Reset to Content/Display tab whenever the selected element changes
  const prevSelectedId = React.useRef(selectedElement?.id);
  React.useEffect(() => {
    if (selectedElement?.id !== prevSelectedId.current) {
      prevSelectedId.current = selectedElement?.id;
      setEditorViewMode('content');
    }
  }, [selectedElement?.id]);

  // ── Content / Display tab ───────────────────────────────────────
  // Shows content editing (text, image source, video URL) or
  // layout controls (display, spacing) for structural elements.
  const renderContentTab = () => {
    if (!selectedElement) return <p className="sidebar-empty-hint">Select an element to edit.</p>;

    const type = selectedElement.type;

    // Text elements — inline text editor
    if (isTextual(selectedElement)) {
      return (
        <Suspense fallback={null}>
          <settingsRegistry.TextualSettings />
        </Suspense>
      );
    }

    // Image
    if (type === 'image') {
      return <Suspense fallback={null}><settingsRegistry.ImageSettings /></Suspense>;
    }

    // Video
    if (VIDEO_TYPES.has(type)) {
      return <Suspense fallback={null}><settingsRegistry.VideoSettings /></Suspense>;
    }
    if (type === 'youtubeVideo') {
      return <Suspense fallback={null}><settingsRegistry.YoutubeSettings /></Suspense>;
    }

    // Icon
    if (type === 'icon') {
      return <Suspense fallback={null}><settingsRegistry.IconSettings /></Suspense>;
    }

    // DeFi module — no layout, just its config
    if (type === 'defiModule') {
      return <Suspense fallback={null}><settingsRegistry.DeFiModuleSettings /></Suspense>;
    }

    // Minting module — no layout, just its config
    if (type === 'mintingModule') {
      return <Suspense fallback={null}><settingsRegistry.MintingModuleSettings /></Suspense>;
    }

    // DeFi section — layout + module management
    if (type === 'defiSection') {
      return (
        <>
          <CollapsibleSection title="Layout">
            <DisplayEditor />
            <SpacingEditor />
          </CollapsibleSection>
          <Suspense fallback={null}>
            <settingsRegistry.DeFiSectionSettings />
          </Suspense>
        </>
      );
    }

    // Minting section — layout + module management
    if (type === 'mintingSection') {
      return (
        <>
          <CollapsibleSection title="Layout">
            <DisplayEditor />
            <SpacingEditor />
          </CollapsibleSection>
          <Suspense fallback={null}>
            <settingsRegistry.MintingSectionSettings />
          </Suspense>
        </>
      );
    }

    // Form
    if (FORM_TYPES.has(type)) {
      return <Suspense fallback={null}><settingsRegistry.FormSettings /></Suspense>;
    }

    // List
    if (LIST_TYPES.has(type)) {
      return <Suspense fallback={null}><settingsRegistry.ListSettings /></Suspense>;
    }

    // Table
    if (TABLE_TYPES.has(type)) {
      return <Suspense fallback={null}><settingsRegistry.TableSettings /></Suspense>;
    }

    // Interactive elements (tabs, accordion, modal, carousel, tooltip, dropdown,
    // breadcrumb, progress, iframe, checkbox, radio, toggle, etc.)
    if (getMeta(type)?.sidebarCategory === 'interactive') {
      return <Suspense fallback={null}><settingsRegistry.InteractiveSettings /></Suspense>;
    }

    // Default: structural / container — show display + spacing
    return (
      <>
        <CollapsibleSection title="Display">
          <DisplayEditor />
        </CollapsibleSection>
        <CollapsibleSection title="Spacing">
          <SpacingEditor />
        </CollapsibleSection>
      </>
    );
  };

  // ── Settings tab ────────────────────────────────────────────────
  // Element metadata + type-specific configuration (link URL,
  // wallet config, DeFi params, etc.)
  const renderSettingsTab = () => {
    if (!selectedElement) return <p className="sidebar-empty-hint">Select an element to edit.</p>;

    const type = selectedElement.type;

    return (
      <div className="settings-panel">
        {/* Element info — always visible */}
        <CollapsibleSection title="Element Information">
          <div className="settings-wrapper">
            <div className="settings-field">
              <label>Element ID</label>
              <input type="text" value={selectedElement.id || ''} readOnly className="settings-input" />
            </div>
            <div className="settings-field">
              <label>CSS Class</label>
              <input
                type="text"
                value={selectedElement.className || ''}
                placeholder="e.g. hero-title fade-in"
                className="settings-input"
                onChange={(e) => updateElementProperties(selectedElement.id, { className: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label>Type</label>
              <input type="text" value={type || ''} readOnly className="settings-input" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Link / button settings */}
        {LINK_TYPES.has(type) && (
          <CollapsibleSection title="Link Settings">
            <Suspense fallback={null}>
              <settingsRegistry.LinkSettings settings={selectedElement.settings || {}} />
            </Suspense>
          </CollapsibleSection>
        )}

        {/* Wallet button config */}
        {type === 'connectWalletButton' && (
          <CollapsibleSection title="Wallet Settings">
            <Suspense fallback={null}>
              <settingsRegistry.WalletSettings />
            </Suspense>
          </CollapsibleSection>
        )}

        {/* Type-specific settings are shown on the Content tab.
           The Settings tab only shows metadata (Element Info, Link, Wallet)
           that isn't duplicated elsewhere. */}

      </div>
    );
  };

  return (
    <div className="sidebar-container">
      {selectedElement ? (
        <div className="sidebar-toggle-buttons">
          <button
            onClick={() => setEditorViewMode('content')}
            className={editorViewMode === 'content' ? 'active' : ''}
          >
            {CONTENT_CATEGORIES.has(getMeta(selectedElement.type)?.sidebarCategory) ? 'Content' : 'Display'}
          </button>
          <button
            onClick={() => setEditorViewMode('style')}
            className={editorViewMode === 'style' ? 'active' : ''}
          >
            Styles
          </button>
          <button
            onClick={() => setEditorViewMode('settings')}
            className={editorViewMode === 'settings' ? 'active' : ''}
          >
            Settings
          </button>
        </div>
      ) : (
        <>
          <div className="sidebar-toggle-buttons">
            <button
              onClick={() => setSidebarViewMode('elements')}
              className={sidebarViewMode === 'elements' ? 'active' : ''}
            >
              Elements
            </button>
            <button
              onClick={() => setSidebarViewMode('layout')}
              className={sidebarViewMode === 'layout' ? 'active' : ''}
            >
              Layout
            </button>
          </div>
          <div className="sidebar-search-bar">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search components or styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </>
      )}

      {selectedElement ? (
        <div className="editor-panel-container" key={selectedElement.id}>
          {editorViewMode === 'content' ? (
            renderContentTab()
          ) : editorViewMode === 'settings' ? (
            renderSettingsTab()
          ) : (
            <Suspense fallback={null}>
              <EditorPanel pageSettings={pageSettings} />
            </Suspense>
          )}
        </div>
      ) : (
        <div className="default-sidebar-container">
          <Suspense fallback={null}>
            <NewElementPanel
              viewMode={sidebarViewMode}
              searchQuery={searchQuery}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default SideBar;
