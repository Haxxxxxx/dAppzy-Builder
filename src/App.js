import React, { useState } from 'react';
import { EditableProvider } from './context/EditableContext';
import ContentList from './components/ContentList'; 
import SideBar from './components/SideBar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import Topbar from './components/TopBar';
import { exportFiles } from './utils/ExportContent';
import LeftBar from './components/LeftBar';

function App() {
  const [isSideBarVisible, setIsSideBarVisible] = useState(false);

  const handleExport = (elements) => {
    console.log('Export function called with elements:', elements);
    exportFiles(elements);
  };

  return (
    <EditableProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="layout">
          <LeftBar onShowSidebar={() => setIsSideBarVisible(!isSideBarVisible)} />
          <div className="app">
            <Topbar onExport={handleExport} />
            <div className="content-container">
              {isSideBarVisible && (
                <div className="sidebar">
                  <SideBar />
                </div>
              )}
              <div className="main-content">
                <ContentList />
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </EditableProvider>
  );
}

export default App;
