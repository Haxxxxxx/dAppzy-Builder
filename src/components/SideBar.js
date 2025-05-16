import React, { useState, useContext } from 'react';
import NewElementPanel from './LeftbarPanels/NewElementPanel';
import EditorPanel from './LeftbarPanels/EditorPanel';
import { EditableContext } from '../context/EditableContext';
import SpacingEditor from '../Editors/SpacingEditor';
import DisplayEditor from '../Editors/DisplayEditor';
import './css/Sidebar.css';
import CollapsibleSection from './LeftbarPanels/SettingsPanels/LinkSettings/CollapsibleSection';
import TextualSettings from './LeftbarPanels/SettingsPanels/TextualSettings';
import './LeftbarPanels/SettingsPanels/css/ImageSettings.css';
import LinkSettings from './LeftbarPanels/SettingsPanels/LinkSettings';
import WalletSettingsPanel from './LeftbarPanels/SettingsPanels/WalletSettings';
import ImageSettings from './LeftbarPanels/SettingsPanels/ImageSettings';
import FormSettings from './LeftbarPanels/SettingsPanels/FormSettings';
import ListSettings from './LeftbarPanels/SettingsPanels/ListSettings';
import VideoSettings from './LeftbarPanels/SettingsPanels/VideoSettings';
import DeFiSectionSettings from './LeftbarPanels/SettingsPanels/DeFiSectionSettings';
import DeFiModuleSettings from './LeftbarPanels/SettingsPanels/DeFiModuleSettings';
import BackgroundSettings from './LeftbarPanels/SettingsPanels/BackgroundSettings';
import CandyMachineSettings from './LeftbarPanels/SettingsPanels/CandyMachineSettings';

