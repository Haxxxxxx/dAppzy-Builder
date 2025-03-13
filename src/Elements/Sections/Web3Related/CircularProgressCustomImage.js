import React from 'react';
import { Image } from '../../SelectableElements'; // adjust path as needed
import CircularProgressSVG from './CircularProgressSVG'; // adjust path as needed

const CircularProgressCustomImage = ({
  id,
  progress,
  customStyles = {},
  src,
  styles = {},
  handleOpenMediaPanel = () => {},
  marginSize = 10, // How many pixels of margin around the circle
}) => {
  // 1) Determine overall size from props (defaults to 150px).
  const containerWidth = parseInt(styles.width || customStyles.width || '150', 10);
  const containerHeight = parseInt(styles.height || customStyles.height || '150', 10);
  const outerSize = Math.min(containerWidth, containerHeight);

  // 2) Outer container: a circle with a semi‑transparent white background.
  //    This is your "margin" area.
  const outerContainerStyle = {
    position: 'relative',
    width: `${outerSize}px`,
    height: `${outerSize}px`,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi‑transparent white
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // 3) Inner container: also a circle, but smaller by marginSize * 2.
  //    It holds the actual image + progress ring.
  const innerSize = outerSize - marginSize * 2;
  const innerContainerStyle = {
    position: 'relative',
    width: `${innerSize}px`,
    height: `${innerSize}px`,
    borderRadius: '50%',
    overflow: 'hidden', // so the image remains circular
  };

  // 4) Force the image to fill the inner circle with a circular crop.
  const forcedImageStyles = {
    ...styles,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  };

  return (
    <div style={outerContainerStyle}>
      <div style={innerContainerStyle}>
        {/* 
          The custom Image component with drag-and-drop logic.
          We pass forcedImageStyles to ensure it's circular and covers the container.
        */}
        <Image
          id={id}
          src={src}
          styles={forcedImageStyles}
          handleOpenMediaPanel={handleOpenMediaPanel}
        />

        {/* 
          Overlay the circular progress ring, 
          with pointerEvents='none' so it doesn't block drag/drop on the image.
        */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${innerSize}px`,
            height: `${innerSize}px`,
            pointerEvents: 'none',
          }}
        >
          <CircularProgressSVG
            progress={progress}
            size={innerSize}   // The progress ring is sized to the inner circle
            strokeWidth={10}   // Adjust ring thickness as desired
          />
        </div>
      </div>
    </div>
  );
};

export default CircularProgressCustomImage;
