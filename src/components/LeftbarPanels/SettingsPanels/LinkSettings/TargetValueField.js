import React, { useEffect, useState, useContext } from "react";
import { EditableContext } from "../../../../context/EditableContext";

const TargetValueField = ({
  actionType,
  targetValue,
  onChange,
  updateStyles,
  settings = {}
}) => {
  const { elements } = useContext(EditableContext);
  const [videoPlatform, setVideoPlatform] = useState(null);

  // Video analysis for external URLs (optional)
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
      setVideoPlatform(null);
    }
  };

  useEffect(() => {
    if (actionType === "URL") {
      analyzeURL(targetValue);
    }
  }, [targetValue, actionType]);

  // Get all the available page sections.
  const pageSections = elements.filter(
    (el) => el.type === "hero" || el.type === "cta" || el.type === "footer"
  );

  const renderField = () => {
    switch (actionType) {
      case "pageSection":
        return (
          <div>
            <select
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              className="settings-input"
              style={{ width: "100%" }}
            >
              <option value="">Select a page section</option>
              {pageSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label || section.content || section.id}
                </option>
              ))}
            </select>
          </div>
        );
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
          </div>
        );
      case "file":
        return (
          <div>
            {/* Dropzone / file selector */}
            <div
              style={{
                border: "2px dashed #ccc",
                padding: "16px",
                textAlign: "center",
                marginBottom: "8px",
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type === "application/pdf") {
                  const previewUrl = URL.createObjectURL(file);
                  // Update targetValue with the local URL
                  onChange({ target: { name: "targetValue", value: previewUrl } });
                }
              }}
            >
              Drag and drop a PDF file here, or click to select
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.type === "application/pdf") {
                    const previewUrl = URL.createObjectURL(file);
                    onChange({ target: { name: "targetValue", value: previewUrl } });
                  }
                }}
                style={{ display: "none" }}
                id="pdfUploadInput"
              />
              <label
                htmlFor="pdfUploadInput"
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              >
                Browse Files
              </label>
            </div>
            {/* Preview for PDF files */}
            {targetValue && (
              <div style={{ marginTop: "8px" }}>
                <embed src={targetValue} type="application/pdf" width="100%" height="200px" />
              </div>
            )}
            {/* Checkbox for "Open in new tab" */}
            {/* <div className="settings-group target-blank">
              <label>
                <input
                  type="checkbox"
                  name="openInNewTab"
                  checked={settings.openInNewTab || false}
                  onChange={onChange}
                />
                &nbsp;Open in new tab
              </label>
            </div> */}
          </div>
        );
      default:
       
    }
  };

  return <div className="settings-group">{renderField()}</div>;
};

export default TargetValueField;
