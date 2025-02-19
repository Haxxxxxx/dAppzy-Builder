import "./App.css";
import React, { useState, useEffect, useRef, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PreviewPage from "./PreviewPage"; // Import the new preview page
import BuilderPage from "./BuilderPage";
function App() {
  return (
    <Router>
      <Routes>
        {/* Builder Page */}
        <Route path="/" element={<BuilderPage />} />
        
        {/* Preview Page */}
        <Route path="/:userId/:projectName" element={<PreviewPage />} />
        
        {/* Optional: If using custom URLs */}
        <Route path="/:customUrl" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
