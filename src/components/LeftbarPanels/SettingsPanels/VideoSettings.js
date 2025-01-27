import React, { useState, useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import './css/VideoSettings.css';
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const VideoSettingsPanel = () => {
    const { selectedElement, updateStyles } = useContext(EditableContext);
    const [videoId, setVideoId] = useState('');
    const [videoSrc, setVideoSrc] = useState('');
    const [videoWidth, setVideoWidth] = useState('');
    const [videoHeight, setVideoHeight] = useState('');
    const [videoAlt, setVideoAlt] = useState('');
    const [videoStartTime, setVideoStartTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isAutoplay, setIsAutoplay] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const fileInputRef = useRef(null);

    // Fetch video metadata (dimensions)
    const fetchVideoProperties = (src) => {
        if (!src) return;

        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            setVideoWidth(video.videoWidth + 'px');
            setVideoHeight(video.videoHeight + 'px');
        };
        video.src = src;
    };

    useEffect(() => {
        if (selectedElement?.type === 'video') {
            const { id, styles = {} } = selectedElement;
            setVideoId(id || 'No ID');
            setVideoSrc(styles.src || 'https://www.w3schools.com/html/mov_bbb.mp4');
            setVideoAlt(styles.alt || 'Default video description');
            setVideoStartTime(styles.startTime || 0);
            setIsMuted(styles.muted || false);
            setIsAutoplay(styles.autoplay || false);
            setShowControls(styles.controls ?? true);
            fetchVideoProperties(styles.src || 'https://www.w3schools.com/html/mov_bbb.mp4');
        }
    }, [selectedElement]);

    // Handle file upload
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

    // Handle dimension updates
    const handleDimensionChange = (e, dimensionType) => {
        const value = e.target.value.endsWith('px') ? e.target.value : e.target.value + 'px';

        if (dimensionType === 'width') {
            setVideoWidth(value);
            if (selectedElement) {
                updateStyles(selectedElement.id, { width: value });
            }
        } else if (dimensionType === 'height') {
            setVideoHeight(value);
            if (selectedElement) {
                updateStyles(selectedElement.id, { height: value });
            }
        }
    };

    // Handle alt text updates
    const handleAltChange = (e) => {
        const newAlt = e.target.value;
        setVideoAlt(newAlt);

        if (selectedElement) {
            updateStyles(selectedElement.id, { alt: newAlt });
        }
    };

    // Handle video start time
    const handleStartTimeChange = (e) => {
        const newStartTime = parseInt(e.target.value, 10) || 0;
        setVideoStartTime(newStartTime);

        if (selectedElement) {
            updateStyles(selectedElement.id, { startTime: newStartTime });
        }
    };

    // Handle playback options
    const handlePlaybackChange = (setting, value) => {
        if (selectedElement) {
            updateStyles(selectedElement.id, { [setting]: value });
        }

        if (setting === 'muted') setIsMuted(value);
        if (setting === 'autoplay') setIsAutoplay(value);
        if (setting === 'controls') setShowControls(value);
    };

    // Input class for empty/filled styles
    const getInputClass = (value) => (value ? 'filled' : 'empty');

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
                    className={`settings-input ${getInputClass(videoId)}`}
                />
            </div>

            <hr />

            {/* Video Settings */}
            <CollapsibleSection title="Video Settings">
            <div className='video-settings-wrapper'>
                <div className="video-preview-section">
                    <div className="video-preview-wrapper">
                        <video
                            src={`${videoSrc}#t=${videoStartTime}`}
                            controls={showControls}
                            muted={isMuted}
                            autoPlay={isAutoplay}
                            className="video-preview"
                        />
                    </div>
                    <p>{(videoSrc || 'placeholder.mp4').split('/').pop()}</p>
                    <button onClick={handleSrcChange} className="replace-video-button">
                        Replace Video
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
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
                        onChange={(e) => setVideoWidth(e.target.value)}
                        onBlur={(e) => handleDimensionChange(e, 'width')}
                        className={`settings-input ${getInputClass(videoWidth)}`}
                    />
                </div>
                <div className="settings-group">
                    <label htmlFor="videoHeight">Height</label>
                    <input
                        type="text"
                        id="videoHeight"
                        value={videoHeight}
                        onChange={(e) => setVideoHeight(e.target.value)}
                        onBlur={(e) => handleDimensionChange(e, 'height')}
                        className={`settings-input ${getInputClass(videoHeight)}`}
                    />
                </div>
                <div className="settings-group">
                    <label htmlFor="videoAlt">Alt Text</label>
                    <input
                        type="text"
                        id="videoAlt"
                        value={videoAlt}
                        onChange={handleAltChange}
                        className={`settings-input ${getInputClass(videoAlt)}`}
                        placeholder="Video Alt"
                    />
                </div>
                <div className="settings-group">
                    <label htmlFor="videoStartTime">Start Time (seconds)</label>
                    <input
                        type="number"
                        id="videoStartTime"
                        value={videoStartTime}
                        onChange={handleStartTimeChange}
                        className={`settings-input ${getInputClass(videoStartTime)}`}
                    />
                </div>
                </div>
            </CollapsibleSection>

            {/* Playback Settings */}
            <CollapsibleSection title="Playback Settings">
                <div className='playback-settings-wrapper'>
                    <div className="settings-group playback-settings">
                        <label>
                            <input
                                type="checkbox"
                                checked={isMuted}
                                onChange={(e) => handlePlaybackChange('muted', e.target.checked)}
                            />
                            <span className="custom-checkbox"></span>
                            <span>Mute</span>
                            
                        </label>
                    </div>
                    <div className="settings-group playback-settings">
                        <label>
                            <input
                                type="checkbox"
                                checked={isAutoplay}
                                onChange={(e) => handlePlaybackChange('autoplay', e.target.checked)}
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
                                onChange={(e) => handlePlaybackChange('controls', e.target.checked)}
                            />
                            <span className="custom-checkbox"></span>
                            Show Player Controls
                        </label>
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default VideoSettingsPanel;
