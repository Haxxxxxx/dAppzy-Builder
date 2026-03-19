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
  isAudio = false,
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

  const handleUrlChange = (e) => {
    const newSrc = e.target.value;
    if (selectedElement) {
      updateStyles(selectedElement.id, { src: newSrc });
    }
  };

  const handlePosterChange = (e) => {
    const newPoster = e.target.value;
    if (selectedElement) {
      updateStyles(selectedElement.id, { poster: newPoster });
    }
  };

  const videoPoster = selectedElement?.styles?.poster || "";

  return (
    <div className="video-settings-wrapper">
      <div className="video-preview-section">
        {isAudio ? (
          <>
            <audio src={videoSrc} className="audio-preview" controls style={{ width: '100%' }} />
            <p>{(videoSrc || "placeholder.mp3").split("/").pop()}</p>
          </>
        ) : (
          <>
            <div className="video-preview-wrapper">
              <video
                src={`${videoSrc}#t=${videoStartTime}`}
                poster={videoPoster || undefined}
                className="video-preview"
              />
            </div>
            <p>{(videoSrc || "placeholder.mp4").split("/").pop()}</p>
          </>
        )}
        <button onClick={handleSrcChange} className="replace-video-button">
          {isAudio ? "Replace Audio" : "Replace Video"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept={isAudio ? "audio/*" : "video/*"}
          onChange={handleFileChange}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="mediaSrc">Source URL</label>
        <input
          type="text"
          id="mediaSrc"
          value={videoSrc}
          onChange={handleUrlChange}
          placeholder={isAudio ? "https://example.com/audio.mp3" : "https://example.com/video.mp4"}
        />
      </div>
      {!isAudio && (
        <div className="settings-group">
          <label htmlFor="videoPoster">Poster Image</label>
          <input
            type="text"
            id="videoPoster"
            value={videoPoster}
            onChange={handlePosterChange}
            placeholder="https://example.com/poster.jpg"
          />
        </div>
      )}
      {!isAudio && (
        <>
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
        </>
      )}
      <div className="settings-group">
        <label htmlFor="videoAlt">Alt Text</label>
        <input
          type="text"
          id="videoAlt"
          value={videoAlt}
          onChange={handleAltChange}
        />
      </div>
      {!isAudio && (
        <div className="settings-group">
          <label htmlFor="videoStartTime">Start Time (seconds)</label>
          <input
            type="number"
            id="videoStartTime"
            value={videoStartTime}
            onChange={handleStartTimeChange}
          />
        </div>
      )}
    </div>
  );
};

export default VideoSettings;
