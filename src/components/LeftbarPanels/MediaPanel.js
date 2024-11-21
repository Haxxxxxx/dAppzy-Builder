// src/components/MediaPanel.js
import React, { useState } from 'react';

const MediaPanel = () => {
  // Initial media list (could be images, videos, documents, etc.)
  const [mediaItems] = useState([
    { id: 1, type: 'image', name: 'Example Image', src: 'https://via.placeholder.com/150' },
    { id: 2, type: 'video', name: 'Example Video', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 3, type: 'file', name: 'Example File', src: 'https://example.com/sample.pdf' },
  ]);

  return (
<div className="media-panel scrollable-panel">
  <h3>Media Library</h3>
  <div className="media-list">
    {mediaItems.map((item) => (
      <div key={item.id} className="media-item">
        {item.type === 'image' && (
          <div className="media-image">
            <img src={item.src} alt={item.name} />
            <p>{item.name}</p>
          </div>
        )}
        {item.type === 'video' && (
          <div className="media-video">
            <video controls>
              <source src={item.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p>{item.name}</p>
          </div>
        )}
        {item.type === 'file' && (
          <div className="media-file">
            <a href={item.src} target="_blank" rel="noopener noreferrer">
              {item.name}
            </a>
          </div>
        )}
      </div>
    ))}
  </div>
</div>
  );
};

export default MediaPanel;
