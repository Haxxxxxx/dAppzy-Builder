import React, { useEffect, useState } from "react";
import VideoSettings from "../VideoSettings/VideoSettings";
import PlaybackSettings from "../VideoSettings/PlaybackSettings";
import CollapsibleSection from "./CollapsibleSection";

const TargetValueField = ({ actionType, targetValue, onChange, updateStyles }) => {
  const [videoPlatform, setVideoPlatform] = useState(null); // Store detected platform
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const analyzeURL = (url) => {
    if (!url) {
      setVideoPlatform(null);
      return;
    }

    try {
      const parsedURL = new URL(url);
      const hostname = parsedURL.hostname;

      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        setVideoPlatform("YouTube");
      } else if (hostname.includes("vimeo.com")) {
        setVideoPlatform("Vimeo");
      } else if (hostname.includes("dailymotion.com")) {
        setVideoPlatform("Dailymotion");
      } else {
        setVideoPlatform("Unknown");
      }
    } catch (error) {
      setVideoPlatform(null); // Handle invalid URLs
    }
  };

  useEffect(() => {
    if (actionType === "URL") {
      analyzeURL(targetValue);
    }
  }, [targetValue, actionType]);

  const handlePlaybackChange = (setting, value) => {
    updateStyles({ [setting]: value });

    if (setting === "muted") setIsMuted(value);
    if (setting === "autoplay") setIsAutoplay(value);
    if (setting === "controls") setShowControls(value);
  };

  const renderField = () => {
    switch (actionType) {
      case "URL":
        return (
          <div>
            <input
              type="text"
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              placeholder="Enter external URL"
              className="settings-input"
              style={{ width: "100%" }}
            />
            {videoPlatform && (
              <p className="platform-info">
                {videoPlatform === "Unknown"
                  ? "Unrecognized platform."
                  : `Detected platform: ${videoPlatform}`}
              </p>
            )}
            {videoPlatform && videoPlatform !== "Unknown" && (
              <div className="video-settings-container">
                {/* Video Settings */}
                <CollapsibleSection title="Video Settings">

                  <VideoSettings
                    videoSrc={targetValue}
                    updateStyles={updateStyles}
                  />
                </CollapsibleSection>

                <CollapsibleSection title="Playback Settings">
                  <PlaybackSettings
                    isMuted={isMuted}
                    isAutoplay={isAutoplay}
                    showControls={showControls}
                    handlePlaybackChange={handlePlaybackChange}
                  />
                </CollapsibleSection>

              </div>
            )}
          </div>
        );
      default:
        return (
          <input
            type="text"
            name="targetValue"
            value={targetValue}
            onChange={onChange}
            placeholder="Enter value"
            className="settings-input"
          />
        );
    }
  };

  return (
    <div className="settings-group">
      {/* Conditionally display the action type */}
      {!(actionType === "URL" && videoPlatform && videoPlatform !== "Unknown") && (
        <p>{actionType}</p>
      )}
      {renderField()}
    </div>
  );

};

export default TargetValueField;
