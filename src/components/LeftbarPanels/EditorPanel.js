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
    if (!selectedElement) return <p>Select an element to edit its settings.</p>;

    switch (selectedElement.type) {
      case 'title':
      case 'paragraph':
      case 'blockquote':
      case 'code':
      case 'pre':
      case 'caption':
        return <TextualSettings settings={selectedElement.settings || {}} />;
      case 'connectWalletButton':
        return <WalletSettings settings={selectedElement.settings || {}} />;
      case 'div':
      case 'section':
      case 'nav':
      case 'footer':
      case 'header':
        // Allow style editing for footer (and other containers)
        return (
          <>
            <BackgroundEditor pageSettings={pageSettings} />
            <BorderEditor />
            <SizeEditor />
            <SpacingEditor />
            <DisplayEditor />
            <TypographyEditor />
          </>
        );
      case 'image':
        return <ImageSettings settings={selectedElement.settings || {}} />;
      case 'video':
        return <VideoSettings settings={selectedElement.settings || {}} />;
      case 'mintingSection':
        return <CandyMachineSettings settings={selectedElement.settings || {}} />;
      case 'defiSection':
        return <DeFiSectionSettings selectedElement={selectedElement} />;
      case 'anchor':
      case 'span':
      case 'button':
        if (selectedElement.label !== 'title') {
          return <LinkSettings settings={selectedElement.settings || {}} />;
        }
        break;
      case 'list':
      case 'list-item':
        return <ListSettings settings={selectedElement.settings || {}} />;
      case 'form':
        return <FormSettings settings={selectedElement.settings || {}} />;
      default:
        return null;
    }
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
            <CollapsibleSection title="Display">
              <DisplayEditor />
            </CollapsibleSection>
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
