// builder project's App.js
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from './context/WalletContext';
import PreviewPage from "./PreviewPage";
import BuilderPageLoader from "./BuilderPageLoader";

function App({ userId, setUserId, projectId }) {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BuilderPageLoader userId={userId} setUserId={setUserId} projectId={projectId} />} />
          <Route path="/:userId/ProjectRef/:projectId/:projectName" element={<PreviewPage />} />
          <Route path="/:customUrl" element={<PreviewPage />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
