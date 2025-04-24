import React, { useContext, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';
import TypographyEditor from '../../Editors/TypographyEditor';
import BorderEditor from '../../Editors/BorderEditor';
import SizeEditor from '../../Editors/SizeEditor';
import SpacingEditor from '../../Editors/SpacingEditor';
import DisplayEditor from '../../Editors/DisplayEditor';
import CandyMachineSettings from '../LeftbarPanels/SettingsPanels/CandyMachineSettings';
import WalletSettings from './SettingsPanels/WalletSettings';
import LinkSettings from './SettingsPanels/LinkSettings';
import BackgroundEditor from '../../Editors/BackgroundEditor';
import TextualSettings from './SettingsPanels/TextualSettings';
import ListSettings from './SettingsPanels/ListSettings';
import ImageSettings from './SettingsPanels/ImageSettings';
import VideoSettings from './SettingsPanels/VideoSettings';
import DeFiSectionSettings from './SettingsPanels/DeFiSectionSettings';
import '../css/EditorPanel.css';
import CollapsibleSection from './SettingsPanels/LinkSettings/CollapsibleSection';
import BackgroundSettings from './SettingsPanels/BackgroundSettings';
import FormSettings from './SettingsPanels/FormSettings';

const EditorPanel = ({pageSettings, viewMode, setViewMode, searchQuery }) => {
  const { selectedElement, setElements, elements } = useContext(EditableContext);

  // Reset editor view mode to 'style' whenever the selected element changes.
  useEffect(() => {
    // Only reset to 'style' if no element is selected,
    // or if you want to reset only on initial mount.
    if (!selectedElement) {
      setViewMode('style');
    }
  }, [selectedElement, setViewMode]);
  const renderSettingsView = () => {
    if (
      selectedElement?.type === 'title' ||
      selectedElement?.type === 'paragraph' ||
      selectedElement?.type === 'blockquote' ||
      selectedElement?.type === 'code' ||
      selectedElement?.type === 'pre' ||
      selectedElement?.type === 'caption'
    ) {
      return (
        <TextualSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    if (selectedElement?.type === 'connectWalletButton') {
      return (
        <WalletSettings
          settings={selectedElement.settings || {}}
        />
      );
    }    
    if (selectedElement?.type === 'div' || selectedElement?.type === 'section') {
      return (
        <BackgroundSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    if (selectedElement?.type === 'image') {
      return (
        <ImageSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    if (selectedElement?.type === 'video') {
      return (
        <VideoSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    if (selectedElement?.type === 'mintingSection') {
      return (
        <CandyMachineSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    if (selectedElement?.type === 'defiSection') {
      return (
        <DeFiSectionSettings
          selectedElement={selectedElement}
        />
      );
    }
    if (
      (selectedElement?.type === 'anchor' ||
        selectedElement?.type === 'span' ||
        selectedElement?.type === 'button' ||
        selectedElement?.type === 'icon') &&
      selectedElement.label !== 'title'
    ) {
      return (
        <LinkSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    if (
      selectedElement?.type === 'list' ||
      selectedElement?.type === 'list-item'
    ) {
      return (
        <ListSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    if (
      selectedElement?.type === 'form' 
    ) {
      return (
        <FormSettings
          settings={selectedElement.settings || {}}
        />
      );
    }
    return <p>No settings available for this element yet.</p>;
  };

  return (
    <>
      {/* <div className="sidebar-toggle-buttons">
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
      </div> */}
      <div className="editor-panel">
        {viewMode === 'style' ? (
          <div className="style-editor">
            <CollapsibleSection title="Typography">
              <TypographyEditor />
            </CollapsibleSection>
            <CollapsibleSection title="Background & Global Settings">
              <BackgroundEditor pageSettings={pageSettings} />
            </CollapsibleSection>
            <CollapsibleSection title="Borders">
              <BorderEditor />
            </CollapsibleSection>
            <CollapsibleSection title="Size">
              <SizeEditor />
            </CollapsibleSection>
            <CollapsibleSection title="Spacing">
              <SpacingEditor />
            </CollapsibleSection>
            {/* <CollapsibleSection title="Display">
              <DisplayEditor />
            </CollapsibleSection> */}
          </div>
        ) : (
          <div className="settings-view">
            {renderSettingsView()}
          </div>
        )}
        {elements.length > 0 && (
          <button
            onClick={() => {
              localStorage.removeItem('editableElements');
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
    </>
  );
};

export default EditorPanel;
