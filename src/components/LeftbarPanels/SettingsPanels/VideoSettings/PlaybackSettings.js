import React from "react";

const PlaybackSettings = ({ isMuted, isAutoplay, isLoop, showControls, isAudio, handlePlaybackChange }) => {
  const handleAutoplayToggle = (checked) => {
    handlePlaybackChange("autoplay", checked);
    // Browsers require muted for autoplay — force muted on when autoplay is enabled
    if (checked) {
      handlePlaybackChange("muted", true);
    }
  };

  return (
    <div className="playback-settings-wrapper">
      {!isAudio && (
        <div className="settings-group playback-settings">
          <label>
            <input
              type="checkbox"
              checked={isMuted}
              onChange={(e) => handlePlaybackChange("muted", e.target.checked)}
              disabled={isAutoplay}
            />
            <span className="custom-checkbox"></span>
            Mute
          </label>
        </div>
      )}
      <div className="settings-group playback-settings">
        <label>
          <input
            type="checkbox"
            checked={isAutoplay}
            onChange={(e) => handleAutoplayToggle(e.target.checked)}
          />
          <span className="custom-checkbox"></span>
          Autoplay
        </label>
        {isAutoplay && (
          <p className="settings-info-note" style={{ margin: '4px 0 0 24px', fontSize: '11px', color: '#888', lineHeight: 1.3 }}>
            Muted is required for autoplay to work in most browsers.
          </p>
        )}
      </div>
      <div className="settings-group playback-settings">
        <label>
          <input
            type="checkbox"
            checked={isLoop}
            onChange={(e) => handlePlaybackChange("loop", e.target.checked)}
          />
          <span className="custom-checkbox"></span>
          Loop
        </label>
      </div>
      <div className="settings-group playback-settings">
        <label>
          <input
            type="checkbox"
            checked={showControls}
            onChange={(e) => handlePlaybackChange("controls", e.target.checked)}
          />
          <span className="custom-checkbox"></span>
          Show Player Controls
        </label>
      </div>
    </div>
  );
};

export default PlaybackSettings;
