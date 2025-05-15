import React, { useContext } from 'react';
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
import DeFiModuleSettings from './SettingsPanels/DeFiModuleSettings';

const EditorPanel = ({ pageSettings, viewMode, setViewMode, searchQuery }) => {
  const { selectedElement, setElements, elements } = useContext(EditableContext);

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
      return <DeFiSectionSettings selectedElement={selectedElement} />;
    }
    if (selectedElement.type === 'defiModule') {
      return <DeFiModuleSettings selectedElement={selectedElement} />;
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
                    // Find and expand the content editor section
                    const contentEditor = document.querySelector('.content-editor-section');
                    if (contentEditor) {
                      contentEditor.classList.add('expanded');
                    }
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
            {renderSettingsView()}
          </div>
        );
      case 'content':
      case 'display':
        return (
          <div className="content-view">
            {renderSettingsView()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="editor-panel">
      {renderContent()}
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
  );
};

export default EditorPanel;
