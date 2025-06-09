// builder project's App.js
import "./App.css";
import "./Root.css";
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PreviewPage from "./PreviewPage";
import BuilderPageLoader from "./BuilderPageLoader";
import { WalletProvider, useWalletContext } from './context/WalletContext';
import { DappWalletProvider } from './context/DappWalletContext';
import Web3Provider from './context/Web3Provider';
import { EditableProvider } from './context/EditableContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import WalletConnection from "./NewLogin/WalletConnection";

function AppContent({ userId, setUserId, projectId }) {
  const { walletAddress } = useWalletContext();
  // If no wallet is connected, show the wallet connection component
  if (!walletAddress) {
    return (
      <div className="app-container">
        <WalletConnection
          onUserLogin={(walletKey) => {
            if (setUserId) {
              setUserId(walletKey);
            }
          }}
        />
      </div>
    );
  }

  return (
    <Router>
      <EditableProvider>
          <DappWalletProvider>
            <Web3Provider>
            <SubscriptionProvider>
              <Routes>
                <Route path="/" element={<BuilderPageLoader userId={userId} setUserId={setUserId} projectId={projectId} />} />
                <Route path="/:userId/ProjectRef/:projectId/:projectName" element={<PreviewPage />} />
                <Route path="/:customUrl" element={<PreviewPage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/export" element={<PreviewPage />} />
              </Routes>
            </SubscriptionProvider>
            </Web3Provider>
          </DappWalletProvider>
      </EditableProvider>
    </Router>
  );
}

function App(props) {
  return (
    <WalletProvider>
      <AppContent {...props} />
    </WalletProvider>
  );
}

export default App;
