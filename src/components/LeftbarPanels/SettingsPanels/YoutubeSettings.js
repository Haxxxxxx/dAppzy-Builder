import React, { useState, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const YoutubeSettingsPanel = () => {
  const { selectedElement, updateContent, updateStyles } = useContext(EditableContext);
  const [videoUrl, setVideoUrl] = useState('');
  const [width, setWidth] = useState('560');
  const [height, setHeight] = useState('315');

  useEffect(() => {
    if (selectedElement?.type === 'youtubeVideo') {
      setVideoUrl(selectedElement.content || '');
      const styles = selectedElement.styles || {};
      setWidth(parseInt(styles.width, 10) || 560);
      setHeight(parseInt(styles.height, 10) || 315);
    }
  }, [selectedElement]);

  // Extract YouTube video ID from various URL formats
  const parseYouTubeUrl = (url) => {
    if (!url) return url;
    // Already an embed URL
    if (url.includes('/embed/')) return url;
    // Standard watch URL
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    return url;
  };

  const handleUrlChange = (e) => {
    const raw = e.target.value;
    setVideoUrl(raw);
  };

  const handleUrlBlur = () => {
    if (!selectedElement) return;
    const embedUrl = parseYouTubeUrl(videoUrl);
    setVideoUrl(embedUrl);
    updateContent(selectedElement.id, embedUrl);
  };

  const handleWidthChange = (e) => {
    const val = e.target.value;
    setWidth(val);
    if (selectedElement && val) {
      updateStyles(selectedElement.id, { width: val + 'px' });
    }
  };

  const handleHeightChange = (e) => {
    const val = e.target.value;
    setHeight(val);
    if (selectedElement && val) {
      updateStyles(selectedElement.id, { height: val + 'px' });
    }
  };

  const applyAspectRatio = (ratio) => {
    if (!selectedElement) return;
    const w = parseInt(width, 10) || 560;
    let h;
    if (ratio === '16:9') h = Math.round(w * 9 / 16);
    else if (ratio === '4:3') h = Math.round(w * 3 / 4);
    else h = w; // 1:1
    setHeight(h);
    updateStyles(selectedElement.id, { height: h + 'px' });
  };

  if (!selectedElement || selectedElement.type !== 'youtubeVideo') return null;

  return (
    <div className="video-settings-panel">
      <hr />
      <div className="settings-group">
        <label htmlFor="ytId">ID</label>
        <input type="text" id="ytId" value={selectedElement.id || ''} readOnly className="settings-input" />
      </div>
      <hr />

      <CollapsibleSection title="YouTube Settings">
        <div className="settings-group">
          <label>Video URL</label>
          <input
            type="text"
            value={videoUrl}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder="YouTube URL or embed URL"
            className="settings-input"
            style={{ width: '100%' }}
          />
          <small style={{ color: 'var(--not-selected, #888)', fontSize: '11px' }}>
            Paste any YouTube URL — it will auto-convert to embed format
          </small>
        </div>

        <div className="settings-group" style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label>Width (px)</label>
            <input type="number" value={width} onChange={handleWidthChange} min={100} className="settings-input" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Height (px)</label>
            <input type="number" value={height} onChange={handleHeightChange} min={50} className="settings-input" />
          </div>
        </div>

        <div className="settings-group">
          <label>Aspect Ratio</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['16:9', '4:3', '1:1'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => applyAspectRatio(ratio)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: 'var(--input-bg, #2a2a3a)',
                  border: '1px solid var(--border-color, #333)',
                  borderRadius: '4px',
                  color: 'var(--editor-text, #fff)',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default YoutubeSettingsPanel;
