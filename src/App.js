// builder project's App.js
import "./App.css";
import "./Root.css";
import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider, useWalletContext } from './context/WalletContext';
import Web3Provider from './context/Web3Provider';
import { SubscriptionProvider } from './context/SubscriptionContext';
import LoadingGate from './components/LoadingGate';

const PreviewPage = lazy(() => import("./PreviewPage"));
const BuilderPageLoader = lazy(() => import("./BuilderPageLoader"));
const WalletConnection = lazy(() => import("./NewLogin/WalletConnection"));

function AppContent({ userId, setUserId, projectId }) {
  const { walletAddress, isAuthReady } = useWalletContext();

  // Detect if we're in a CMS→Builder handoff (token in URL)
  const isHandoff = useMemo(() => {
    return window.location.hash.includes('token=') || new URLSearchParams(window.location.search).has('userId');
  }, []);

  // Sync userId from WalletContext when wallet auto-reconnects
  useEffect(() => {
    if (walletAddress && walletAddress !== userId && setUserId) {
      setUserId(walletAddress);
    }
  }, [walletAddress, userId, setUserId]);

  // Show branded loading gate during auth hydration
  if (!isAuthReady) {
    return (
      <LoadingGate
        message={isHandoff ? 'Redirecting to the builder...' : 'Connecting...'}
      />
    );
  }

  // If no wallet is connected after auth is ready, show the wallet connection
  if (!walletAddress) {
    return (
      <div className="app-container">
        <Suspense fallback={<LoadingGate message="Loading login..." />}>
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
      <Web3Provider>
        <SubscriptionProvider>
          <Suspense fallback={<LoadingGate message="Loading your project..." />}>
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
