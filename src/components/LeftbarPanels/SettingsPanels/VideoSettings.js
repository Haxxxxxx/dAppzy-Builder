import React, { useState, useContext, useEffect, useRef } from "react";
import { EditableContext } from "../../../context/EditableContext";
import "./css/VideoSettings.css";
import CollapsibleSection from "./LinkSettings/CollapsibleSection";
import VideoSettings from "./VideoSettings/VideoSettings";
import PlaybackSettings from "./VideoSettings/PlaybackSettings";

const VideoSettingsPanel = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const [videoId, setVideoId] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [videoWidth, setVideoWidth] = useState("");
  const [videoHeight, setVideoHeight] = useState("");
  const [videoAlt, setVideoAlt] = useState("");
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const fileInputRef = useRef(null);

  const fetchVideoProperties = (src) => {
    if (!src) return;

    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      setVideoWidth(video.videoWidth + "px");
      setVideoHeight(video.videoHeight + "px");
    };
    video.src = src;
  };

  useEffect(() => {
    if (selectedElement?.type === "video") {
      const { id, styles = {} } = selectedElement;
      setVideoId(id || "No ID");
      setVideoSrc(styles.src || "https://www.w3schools.com/html/mov_bbb.mp4");
      setVideoAlt(styles.alt || "Default video description");
      setVideoStartTime(styles.startTime || 0);
      setIsMuted(styles.muted || false);
      setIsAutoplay(styles.autoplay || false);
      setShowControls(styles.controls ?? true);
      fetchVideoProperties(styles.src || "https://www.w3schools.com/html/mov_bbb.mp4");
    }
  }, [selectedElement]);

  const handleSrcChange = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSrc = URL.createObjectURL(file);
      setVideoSrc(newSrc);

      if (selectedElement) {
        updateStyles(selectedElement.id, { src: newSrc });
      }
    }
  };

  return (
    <div className="video-settings-panel">
      <hr />
      <div className="settings-group">
        <label htmlFor="videoId">ID</label>
        <input
          type="text"
          id="videoId"
          value={videoId}
          readOnly
          className="settings-input"
        />
      </div>
      <hr />

      {/* Video Settings */}
      <CollapsibleSection title="Video Settings">
        <VideoSettings
          videoSrc={videoSrc}
          videoWidth={videoWidth}
          videoHeight={videoHeight}
          videoAlt={videoAlt}
          videoStartTime={videoStartTime}
          handleSrcChange={handleSrcChange}
          handleFileChange={handleFileChange}
          updateStyles={updateStyles}
          selectedElement={selectedElement}
          fileInputRef={fileInputRef}
        />
      </CollapsibleSection>

      {/* Playback Settings */}
      <CollapsibleSection title="Playback Settings">
        <PlaybackSettings
          isMuted={isMuted}
          isAutoplay={isAutoplay}
          showControls={showControls}
          handlePlaybackChange={(setting, value) => {
            if (selectedElement) {
              updateStyles(selectedElement.id, { [setting]: value });
            }
            if (setting === "muted") setIsMuted(value);
            if (setting === "autoplay") setIsAutoplay(value);
            if (setting === "controls") setShowControls(value);
          }}
        />
      </CollapsibleSection>
    </div>
  );
};

export default VideoSettingsPanel;
