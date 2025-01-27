import React from "react";

const PlaybackSettings = ({ isMuted, isAutoplay, showControls, handlePlaybackChange }) => (
  <div className="playback-settings-wrapper">
    <div className="settings-group playback-settings">
      <label>
        <input
          type="checkbox"
          checked={isMuted}
          onChange={(e) => handlePlaybackChange("muted", e.target.checked)}
        />
        <span className="custom-checkbox"></span>
        Mute
      </label>
    </div>
    <div className="settings-group playback-settings">
      <label>
        <input
          type="checkbox"
          checked={isAutoplay}
          onChange={(e) => handlePlaybackChange("autoplay", e.target.checked)}
        />
        <span className="custom-checkbox"></span>
        Autoplay
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

export default PlaybackSettings;
