import React from 'react';
import './css/dropzone.css';

/**
 * Visual insertion indicator rendered between children during drag-reorder.
 * Shows a purple horizontal line with a dot at the left edge.
 * Styles live in dropzone.css (.drop-insertion-line / .drop-insertion-line__dot).
 */
const DropInsertionLine = ({ style }) => (
  <div
    data-drop-indicator="true"
    className="drop-insertion-line"
    style={style}
  >
    {/* Left dot */}
    <div className="drop-insertion-line__dot" />
  </div>
);

export default React.memo(DropInsertionLine);
