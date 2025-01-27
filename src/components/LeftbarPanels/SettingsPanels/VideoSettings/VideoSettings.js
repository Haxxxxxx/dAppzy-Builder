import React from "react";

const VideoSettings = ({
  videoSrc,
  videoWidth,
  videoHeight,
  videoAlt,
  videoStartTime,
  handleSrcChange,
  handleFileChange,
  updateStyles,
  selectedElement,
  fileInputRef,
}) => {
  const handleDimensionChange = (e, dimensionType) => {
    const value = e.target.value.endsWith("px") ? e.target.value : e.target.value + "px";

    if (dimensionType === "width") {
      updateStyles(selectedElement.id, { width: value });
    } else if (dimensionType === "height") {
      updateStyles(selectedElement.id, { height: value });
    }
  };

  const handleAltChange = (e) => {
    const newAlt = e.target.value;
    updateStyles(selectedElement.id, { alt: newAlt });
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = parseInt(e.target.value, 10) || 0;
    updateStyles(selectedElement.id, { startTime: newStartTime });
  };

  return (
    <div className="video-settings-wrapper">
      <div className="video-preview-section">
        <div className="video-preview-wrapper">
          <video
            src={`${videoSrc}#t=${videoStartTime}`}
            className="video-preview"
          />
        </div>
        <p>{(videoSrc || "placeholder.mp4").split("/").pop()}</p>
        <button onClick={handleSrcChange} className="replace-video-button">
          Replace Video
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="video/*"
          onChange={handleFileChange}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="videoWidth">Width</label>
        <input
          type="text"
          id="videoWidth"
          value={videoWidth}
          onChange={(e) => handleDimensionChange(e, "width")}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="videoHeight">Height</label>
        <input
          type="text"
          id="videoHeight"
          value={videoHeight}
          onChange={(e) => handleDimensionChange(e, "height")}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="videoAlt">Alt Text</label>
        <input
          type="text"
          id="videoAlt"
          value={videoAlt}
          onChange={handleAltChange}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="videoStartTime">Start Time (seconds)</label>
        <input
          type="number"
          id="videoStartTime"
          value={videoStartTime}
          onChange={handleStartTimeChange}
        />
      </div>
    </div>
  );
};

export default VideoSettings;
