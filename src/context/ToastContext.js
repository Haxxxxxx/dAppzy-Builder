import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '360px',
        }}>
          {toasts.map(toast => (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                lineHeight: '1.4',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backgroundColor:
                  toast.type === 'error' ? '#e74c3c' :
                  toast.type === 'success' ? '#27ae60' :
                  toast.type === 'warning' ? '#f39c12' :
                  '#333',
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
