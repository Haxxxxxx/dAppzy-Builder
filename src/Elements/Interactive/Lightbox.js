import React, { useState, useCallback } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';
import { PLACEHOLDER_IMAGES } from '../../configs/assetUrls';

const DEFAULT_CONTENT = {
  images: [
    { src: PLACEHOLDER_IMAGES.builder, alt: 'Image 1' },
    { src: PLACEHOLDER_IMAGES.builder, alt: 'Image 2' },
    { src: PLACEHOLDER_IMAGES.builder, alt: 'Image 3' },
  ],
  columns: 3,
};

const Lightbox = ({ id }) => {
  const { data, styles, isSelected, handleSelect } = useInteractiveElement(id, 'lightbox');

  const parsedData = (data && typeof data === 'object' && !Array.isArray(data)) ? data : DEFAULT_CONTENT;
  const images = parsedData.images || DEFAULT_CONTENT.images;
  const columns = parsedData.columns || 3;

  const [overlayIndex, setOverlayIndex] = useState(null);

  const handleImageClick = (e, index) => {
    e.stopPropagation();
    if (isSelected) {
      // In editing mode, just keep the element selected (already selected via parent onClick)
      return;
    }
    setOverlayIndex(index);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setOverlayIndex(null);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setOverlayIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setOverlayIndex((prev) => (prev + 1) % images.length);
  };

  const navBtnStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    zIndex: 10001,
  };

  return (
    <div id={id} onClick={handleSelect}>
      {/* Thumbnail Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${Math.floor(100 / columns) > 30 ? '150px' : '100px'}, 1fr))`,
          gap: styles.gap || '8px',
          padding: styles.padding || '0',
          ...styles,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            onClick={(e) => handleImageClick(e, i)}
            style={{
              cursor: isSelected ? 'default' : 'pointer',
              aspectRatio: '1',
              overflow: 'hidden',
              borderRadius: styles.thumbnailRadius || '6px',
            }}
          >
            <img
              src={img.src || PLACEHOLDER_IMAGES.builder}
              alt={img.alt || `Image ${i + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Overlay */}
      {overlayIndex !== null && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
            }}
          >
            ✕
          </button>

          {/* Prev button */}
          <button onClick={handlePrev} style={{ ...navBtnStyle, left: '20px' }}>
            ‹
          </button>

          {/* Full-size image */}
          <img
            src={images[overlayIndex]?.src || PLACEHOLDER_IMAGES.builder}
            alt={images[overlayIndex]?.alt || ''}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '4px',
            }}
          />

          {/* Next button */}
          <button onClick={handleNext} style={{ ...navBtnStyle, right: '20px' }}>
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Lightbox;
