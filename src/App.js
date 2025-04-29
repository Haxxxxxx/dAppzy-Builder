// builder project's App.js
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PreviewPage from "./PreviewPage";
import BuilderPageLoader from "./BuilderPageLoader";
import { WalletProvider } from './context/WalletContext';
import { DappWalletProvider } from './context/DappWalletContext';
import Web3Provider from './context/Web3Provider';
import { EditableProvider } from './context/EditableContext';

function App({ userId, setUserId, projectId }) {
  return (
    <Router>
      <EditableProvider>
        <WalletProvider>
          <DappWalletProvider>
            <Web3Provider>
              <Routes>
                <Route path="/" element={<BuilderPageLoader userId={userId} setUserId={setUserId} projectId={projectId} />} />
                <Route path="/:userId/ProjectRef/:projectId/:projectName" element={<PreviewPage />} />
                <Route path="/:customUrl" element={<PreviewPage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/export" element={<PreviewPage />} />
              </Routes>
            </Web3Provider>
          </DappWalletProvider>
        </WalletProvider>
      </EditableProvider>
    </Router>
  );
}

export default App;
