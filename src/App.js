// src/App.js
import React from 'react';
import { EditableProvider } from './context/EditableContext';
import ContentList from './Texts/ContentList';
import SideBar from './components/SideBar';
import './App.css';

function App() {
  return (
    <EditableProvider>
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
    </EditableProvider>
  );
}

export default App;
