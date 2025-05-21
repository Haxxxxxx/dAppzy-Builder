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
    // Initialize from URL params first, then sessionStorage
    const params = new URLSearchParams(window.location.search);
    const urlUserId = params.get("userId");
    if (urlUserId) {
      sessionStorage.setItem("userAccount", urlUserId);
      return urlUserId;
    }
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
        const params = new URLSearchParams(window.location.search);
        const queryUserId = params.get("userId");
        const queryProjectId = params.get("projectId");

        if (queryUserId) {
          setUserId(queryUserId);
          setProjectId(queryProjectId);
          sessionStorage.setItem("userAccount", queryUserId);
        } else {
          const storedUserId = sessionStorage.getItem("userAccount");
          if (storedUserId) {
            setUserId(storedUserId);
          }
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
