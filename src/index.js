import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { EditableProvider } from './context/EditableContext';

const RootComponent = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userAccount");
    console.log("Fetched userId from sessionStorage:", storedUserId);
    setUserId(storedUserId);
  }, []);

  return (
    <React.StrictMode>
      <EditableProvider userId={userId}>
        <App userId={userId} setUserId={setUserId} />
      </EditableProvider>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);

reportWebVitals();
