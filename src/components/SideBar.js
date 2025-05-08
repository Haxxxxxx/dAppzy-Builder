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

const SideBar = ({ contentListWidth, pageSettings }) => {
  // State for when no element is selected
  const [sidebarViewMode, setSidebarViewMode] = useState('elements'); 
  // State for when an element is selected (editor panel)
  const [editorViewMode, setEditorViewMode] = useState('content');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedElement, updateContent, updateConfiguration, updateStyles } = useContext(EditableContext);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
        'navbar', 'footer', 'hero', 'cta', 'contentsections', 'defiNavbar', 'defiFooter', 
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
        'defisection', 'defimodule', 'mintingsection'
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

    if (isTextualElement(selectedElement)) {
      return (
        <div className="content-editor-container">
          <CollapsibleSection 
            title={`${selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Content`}
            className="content-editor-section"
            defaultExpanded={true}
          >
            <div className="settings-wrapper">
              {selectedElement.type === 'code' ? (
                <div className="code-editor-wrapper">
                  <div className="code-editor">
                    <textarea
                      name="content"
                      value={selectedElement.content || ''}
                      onChange={(e) => updateContent(selectedElement.id, e.target.value)}
                      placeholder="Enter your code here..."
                      className="settings-input code-input"
                      rows="10"
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  name="content"
                  value={selectedElement.content || ''}
                  onChange={(e) => updateContent(selectedElement.id, e.target.value)}
                  placeholder={`Enter ${selectedElement.type} content...`}
                  className="settings-input"
                  rows={selectedElement.type === 'h1' || selectedElement.type === 'h2' || 
                        selectedElement.type === 'h3' || selectedElement.type === 'h4' || 
                        selectedElement.type === 'h5' || selectedElement.type === 'h6' || 
                        selectedElement.type === 'span' ? 1 : 3}
                />
              )}
            </div>
          </CollapsibleSection>
          {selectedElement.type === 'button' && (
            <CollapsibleSection 
              title="Link Settings"
              className="link-settings-section"
              defaultExpanded={true}
            >
              <LinkSettings element={selectedElement} />
            </CollapsibleSection>
          )}
          {selectedElement.type === 'connectWalletButton' && (
            <CollapsibleSection 
              title="Wallet Settings"
              className="wallet-settings-section"
              defaultExpanded={true}
            >
              <WalletSettingsPanel />
            </CollapsibleSection>
          )}
        </div>
      );
    }

    if (selectedElement.type === 'image') {
      return (
        <div className="content-editor-container">
          <CollapsibleSection title="Image Content" defaultExpanded={true}>
            <div className="image-settings-panel">
              <div className="image-settings">
                <div className="image-preview-section">
                  <div className="image-preview-wrapper">
                    <img 
                      src={selectedElement.src || ''} 
                      alt={selectedElement.alt || ''} 
                      className="image-preview"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                      }}
                    />
                    {isUploading && (
                      <div className="upload-overlay">
                        <div className="spinner"></div>
                        <p className="progress-text">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                  <div className="image-info">
                    <p className="image-name">{selectedElement.alt || 'Image Preview'}</p>
                    <p>Click to replace image</p>
                    <button 
                      className="replace-image-button"
                      onClick={() => {
                        setIsUploading(true);
                        setUploadProgress(0);
                        const interval = setInterval(() => {
                          setUploadProgress(prev => {
                            if (prev >= 100) {
                              clearInterval(interval);
                              setIsUploading(false);
                              return 0;
                            }
                            return prev + 10;
                          });
                        }, 500);
                      }}
                    >
                      Replace Image
                    </button>
                  </div>
                </div>
                <hr />
                <div className="image-settings-group">
                  <label>Image Source</label>
                  <input
                    type="text"
                    value={selectedElement.src || ''}
                    onChange={(e) => updateConfiguration(selectedElement.id, 'src', e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="image-settings-group">
                  <label>Alt Text</label>
                  <input
                    type="text"
                    value={selectedElement.alt || ''}
                    onChange={(e) => updateConfiguration(selectedElement.id, 'alt', e.target.value)}
                    placeholder="Enter alt text"
                  />
                </div>
                <hr />
                <div className="image-settings-group">
                  <label>Width</label>
                  <input
                    type="text"
                    value={selectedElement.styles?.width || ''}
                    onChange={(e) => updateStyles(selectedElement.id, { width: e.target.value })}
                    placeholder="Enter width (e.g., 100px, 50%)"
                  />
                </div>
                <div className="image-settings-group">
                  <label>Height</label>
                  <input
                    type="text"
                    value={selectedElement.styles?.height || ''}
                    onChange={(e) => updateStyles(selectedElement.id, { height: e.target.value })}
                    placeholder="Enter height (e.g., 100px, 50%)"
                  />
                </div>
                <div className="image-settings-group">
                  <label>Object Fit</label>
                  <select
                    value={selectedElement.styles?.objectFit || 'contain'}
                    onChange={(e) => updateStyles(selectedElement.id, { objectFit: e.target.value })}
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                    <option value="scale-down">Scale Down</option>
                  </select>
                </div>
                <div className="image-settings-group">
                  <label>Border Radius</label>
                  <input
                    type="text"
                    value={selectedElement.styles?.borderRadius || ''}
                    onChange={(e) => updateStyles(selectedElement.id, { borderRadius: e.target.value })}
                    placeholder="Enter border radius (e.g., 4px, 50%)"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      );
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
              onClick={() => setSidebarViewMode('layout')}
              className={sidebarViewMode === 'layout' ? 'active' : ''}
            >
              Layout
            </button>
            <button
              onClick={() => setSidebarViewMode('elements')}
              className={sidebarViewMode === 'elements' ? 'active' : ''}
            >
              Elements
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
          />
        </div>
      )}
    </div>
  );
};

export default SideBar;
