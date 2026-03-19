import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { projectStorage } from '../../utils/storageManager';
import ConfirmModal from '../common/ConfirmModal';
import '../css/EditorPanel.css';
import CollapsibleSection from './SettingsPanels/LinkSettings/CollapsibleSection';
import { CONTAINER_TYPES, TEXT_TYPES, MEDIA_TYPES, getMeta } from '../../core/elementRegistry';

// Eagerly import all editors — React.lazy + Suspense causes stale context on first mount
import TypographyEditor from '../../Editors/TypographyEditor';
import DisplayEditor from '../../Editors/DisplayEditor';
import BackgroundEditor from '../../Editors/BackgroundEditor';
import BorderEditor from '../../Editors/BorderEditor';
import SizeEditor from '../../Editors/SizeEditor';
import SpacingEditor from '../../Editors/SpacingEditor';
import ShadowEditor from '../../Editors/ShadowEditor';
import OpacityEditor from '../../Editors/OpacityEditor';
import FilterEditor from '../../Editors/FilterEditor';
import TransformEditor from '../../Editors/TransformEditor';
import TransitionEditor from '../../Editors/TransitionEditor';
import ScrollAnimationEditor from '../../Editors/ScrollAnimationEditor';
import PositionEditor from '../../Editors/PositionEditor';

// Editors that start collapsed — less frequently used
const COLLAPSED_BY_DEFAULT = new Set([
  'Shadow', 'Opacity', 'Filters', 'Transform', 'Transition', 'Scroll Animation', 'Position',
]);

// ── CSS helpers ─────────────────────────────────────────────────────
const camelToKebab = (str) =>
  str.replace(/([A-Z])/g, '-$1').toLowerCase();

