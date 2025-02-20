import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { EditableProvider } from './context/EditableContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

const userId = sessionStorage.getItem("userAccount");
console.log("userId in index.js:", userId);

root.render(
  <React.StrictMode>
    <EditableProvider userId={userId}>
      <App />
    </EditableProvider>
  </React.StrictMode>
);

reportWebVitals();
