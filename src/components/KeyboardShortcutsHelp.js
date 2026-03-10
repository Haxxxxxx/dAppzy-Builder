import React from 'react';
import './css/KeyboardShortcutsHelp.css';

const SHORTCUTS = [
  { keys: ['Ctrl', 'S'], description: 'Save project' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Ctrl', 'C'], description: 'Copy element' },
  { keys: ['Ctrl', 'V'], description: 'Paste element' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate element' },
  { keys: ['Delete'], description: 'Remove element' },
  { keys: ['Escape'], description: 'Deselect element' },
  { keys: ['↑ ↓ ← →'], description: 'Nudge element (1px)' },
  { keys: ['Shift', '↑ ↓ ← →'], description: 'Nudge element (10px)' },
  { keys: ['?'], description: 'Toggle this help overlay' },
];

const KeyboardShortcutsHelp = ({ onClose }) => (
  <div className="kb-help-backdrop" onClick={onClose}>
    <div className="kb-help-modal" onClick={(e) => e.stopPropagation()}>
      <div className="kb-help-header">
        <h2>Keyboard Shortcuts</h2>
        <button className="kb-help-close" onClick={onClose} aria-label="Close shortcuts help">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <ul className="kb-help-list">
        {SHORTCUTS.map(({ keys, description }) => (
          <li key={description} className="kb-help-row">
            <span className="kb-help-description">{description}</span>
            <span className="kb-help-keys">
              {keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default KeyboardShortcutsHelp;
