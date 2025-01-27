import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import TypographyEditor from '../../Editors/TypographyEditor';
import BorderEditor from '../../Editors/BorderEditor';
import SizeEditor from '../../Editors/SizeEditor';
import SpacingEditor from '../../Editors/SpacingEditor';
import DisplayEditor from '../../Editors/DisplayEditor';
import EffectEditor from '../../Editors/EffectEditor';
import ButtonEditor from '../../Editors/ButtonEditor';
import CandyMachineSettings from '../LeftbarPanels/SettingsPanels/CandyMachineSettings';
import WalletSettings from './SettingsPanels/WalletSettings';
import LinkSettings from './SettingsPanels/LinkSettings';
import BackgroundEditor from '../../Editors/BackgroundEditor'; // Import the new component
import TextualSettings from './SettingsPanels/TextualSettings';
import ListSettings from './SettingsPanels/ListSettings';
import ImageSettings from './SettingsPanels/ImageSettings';
import VideoSettings from './SettingsPanels/VideoSettings';
import BackgroundSettings from './SettingsPanels/BackgroundSettings';

const CollapsiblePanel = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="collapsible-panel">
      <div
        className="panel-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          background: '#f0f0f0',
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      >
        <h4 style={{ margin: 0 }}>{title}</h4>
      </div>
      {isOpen && (
        <div
          className="panel-content"
          style={{
            padding: '16px',
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const EditorPanel = ({ onUpdateSettings }) => {
  const { selectedElement, setElements, elements } = useContext(EditableContext);
  const [viewMode, setViewMode] = useState('style'); // Default to 'style' view
  console.log("Selected Element type in EditorPanel : " + selectedElement?.type);

  const renderSettingsView = () => {
    if (selectedElement?.type === 'title' || selectedElement?.type === 'paragraph' || selectedElement?.type === 'blockquote' || selectedElement?.type === 'code' || selectedElement?.type === 'pre' || selectedElement?.type === 'caption') {
      return (
        <TextualSettings
          settings={selectedElement.settings || {}}
          onUpdateSettings={onUpdateSettings}
        />
      );
    }
    if (selectedElement?.type === 'div' || selectedElement?.type === 'section') {
      return (
        <BackgroundSettings
          settings={selectedElement.settings || {}}
          onUpdateSettings={onUpdateSettings}
        />
      );
    }
    if (selectedElement?.type === 'connectWalletButton') {
      return (
        <WalletSettings
          settings={selectedElement.settings || {}}
          onUpdateSettings={onUpdateSettings}
        />
      );
    }
    if (selectedElement?.type === 'image') {
      return <ImageSettings settings={selectedElement.settings || {}}
        onUpdateSettings={onUpdateSettings}
      />;
    }
    if (selectedElement?.type === 'video') {
      return <VideoSettings settings={selectedElement.settings || {}}
        onUpdateSettings={onUpdateSettings}
      />;
    }
    if (selectedElement?.type === 'candyMachine') {
      return (
        <CandyMachineSettings
          settings={selectedElement.settings || {}}
          onUpdateSettings={onUpdateSettings}
        />
      );
    }
    
    if ((selectedElement?.type === 'anchor' || selectedElement?.type === 'span' || selectedElement?.type === 'link' || selectedElement?.type === 'button') && selectedElement.label !== 'title') {
      return (
        <LinkSettings
          settings={selectedElement.settings || {}}
          onUpdateSettings={onUpdateSettings}
        />
      );
    }
    if ((selectedElement?.type === 'list' || selectedElement?.type === 'list-item')) {
      return (
        <ListSettings
          settings={selectedElement.settings || {}}
          onUpdateSettings={onUpdateSettings}
        />
      );
    }

    return <p>No settings available for this element yet.</p>;
  };

  return (
    <>
      <div className="sidebar-toggle-buttons">
        <button
          onClick={() => setViewMode('style')}
          className={viewMode === 'style' ? 'active' : ''}
        >
          Style Editor
        </button>
        <button
          onClick={() => setViewMode('settings')}
          className={viewMode === 'settings' ? 'active' : ''}
        >
          Element Setting
        </button>
      </div>
      <div className="editor-panel">
        {/* Toggle between Settings and Style Views */}

        {/* Conditional rendering based on viewMode */}
        {viewMode === 'style' ? (
          <div className="style-editor">
            <CollapsiblePanel title="Typography">
              <TypographyEditor />
            </CollapsiblePanel>

            {/* New panel for Background & Global Settings */}
            <CollapsiblePanel title="Background & Global Settings">
              <BackgroundEditor />
            </CollapsiblePanel>

            <CollapsiblePanel title="Borders">
              <BorderEditor />
            </CollapsiblePanel>
            <CollapsiblePanel title="Size">
              <SizeEditor />
            </CollapsiblePanel>
            <CollapsiblePanel title="Spacing">
              <SpacingEditor />
            </CollapsiblePanel>
            <CollapsiblePanel title="Display">
              <DisplayEditor />
            </CollapsiblePanel>
            <CollapsiblePanel title="Effects">
              <EffectEditor />
            </CollapsiblePanel>
            {selectedElement?.type === 'button' && (
              <CollapsiblePanel title="Button">
                <ButtonEditor />
              </CollapsiblePanel>
            )}
          </div>
        ) : (
          <div className="settings-view">
            {renderSettingsView()}
          </div>
        )}

        {elements.length > 0 && (
          <button
            onClick={() => setElements([])}
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
    </>

  );
};

export default EditorPanel;
