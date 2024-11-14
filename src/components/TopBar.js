import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext'; // Correct path to the context

const Topbar = ({ onExport }) => {
  const { elements } = useContext(EditableContext); // Access elements here

  const handleExportClick = () => {
    if (onExport) {
      console.log('Exporting elements:', elements); // Check if elements have data
      onExport(elements); // Pass elements to the export function
    } else {
      console.error('Export function is not defined');
    }
  };

  return (
    <div style={styles.topbar}>
      <h1 style={styles.title}>Content Editor</h1>
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
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Topbar;
