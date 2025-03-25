// BackgroundEditor.js
import React, { useContext, useState, useEffect, useRef } from "react";
import { EditableContext } from "../context/EditableContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import "./css/BackgroundEditor.css";

const BackgroundEditor = ({ pageSettings }) => {
  const { selectedElement, updateStyles, userId } = useContext(EditableContext);
  // Assume the project name is provided as pageSettings.siteTitle.
  const projectName = pageSettings?.siteTitle || "defaultProject";

  // Local state holds background type, URL and color.
  const [backgroundType, setBackgroundType] = useState("none");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const fileInputRef = useRef(null);

  // Utility: Convert "rgb(r,g,b)" to "#rrggbb"
  const rgbToHex = (rgb) => {
    if (!rgb) return "#ffffff";
    const result = rgb.match(/\d+/g).map(Number);
    return `#${result.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  };

  useEffect(() => {
    if (selectedElement) {
      const styles = selectedElement.styles || {};
      setBackgroundType(styles.backgroundType || "none");
      // Try to use stored backgroundUrl, otherwise extract from backgroundImage if available.
      if (styles.backgroundUrl) {
        setBackgroundUrl(styles.backgroundUrl);
      } else if (styles.backgroundImage && styles.backgroundImage !== "none") {
        const urlMatch = styles.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        setBackgroundUrl(urlMatch ? urlMatch[1] : "");
      } else {
        setBackgroundUrl("");
      }
      setBackgroundColor(styles.backgroundColor && styles.backgroundColor !== "" ? styles.backgroundColor : "#ffffff");
    }
  }, [selectedElement]);

  const handleChange = (key, value) => {
    if (key === "backgroundColor") {
      setBackgroundColor(value);
      // When changing color, clear any image settings.
      updateStyles(selectedElement.id, {
        backgroundColor: value,
        backgroundImage: "none",
        backgroundType: "color"
      });
      setBackgroundType("color");
    }
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
        (error) => {
          console.error("Error uploading background image:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setBackgroundUrl(downloadURL);
          setBackgroundType("image");
          updateStyles(selectedElement.id, {
            backgroundImage: `url(${downloadURL})`,
            backgroundColor: "transparent",
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
    setBackgroundType("none");
    setBackgroundUrl("");
    setBackgroundColor("#ffffff");
    updateStyles(selectedElement.id, {
      backgroundType: "none",
      backgroundUrl: "",
      backgroundColor: "#ffffff",
      backgroundImage: "none"
    });
  };

  if (!selectedElement) return null;

  return (
    <div className="background-editor">
      {/* COLOR PICKER */}
      <div className="editor-group">
        <label>Color</label>
        <div className="color-group">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
          />
          <input
            type="text"
            value={backgroundColor}
            readOnly
            className="color-hex"
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
      {/* (Optional) Clear Background Button */}
      {/* <button className="clear-button" onClick={handleClearBackground}>
        Clear Background
      </button> */}
    </div>
  );
};

export default BackgroundEditor;
