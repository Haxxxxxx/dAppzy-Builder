// builder project's App.js
import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PreviewPage from "./PreviewPage";
import BuilderPageLoader from "./BuilderPageLoader";
import { WalletProvider } from './context/WalletContext';
import { DappWalletProvider } from './context/DappWalletContext';
import Web3Provider from './context/Web3Provider';
import { EditableProvider } from './context/EditableContext';
import WalletConnection from "./NewLogin/WalletConnection";

function App({ userId, setUserId, projectId }) {  
  // Add error handling for userId and projectId
  useEffect(() => {
    if (!userId) {
      // Try to get userId from sessionStorage
      const storedUserId = sessionStorage.getItem("userAccount");
      if (storedUserId && setUserId) {
        setUserId(storedUserId);
      }
    }
  }, [userId, setUserId]);

  // If no userId is found, show the wallet connection component
  if (!userId) {
    return (
      <div className="app-container">
        <WalletConnection
          onUserLogin={(walletKey) => {
            if (setUserId) {
              setUserId(walletKey);
              sessionStorage.setItem("userAccount", walletKey);
            }
          }}
        />
      </div>
    );
  }

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
