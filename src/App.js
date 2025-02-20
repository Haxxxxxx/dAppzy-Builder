import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PreviewPage from "./PreviewPage";
import BuilderPage from "./BuilderPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="/:userId/:projectName" element={<PreviewPage />} />
        <Route path="/:customUrl" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
