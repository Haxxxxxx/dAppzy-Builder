// builder project's App.js
import "./App.css";
import "./Root.css";
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider, useWalletContext } from './context/WalletContext';
import { DappWalletProvider } from './context/DappWalletContext';
import Web3Provider from './context/Web3Provider';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ToastProvider } from './context/ToastContext';

const PreviewPage = lazy(() => import("./PreviewPage"));
const BuilderPageLoader = lazy(() => import("./BuilderPageLoader"));
const WalletConnection = lazy(() => import("./NewLogin/WalletConnection"));

function AppContent({ userId, setUserId, projectId }) {
  const { walletAddress } = useWalletContext();
  // If no wallet is connected, show the wallet connection component
  if (!walletAddress) {
    return (
      <div className="app-container">
        <Suspense fallback={<div className="app-loading">Loading...</div>}>
          <WalletConnection
            onUserLogin={(walletKey) => {
              if (setUserId) {
                setUserId(walletKey);
              }
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <Router>
      <DappWalletProvider>
        <Web3Provider>
          <SubscriptionProvider>
            <Suspense fallback={<div className="app-loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<BuilderPageLoader userId={userId} setUserId={setUserId} projectId={projectId} />} />
                <Route path="/:userId/ProjectRef/:projectId/:projectName" element={<PreviewPage />} />
                <Route path="/:customUrl" element={<PreviewPage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/export" element={<PreviewPage />} />
              </Routes>
            </Suspense>
          </SubscriptionProvider>
        </Web3Provider>
      </DappWalletProvider>
    </Router>
  );
}

function App(props) {
  return (
    <WalletProvider>
      <ToastProvider>
        <AppContent {...props} />
      </ToastProvider>
    </WalletProvider>
  );
}

export default App;