const SideBar = ({ contentListWidth, pageSettings, handlePanelToggle, handleOpenMediaPanel }) => {
  // State for when no element is selected
  const [sidebarViewMode, setSidebarViewMode] = useState('elements');
  // State for when an element is selected (editor panel)
  const [editorViewMode, setEditorViewMode] = useState('content');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedElement, updateContent, updateConfiguration, updateStyles } = useContext(EditableContext);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper function to determine if element is a form element
  const isFormElement = (element) => {
    const formElements = ['form', 'input', 'textarea', 'select', 'label', 'fieldset', 'legend'];
    return formElements.includes(element.type);
  };

  // Helper function to determine if element is a list element
  const isListElement = (element) => {
    const listElements = ['ul', 'ol', 'li'];
    return listElements.includes(element.type);
  };

  // Helper function to determine if element is a video element
  const isVideoElement = (element) => {
    const videoElements = ['video', 'youtubevideo', 'bgvideo'];
    return videoElements.includes(element.type);
  };

  // Helper function to determine if element is a DeFi element
  const isDeFiElement = (element) => {
    const defiElements = ['defiSection', 'defiModule', 'mintingSection'];
    return defiElements.includes(element.type?.toLowerCase());
  };

  // Helper function to determine if element is a layout element
  const isLayoutElement = (element) => {
    const layoutElements = ['navbar', 'hero', 'cta', 'section', 'footer', 'defiSection', 'mintingSection'];
    return layoutElements.includes(element.type?.toLowerCase());
  };

  const isTextualElement = (element) => {
    if (!element || !element.type) return false;

    const textualElements = [
      // Basic text elements
      'title', 'description', 'paragraph', 'p', 'blockquote',
      'code', 'pre', 'caption', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Link elements
      'a', 'link', 'linkblock', 'anchor',
      // Button elements
      'button', 'connectWalletButton',
      // Other text containers
      'label', 'legend', 'figcaption', 'cite', 'q', 'em', 'strong', 'mark',
      'small', 'sub', 'sup', 'time', 'abbr', 'dfn', 'kbd', 'samp', 'var'
    ];

    return textualElements.includes(element.type);
  };

  const shouldShowDisplaySettings = (element) => {
    // Early return if element is null or undefined
    if (!element || !element.type) return false;

    // Elements that should have display settings
    const displayElements = {
      // Layout & Structure Elements
      layout: [
        'div', 'section', 'container', 'gridlayout', 'hflexlayout', 'vflexlayout',
        'navbar', 'footer', 'hero', 'cta', 'contentsections', 'defiSection', 'mintingSection',
      ],
      // Form Elements
      form: [
        'form', 'fieldset'
      ],
      // List Elements
      list: [
        'ul', 'ol'
      ],
      // Table Elements
      table: [
        'table', 'tablerow', 'tablecell'
      ],
      // Web3 Elements
      web3: [
        'defiSection', 'defiModule', 'mintingSection'
      ],
      // Media Containers
      media: [
        'bgvideo'
      ]
    };

    try {
      // Flatten all categories into a single array
      const allDisplayElements = Object.values(displayElements).flat();

      // Get the element type and convert to lowercase, with fallback to empty string
      const elementType = (element.type || '').toLowerCase();

      // Check if the element type is in any of the categories
      return allDisplayElements.includes(elementType);
    } catch (error) {
      console.error('Error in shouldShowDisplaySettings:', error);
      return false;
    }
  };

  const renderDisplayView = () => {
    if (!selectedElement) {
      return <p>Select an element to edit its settings.</p>;
    }

    // Handle DeFi elements first
    if (isDeFiElement(selectedElement)) {
      if (selectedElement.type === 'defiSection') {
        return (
          <>
            <CollapsibleSection title="Layout Settings">
              <DisplayEditor />
              <SpacingEditor />
            </CollapsibleSection>
            <DeFiSectionSettings selectedElement={selectedElement} />
          </>
        );
      } else if (selectedElement.type === 'defiModule') {
        return <DeFiModuleSettings selectedElement={selectedElement} />;
      } else if (selectedElement.type === 'mintingSection') {
        return (
          <>
            <CollapsibleSection title="Layout Settings">
              <DisplayEditor />
              <SpacingEditor />
            </CollapsibleSection>
            <DeFiSectionSettings selectedElement={selectedElement} />
          </>
        );
      }
    }

    // Handle layout elements
    if (isLayoutElement(selectedElement)) {
      return (
        <>
          <CollapsibleSection title="Layout Settings">
            <DisplayEditor />
            <SpacingEditor />
          </CollapsibleSection>
          <CollapsibleSection title="Content Settings">
            {selectedElement.children?.map((childId, index) => (
              <div key={childId} className="child-element-settings">
                <h4>Element {index + 1}</h4>
                <TextualSettings elementId={childId} />
              </div>
            ))}
          </CollapsibleSection>
        </>
      );
    }

    // Always show TextualSettings for textual elements
    if (isTextualElement(selectedElement)) {
      return (
        <>
          <TextualSettings />
          {/* Show specific settings based on element type */}
          {selectedElement.type === 'button' || selectedElement.type === 'a' || selectedElement.type === 'link' || selectedElement.type === 'linkblock' ? (
            <LinkSettings />
          ) : selectedElement.type === 'connectWalletButton' ? (
            <WalletSettingsPanel />
          ) : null}
        </>
      );
    }

    // Handle form elements
    if (isFormElement(selectedElement)) {
      return <FormSettings />;
    }

    // Handle list elements
    if (isListElement(selectedElement)) {
      return <ListSettings />;
    }

    // Handle video elements
    if (isVideoElement(selectedElement)) {
      return <VideoSettings />;
    }

    // Handle image elements
    if (selectedElement.type === 'image') {
      return <ImageSettings />;
    }

    // Handle background elements
    if (selectedElement.type === 'bgvideo') {
      return <BackgroundSettings />;
    }

    // Handle candy machine elements
    if (selectedElement.type === 'candymachine') {
      return <CandyMachineSettings />;
    }

    // For other elements (like containers, etc.)
    return (
      <>
        <CollapsibleSection title="Display Settings">
          <DisplayEditor />
        </CollapsibleSection>
        <CollapsibleSection title="Spacing Settings">
          <SpacingEditor />
        </CollapsibleSection>
      </>
    );
  };

  return (
    <div className="sidebar-container">
      {selectedElement ? (
        // Editor toggle buttons: content/display vs. style vs. settings
        <div className="sidebar-toggle-buttons">
          <button
            onClick={() => setEditorViewMode('content')}
            className={editorViewMode === 'content' ? 'active' : ''}
          >
            {isTextualElement(selectedElement) ? 'Content' : 'Display'}
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
        // Sidebar toggle buttons: layout vs. elements
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

      {/* Render panel based on whether an element is selected */}
      {selectedElement ? (
        <div className="editor-panel-container">
          {editorViewMode === 'content' ? (
            renderDisplayView()
          ) : editorViewMode === 'settings' ? (
            <div className="settings-panel">
              {isDeFiElement(selectedElement) ? (
                selectedElement.type === 'defiSection' ? (
                  <DeFiSectionSettings selectedElement={selectedElement} />
                ) : selectedElement.type === 'defiModule' ? (
                  <DeFiModuleSettings selectedElement={selectedElement} />
                ) : null
              ) : (
              <CollapsibleSection
                title="Element Information"
                className="element-info-section"
                defaultExpanded={true}
              >
                <div className="settings-wrapper">
                  <div className="element-id-display">
                    <label>Element ID:</label>
                    <input
                      type="text"
                      value={selectedElement.id || ''}
                      readOnly
                      className="settings-input"
                    />
                  </div>
                  <div className="element-type-display">
                    <label>Element Type:</label>
                    <input
                      type="text"
                      value={selectedElement.type || ''}
                      readOnly
                      className="settings-input"
                    />
                  </div>
                </div>
              </CollapsibleSection>
              )}
            </div>
          ) : (
            <EditorPanel
              searchQuery={searchQuery}
              pageSettings={pageSettings}
              viewMode={editorViewMode}
              setViewMode={setEditorViewMode}
            />
          )}
        </div>
      ) : (
        <div className="default-sidebar-container">
          <NewElementPanel
            viewMode={sidebarViewMode}
            contentListWidth={contentListWidth}
            searchQuery={searchQuery}
            handlePanelToggle={handlePanelToggle}
            handleOpenMediaPanel={handleOpenMediaPanel}
          />
        </div>
      )}
    </div>
  );
};

export default SideBar;
