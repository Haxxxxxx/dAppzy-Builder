// src/components/SettingsPanels/ImageSettings.js
import React, { useState, useContext, useEffect, useRef } from "react";
import { EditableContext } from "../../../context/EditableContext";
import "./css/ImageSettings.css";
import CollapsibleSection from "./LinkSettings/CollapsibleSection";

// Firebase storage and Firestore
import { storage, db } from "../../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const ImageSettings = () => {
  const {
    selectedElement,
    updateElementProperties,
    setSelectedElement,
    userId,
  } = useContext(EditableContext);

  const [elementId, setElementId] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [altText, setAltText] = useState("");
  const [imageSize, setImageSize] = useState("0 MB");

  // New state for upload animation
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Get the project name from websiteSettings in localStorage.
  const websiteSettings = JSON.parse(localStorage.getItem("websiteSettings") || "{}");
  const projectName = websiteSettings.siteTitle || "Default Project Name";
  console.log("Project name:", projectName);

  const fetchImageProperties = (src) => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      setImageWidth(img.width + "px");
      setImageHeight(img.height + "px");
    };
    img.src = src;
  };

  useEffect(() => {
    if (selectedElement?.type === "image") {
      const { id, src, width, height, alt } = selectedElement;
      setElementId(id || "");
      setImageSrc(src || "https://picsum.photos/150");
      setImageWidth(width || "auto");
      setImageHeight(height || "auto");
      setAltText(alt || "My image");
      fetchImageProperties(src || "https://picsum.photos/150");
    }
  }, [selectedElement]);

  const handleDimensionChange = (e, dimensionType) => {
    const value = e.target.value.endsWith("px")
      ? e.target.value
      : `${e.target.value}px`;
    if (dimensionType === "width") {
      setImageWidth(value);
      // (Other style updates can be handled here as needed)
    } else if (dimensionType === "height") {
      setImageHeight(value);
      // (Other style updates can be handled here as needed)
    }
  };

  const handleAltTextChange = (e) => {
    const newAlt = e.target.value;
    setAltText(newAlt);
    // (Update alt text in element if needed)
  };

  const handleSrcChange = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    setImageSize(fileSizeMB);

    // Check if a valid project name exists.
    if (!projectName || projectName.trim() === "") {
      alert(
        "Please set a project name before uploading images. You can update this later in your Website Settings."
      );
      return;
    }

    try {
      // Start upload animation.
      setIsUploading(true);
      setUploadProgress(0);

      // Use the project name in the storage path.
      const storagePath = `usersProjectData/${userId}/projects/${projectName}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload error:", error);
          setIsUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);
            setImageSrc(downloadURL);
            if (selectedElement) {
              // Update the element's top-level src (and optionally content) with the download URL.
              updateElementProperties(selectedElement.id, {
                src: downloadURL,
                content: downloadURL,
              });
              localStorage.setItem(
                `image-${selectedElement.id}`,
                downloadURL
              );
              setSelectedElement({ ...selectedElement, src: downloadURL });
            }
            try {
              await addDoc(collection(db, "images"), {
                userId: userId,
                projectName: projectName,
                fileName: file.name,
                imageUrl: downloadURL,
                createdAt: new Date(),
              });
              console.log("Uploaded metadata to Firestore");
            } catch (firestoreError) {
              console.error("Firestore error:", firestoreError);
            }
            if (window.addToMediaPanel) {
              window.addToMediaPanel({
                id: Date.now(),
                type: "image",
                name: file.name,
                src: downloadURL,
              });
            }
            // Stop the spinner.
            setIsUploading(false);
            setUploadProgress(0);
          });
        }
      );
    } catch (err) {
      console.error("Error uploading file:", err);
      setIsUploading(false);
    }
  };

  return (
    <div className="image-settings-panel">
      <hr />
      <div className="settings-group">
        <label htmlFor="imageId">ID</label>
        <input
          type="text"
          id="imageId"
          value={elementId}
          readOnly
          className="settings-input"
        />
      </div>
      <hr />
      <CollapsibleSection title={"Image Settings"}>
        <div className="image-settings-group">
          <div className="image-preview-section">
            <div className="image-preview-wrapper">
              <img src={imageSrc} alt="Preview" className="image-preview" />
              {isUploading && (
                <div className="upload-overlay">
                  <div className="spinner"></div>
                  <div className="progress-text">{Math.round(uploadProgress)}%</div>
                </div>
              )}
            </div>
            <div className="image-info">
              <p>{(imageSrc || "placeholder.png").split("/").pop()}</p>
              <p>
                {imageWidth} x {imageHeight}
              </p>
              <p>{imageSize}</p>
              <button onClick={handleSrcChange} className="replace-image-button">
                Replace Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="settings-group">
            <label htmlFor="imageWidth">Width</label>
            <input
              type="text"
              id="imageWidth"
              value={imageWidth}
              onChange={(e) => setImageWidth(e.target.value)}
              onBlur={(e) => handleDimensionChange(e, "width")}
              className="settings-input"
            />
          </div>
          <div className="settings-group">
            <label htmlFor="imageHeight">Height</label>
            <input
              type="text"
              id="imageHeight"
              value={imageHeight}
              onChange={(e) => setImageHeight(e.target.value)}
              onBlur={(e) => handleDimensionChange(e, "height")}
              className="settings-input"
            />
          </div>
          <div className="settings-group">
            <label htmlFor="altText">Alt Text</label>
            <input
              type="text"
              id="altText"
              value={altText}
              onChange={handleAltTextChange}
              className="settings-input"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ImageSettings;
