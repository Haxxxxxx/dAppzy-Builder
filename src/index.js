import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { EditableProvider } from './context/EditableContext';
import Web3Provider from './context/Web3Provider';

const RootComponent = () => {
  const [userId, setUserId] = useState(null);
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUserId = params.get("userId");
    const queryProjectId = params.get("projectId");

    if (queryUserId) {
      setUserId(queryUserId);
      setProjectId(queryProjectId); // Set projectId from query params
      sessionStorage.setItem("userAccount", queryUserId);
    } else {
      const storedUserId = sessionStorage.getItem("userAccount");
      if (storedUserId) {
        setUserId(storedUserId);
        // Optionally, you can retrieve a stored projectId if needed.
      }
    }
  }, []);

  console.log(projectId);

  return (
    <React.StrictMode>
      <EditableProvider userId={userId}>
        <Web3Provider>
          <App userId={userId} setUserId={setUserId} projectId={projectId} />
        </Web3Provider>
      </EditableProvider>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);

reportWebVitals();
