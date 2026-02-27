import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { EditableProvider } from './context/EditableContext';
import { AutoSaveProvider } from './context/AutoSaveContext';
import Web3Provider from './context/Web3Provider';

const RootComponent = () => {
  const [userId, setUserId] = useState(() => {
    // Initialize from sessionStorage only — wallet connection sets the real userId
    return sessionStorage.getItem("userAccount") || null;
  });
  
  const [projectId, setProjectId] = useState(() => {
    // Initialize from URL params
    const params = new URLSearchParams(window.location.search);
    return params.get("projectId") || null;
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUserData = () => {
      try {
        // projectId can still be passed via URL for deep-linking
        const params = new URLSearchParams(window.location.search);
        const queryProjectId = params.get("projectId");
        if (queryProjectId) {
          setProjectId(queryProjectId);
        }

        const storedUserId = sessionStorage.getItem("userAccount");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error initializing user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <React.StrictMode>
      <EditableProvider userId={userId}>
        <AutoSaveProvider userId={userId} projectId={projectId}>
          <Web3Provider>
            <App userId={userId} setUserId={setUserId} projectId={projectId} />
          </Web3Provider>
        </AutoSaveProvider>
      </EditableProvider>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);

reportWebVitals();
