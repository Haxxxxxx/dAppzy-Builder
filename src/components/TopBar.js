import React, { useContext, useState } from 'react';
import { EditableContext } from '../context/EditableContext';

const Topbar = ({ onExport, onResize }) => {
  const { elements } = useContext(EditableContext);
  const [customSize, setCustomSize] = useState('');
  const [dezoomPercent, setDezoomPercent] = useState(100); // Default to 100% for no scaling

  const handleExportClick = () => {
    if (onExport) {
      console.log('Exporting elements:', elements);
      onExport(elements);
    } else {
      console.error('Export function is not defined');
    }
  };

  const handleResize = (size) => {
    if (onResize) {
      onResize(size);

      // Calculate dezoom percentage if the content width exceeds viewport width
      const viewportWidth = window.innerWidth;
      if (size > viewportWidth) {
        const newScale = viewportWidth / size;
        const percentage = Math.round(newScale * 100);
        setDezoomPercent(percentage);
      } else {
        setDezoomPercent(100); // No scaling needed
      }
    }
  };

  const handleCustomResize = () => {
    const parsedSize = parseInt(customSize, 10);
    if (!isNaN(parsedSize)) {
      handleResize(parsedSize);
    }
  };

  return (
    <div style={styles.topbar}>
      <h1 style={styles.title}>Content Editor</h1>
      <div style={styles.resizeControls}>
        <button style={styles.resizeButton} onClick={() => handleResize(1440)}>
          Big PC
        </button>
        <button style={styles.resizeButton} onClick={() => handleResize(1200)}>
          PC
        </button>
        <button style={styles.resizeButton} onClick={() => handleResize(768)}>
          Tablet
        </button>
        <button style={styles.resizeButton} onClick={() => handleResize(375)}>
          Phone
        </button>
        <input
          type="text"
          placeholder="Custom size (px)"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          style={styles.input}
        />
        <button style={styles.resizeButton} onClick={handleCustomResize}>
          Apply
        </button>
        <span style={styles.dezoomText}>{dezoomPercent}%</span>
      </div>
      <button style={styles.button} onClick={handleExportClick}>
        Export Content
      </button>
    </div>
  );
};

const styles = {
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
  },
  title: {
    margin: 0,
  },
  resizeControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  resizeButton: {
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  dezoomText: {
    marginLeft: '10px',
    fontSize: '14px',
    color: '#333',
  },
};

export default Topbar;
