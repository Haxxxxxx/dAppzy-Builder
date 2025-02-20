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
import '../css/EditorPanel.css'
import CollapsibleSection from './SettingsPanels/LinkSettings/CollapsibleSection';


const EditorPanel = ({ onUpdateSettings, userId }) => {
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
    if (selectedElement?.type === 'bgVideo' || selectedElement?.type === 'section' || selectedElement?.type === 'navbar' || selectedElement?.type === 'hero' || selectedElement?.type === 'cta' || selectedElement?.type === 'footer' ) {
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
    if (selectedElement?.type === 'mintingSection') {
      return (
        <CandyMachineSettings
          settings={selectedElement.settings || {}}
          onUpdateSettings={onUpdateSettings}
        />
      );
    }

    if ((selectedElement?.type === 'anchor' || selectedElement?.type === 'span' || selectedElement?.type === 'button') && selectedElement.label !== 'title') {
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
            <CollapsibleSection title="Typography">
              <TypographyEditor />
            </CollapsibleSection>

            {/* New panel for Background & Global Settings */}
            <CollapsibleSection title="Background & Global Settings">
              <BackgroundEditor />
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
            <CollapsibleSection title="Display">
              <DisplayEditor />
            </CollapsibleSection>
            {/* <CollapsibleSection title="Effects">
              <EffectEditor />
            </CollapsibleSection> */}
            {/* {selectedElement?.type === 'button' && (
              <CollapsibleSection title="Button">
                <ButtonEditor />
              </CollapsibleSection>
            )} */}
          </div>
        ) : (
          <div className="settings-view">
            {renderSettingsView()}
          </div>
        )}

        {elements.length > 0 && (
          <button
            onClick={() => {
              localStorage.removeItem('editableElements'); // remove items from localStorage
              setElements([]); // update your state if needed
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