const kebabToCamel = (str) =>
  str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const stylesToCSSText = (styles) => {
  if (!styles || typeof styles !== 'object') return '';
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${camelToKebab(k)}: ${v};`)
    .join('\n');
};

const cssTextToStyles = (text) => {
  const styles = {};
  // Split on ; then parse each declaration
  text.split(';').forEach((decl) => {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) return;
    const prop = decl.slice(0, colonIdx).trim();
    const val = decl.slice(colonIdx + 1).trim();
    if (prop && val) {
      styles[kebabToCamel(prop)] = val;
    }
  });
  return styles;
};

// ── Inline Custom CSS Editor ────────────────────────────────────────
const CustomCSSEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const [cssText, setCssText] = useState('');

  // Sync textarea when selected element or its styles change
  useEffect(() => {
    if (selectedElement?.styles) {
      setCssText(stylesToCSSText(selectedElement.styles));
    } else {
      setCssText('');
    }
  }, [selectedElement?.id, selectedElement?.styles]);

  if (!selectedElement) return null;

  const handleApply = () => {
    const parsed = cssTextToStyles(cssText);
    const currentStyles = selectedElement.styles || {};
    const cleared = {};
    Object.keys(currentStyles).forEach(key => {
      if (!(key in parsed) && key !== 'outline') {
        cleared[key] = '';
      }
    });
    updateStyles(selectedElement.id, { ...cleared, ...parsed });
  };

  return (
    <div className="custom-css-editor">
      <textarea
        className="custom-css-textarea"
        value={cssText}
        onChange={(e) => setCssText(e.target.value)}
        onBlur={handleApply}
        spellCheck={false}
        placeholder="e.g. border-radius: 12px;&#10;opacity: 0.8;"
      />
      <button className="custom-css-apply-btn" onClick={handleApply}>
        Apply
      </button>
    </div>
  );
};

const EditorPanel = ({ pageSettings }) => {
  const {
    selectedElement, setSelectedElement, setElements, elements,
    styleEditingMode, setStyleEditingMode, activeBreakpoint,
  } = useContext(EditableContext);
  const [confirmModal, setConfirmModal] = useState(null);

  // ── Breadcrumb path ──────────────────────────────────────────────
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

  // ── Build the editor list for the selected element ───────────────
  const getRelevantEditors = (element) => {
    if (!element) return [];

    const type = element.type;
    const meta = getMeta(type);
    const editors = [];

    // Typography — skip for decorative elements (hr, line, spacer, etc.)
    if (meta?.editorGroup !== 'none') {
      editors.push({ title: 'Typography', component: <TypographyEditor /> });
    }

    // Container / structural elements
    if (CONTAINER_TYPES.has(type)) {
      editors.push(
        { title: 'Display & Layout', component: <DisplayEditor /> },
        { title: 'Background', component: <BackgroundEditor pageSettings={pageSettings} /> },
        { title: 'Borders', component: <BorderEditor /> },
        { title: 'Size', component: <SizeEditor /> },
        { title: 'Spacing', component: <SpacingEditor /> },
      );
    }

    // Text elements
    if (TEXT_TYPES.has(type)) {
      editors.push(
        { title: 'Background', component: <BackgroundEditor pageSettings={pageSettings} /> },
        { title: 'Borders', component: <BorderEditor /> },
        { title: 'Size', component: <SizeEditor /> },
        { title: 'Spacing', component: <SpacingEditor /> },
      );
    }

    // Media elements
    if (MEDIA_TYPES.has(type)) {
      editors.push(
        { title: 'Size', component: <SizeEditor /> },
        { title: 'Borders', component: <BorderEditor /> },
        { title: 'Spacing', component: <SpacingEditor /> },
      );
    }

    // Decorative elements (hr, line, spacer, separator, progress)
    if (meta?.editorGroup === 'none') {
      editors.push(
        { title: 'Size', component: <SizeEditor /> },
        { title: 'Borders', component: <BorderEditor /> },
        { title: 'Spacing', component: <SpacingEditor /> },
      );
    }

    // Common tail — always present
    editors.push(
      { title: 'Shadow', component: <ShadowEditor /> },
      { title: 'Opacity', component: <OpacityEditor /> },
      { title: 'Filters', component: <FilterEditor /> },
      { title: 'Transform', component: <TransformEditor /> },
      { title: 'Transition', component: <TransitionEditor /> },
      { title: 'Scroll Animation', component: <ScrollAnimationEditor /> },
      { title: 'Position', component: <PositionEditor /> },
    );

    return editors;
  };

  // ── Reorder helpers ──────────────────────────────────────────────
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

  const ancestorPath = getAncestorPath(selectedElement);
  const { isFirst, isLast, hasParent } = getSiblingInfo();

  return (
    <div className="editor-panel">
      {/* Breadcrumb */}
      {selectedElement && ancestorPath.length > 0 && (
        <div className="editor-breadcrumb">
          {ancestorPath.map((ancestor) => (
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

      {/* Reorder bar */}
      {selectedElement && hasParent && (
        <div className="editor-reorder-bar">
          <button className="editor-reorder-btn" disabled={isFirst} onClick={() => moveSelectedElement(-1)} title="Move element up">
            <span className="material-symbols-outlined">arrow_upward</span>
            Move Up
          </button>
          <button className="editor-reorder-btn" disabled={isLast} onClick={() => moveSelectedElement(1)} title="Move element down">
            <span className="material-symbols-outlined">arrow_downward</span>
            Move Down
          </button>
        </div>
      )}

      {/* Style editors */}
      {selectedElement ? (
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
            <CollapsibleSection
              key={index}
              title={editor.title}
              defaultExpanded={!COLLAPSED_BY_DEFAULT.has(editor.title)}
            >
              {editor.component}
            </CollapsibleSection>
          ))}
          <CollapsibleSection title="Custom CSS" defaultExpanded={false}>
            <CustomCSSEditor />
          </CollapsibleSection>
        </div>
      ) : (
        <p className="editor-empty-hint">Select an element to edit.</p>
      )}

      {/* Keyboard shortcuts */}
      <CollapsibleSection title="Keyboard Shortcuts" defaultExpanded={false}>
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
            <div key={key} className="shortcut-row">
              <kbd className="shortcut-key">{key}</kbd>
              <span className="shortcut-desc">{desc}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Clear all */}
      {elements.length > 0 && (
        <button
          className="editor-clear-all-btn"
          onClick={() => {
            setConfirmModal({
              title: 'Clear All Elements',
              content: 'Are you sure you want to clear all elements? You can undo this with Ctrl+Z.',
              okText: 'Clear All',
              okType: 'danger',
              onOk: () => {
                setConfirmModal(null);
                projectStorage.clearLegacyCache();
                setElements(() => []);
              },
            });
          }}
        >
          Clear All Elements
        </button>
      )}

      {confirmModal && (
        <ConfirmModal
          open={true}
          {...confirmModal}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

export default EditorPanel;
