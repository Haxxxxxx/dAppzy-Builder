// BackgroundEditor.js
import React, { useContext, useRef } from "react";
import { EditableContext } from "../context/EditableContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import ColorPicker from "../components/ColorPicker";
import "./css/BackgroundEditor.css";
import { authStorage } from "../utils/storageManager";

const BackgroundEditor = ({ pageSettings }) => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const userId = authStorage.getUserAccount() || "anonymous";
  // Assume the project name is provided as pageSettings.siteTitle.
  const projectName = pageSettings?.siteTitle || "defaultProject";
  const fileInputRef = useRef(null);

  if (!selectedElement) return null;

  // Read directly from live selectedElement — no local state needed
  const s = selectedElement.styles || {};
  const backgroundType = s.backgroundType || "none";
  const backgroundColor = s.backgroundColor && s.backgroundColor !== "" ? s.backgroundColor : "#ffffff";

  // Gradient state — read from styles
  const gradientType = s.gradientType || "linear";
  const gradientAngle = s.gradientAngle ?? 135;
  const gradientColor1 = s.gradientColor1 || "#667eea";
  const gradientColor2 = s.gradientColor2 || "#764ba2";

  // Build live gradient string
  const buildGradient = (type, angle, color1, color2) => {
    return type === "radial"
      ? `radial-gradient(circle, ${color1}, ${color2})`
      : `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  };

  // Derive backgroundUrl from styles
  let backgroundUrl = "";
  if (s.backgroundUrl) {
    backgroundUrl = s.backgroundUrl;
  } else if (s.backgroundImage && s.backgroundImage !== "none") {
    const urlMatch = s.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    backgroundUrl = urlMatch ? urlMatch[1] : "";
  }

  const handleChange = (key, value) => {
    if (key === "backgroundColor") {
      // When changing color, clear any image/gradient settings.
      updateStyles(selectedElement.id, {
        backgroundColor: value,
        backgroundImage: "none",
        background: "",
        backgroundType: "color"
      });
    }
  };

  const handleGradientChange = (updates) => {
    const next = {
      gradientType: updates.gradientType ?? gradientType,
      gradientAngle: updates.gradientAngle ?? gradientAngle,
      gradientColor1: updates.gradientColor1 ?? gradientColor1,
      gradientColor2: updates.gradientColor2 ?? gradientColor2,
    };
    const gradientValue = buildGradient(
      next.gradientType, next.gradientAngle, next.gradientColor1, next.gradientColor2
    );
    updateStyles(selectedElement.id, {
      ...next,
      background: gradientValue,
      backgroundImage: "none",
      backgroundUrl: "",
      backgroundColor: "transparent",
      backgroundType: "gradient",
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Use the same storage path as in MediaPanel:
      const storagePath = `usersProjectData/${userId}/projects/${projectName}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        () => {},
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          updateStyles(selectedElement.id, {
            backgroundImage: `url(${downloadURL})`,
            backgroundUrl: downloadURL,
            backgroundColor: "transparent",
            background: "",
            backgroundType: "image"
          });
        }
      );
    }
  };

  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearBackground = () => {
    updateStyles(selectedElement.id, {
      backgroundType: "none",
      backgroundUrl: "",
      backgroundColor: "#ffffff",
      backgroundImage: "none",
      background: ""
    });
  };

  return (
    <div className="background-editor">
      {/* COLOR PICKER */}
      <div className="editor-group">
        <label>Color</label>
        <ColorPicker
          value={backgroundColor}
          onChange={(color) => handleChange("backgroundColor", color)}
        />
      </div>

      {/* GRADIENT */}
      <div className="editor-group gradient-section">
        <label>Gradient</label>
        <div className="gradient-controls">
          <div className="gradient-row">
            <select
              value={backgroundType === "gradient" ? gradientType : "linear"}
              onChange={(e) => handleGradientChange({ gradientType: e.target.value })}
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
            {(backgroundType !== "gradient" || gradientType === "linear") && (
              <div className="gradient-angle-input">
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={gradientAngle}
                  onChange={(e) =>
                    handleGradientChange({ gradientAngle: Number(e.target.value) })
                  }
                />
                <span className="angle-unit">deg</span>
              </div>
            )}
          </div>
          <div className="gradient-colors">
            <div className="gradient-color-stop">
              <label>Start</label>
              <ColorPicker
                value={gradientColor1}
                onChange={(color) => handleGradientChange({ gradientColor1: color })}
              />
            </div>
            <div className="gradient-color-stop">
              <label>End</label>
              <ColorPicker
                value={gradientColor2}
                onChange={(color) => handleGradientChange({ gradientColor2: color })}
              />
            </div>
          </div>
          <div
            className="gradient-preview-strip"
            style={{
              background: buildGradient(
                backgroundType === "gradient" ? gradientType : "linear",
                gradientAngle,
                gradientColor1,
                gradientColor2
              ),
            }}
          />
        </div>
      </div>

      <div className="background-editor-image-preview-wrapper" >

      {/* Add Image Button & Preview */}
      <div className="editor-group image-preview">
        {backgroundType === "image" && backgroundUrl && (
          <div className="background-preview-wrapper">
            <img
              src={backgroundUrl}
              alt="Background Preview"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        )}
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      <button className="add-image-button" onClick={handleAddImageClick}>
          {backgroundUrl ? "Replace Image" : "Add an Image"} <span>+</span>
        </button>


      </div>

      {/* Image URL Input */}
      <div className="editor-group image-url-group">
        <label>Image URL</label>
        <input
          type="text"
          className="image-url-input"
          placeholder="Paste image URL or IPFS link"
          value={backgroundUrl}
          onChange={(e) => {
            const url = e.target.value;
            if (url) {
              updateStyles(selectedElement.id, {
                backgroundImage: `url(${url})`,
                backgroundUrl: url,
                backgroundColor: "transparent",
                background: "",
                backgroundType: "image"
              });
            } else {
              updateStyles(selectedElement.id, {
                backgroundImage: "none",
                backgroundUrl: "",
                backgroundType: "none"
              });
            }
          }}
        />
      </div>

      {/* Background Image Controls — only visible when an image is set */}
      {backgroundType === "image" && backgroundUrl && (
        <div className="bg-image-controls">
          <div className="editor-group">
            <label>Size</label>
            <select
              value={s.backgroundSize || "cover"}
              onChange={(e) =>
                updateStyles(selectedElement.id, { backgroundSize: e.target.value })
              }
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
              <option value="100% 100%">100% 100%</option>
            </select>
          </div>
          <div className="editor-group">
            <label>Position</label>
            <select
              value={s.backgroundPosition || "center"}
              onChange={(e) =>
                updateStyles(selectedElement.id, { backgroundPosition: e.target.value })
              }
            >
              <option value="center">Center</option>
              <option value="top center">Top Center</option>
              <option value="bottom center">Bottom Center</option>
              <option value="left center">Left Center</option>
              <option value="right center">Right Center</option>
            </select>
          </div>
          <div className="editor-group">
            <label>Repeat</label>
            <select
              value={s.backgroundRepeat || "no-repeat"}
              onChange={(e) =>
                updateStyles(selectedElement.id, { backgroundRepeat: e.target.value })
              }
            >
              <option value="no-repeat">No Repeat</option>
              <option value="repeat">Repeat</option>
              <option value="repeat-x">Repeat X</option>
              <option value="repeat-y">Repeat Y</option>
            </select>
          </div>
        </div>
      )}
      {/* (Optional) Clear Background Button */}
      {/* <button className="clear-button" onClick={handleClearBackground}>
        Clear Background
      </button> */}
    </div>
  );
};

export default BackgroundEditor;
