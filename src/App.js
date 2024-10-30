// src/App.js
import React from 'react';
import { EditableProvider } from './context/EditableContext';
import ContentList from './Texts/ContentList';
import SideBar from './components/SideBar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

function App() {
  return (
    <EditableProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="app">
          {/* Sidebar for Editor Panel and New Element Panel */}
          <div className="sidebar">
            <SideBar />
          </div>

          {/* Main Content Area for Paragraph and Heading List */}
          <div className="main-content">
            <ContentList />
          </div>
        </div>
      </DndProvider>
    </EditableProvider>
  );
}

export default App;
