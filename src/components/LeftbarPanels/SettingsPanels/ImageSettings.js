import React, { useState, useContext, useEffect, useRef } from "react";
import { EditableContext } from "../../../context/EditableContext";
import "./css/ImageSettings.css";
import CollapsibleSection from "./LinkSettings/CollapsibleSection";

// Firebase imports
import { storage, db } from "../../../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject
} from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

import { useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; // or other backend if needed

/**
 * Helper to guess if a file is an image from its extension.
 */
function isImageExtension(filename) {
  const ext = filename.toLowerCase().split(".").pop();
  const allowed = ["png","jpg","jpeg","webp","gif","svg","bmp","ico","tiff"];
  return allowed.includes(ext);
}

/**
 * Subcomponent that replicates your MediaItem structure for images.
 * Allows drag, remove, preview, and optional rename.
 */
const ExistingImageItem = ({
  item,
  editingItemId,
  editingName,
  onNameDoubleClick,
  onNameChange,
  onNameBlur,
  onNameKeyDown,
  onRemoveClick,
  onPreviewClick,
}) => {
  // If you want "drag to place in an Image block," we keep useDrag:
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "mediaItem",
    item: {
      id: item.id,
      src: item.src,
      mediaType: item.type, // "image"
    },
    canDrag: item.type === "image",
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      key={item.id}
      className={`media-item ${editingItemId === item.id ? "editing" : ""}`}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: item.type === "image" ? "grab" : "not-allowed",
      }}
    >
      <div className="media-preview">
        {item.type === "image" && <img src={item.src} alt={item.name || "Media item"} />}
        {item.type !== "image" && (
          <div className="file-preview">
            <div className="file-icon">📄</div>
            <div className="file-label">File</div>
          </div>
        )}

        <div className="overlay">
          {editingItemId === item.id ? (
            <input
              type="text"
              className="media-name-input"
              value={editingName}
              onChange={onNameChange}
              onBlur={onNameBlur}
              onKeyDown={onNameKeyDown}
              autoFocus
            />
          ) : (
            <p className="media-name" onDoubleClick={() => onNameDoubleClick(item)}>
              {item.name || "Untitled"}
            </p>
          )}
          <div className="overlay-buttons">
            <button
              className="overlay-button remove-button"
              onClick={() => onRemoveClick(item.id)}
            >
              <span className="material-symbols-outlined">delete_forever</span>
            </button>
            <button
              className="overlay-button preview-button"
              onClick={() => onPreviewClick(item)}
            >
              <span className="material-symbols-outlined">preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageSettings = () => {
  const {
    selectedElement,
    updateElementProperties,
    setSelectedElement,
    userId,
  } = useContext(EditableContext);

  // Element properties
  const [elementId, setElementId] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [altText, setAltText] = useState("My image");
  const [imageSize, setImageSize] = useState("0 MB");

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Existing images from Firebase
  const [existingImages, setExistingImages] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);

  // Inline editing states (if you want rename inside this panel)
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fileInputRef = useRef(null);

  // Retrieve project name
  const websiteSettings = JSON.parse(localStorage.getItem("websiteSettings") || "{}");
  const projectName = websiteSettings.siteTitle || "Default Project Name";

  useEffect(() => {
    if (selectedElement?.type === "image") {
      const { id, src, width, height, alt } = selectedElement;
      setElementId(id || "");
      setImageSrc(src || "https://picsum.photos/150");
      setImageWidth(width || "auto");
      setImageHeight(height || "auto");
      setAltText(alt || "My image");
      fetchImageDimensions(src || "https://picsum.photos/150");
      fetchExistingImages(); // Load existing images from Firebase
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement]);

  /**
   * 1) Fetch existing images from Firebase
   */
  const fetchExistingImages = async () => {
    if (!userId || !projectName.trim()) return;

    try {
      const folderPath = `usersProjectData/${userId}/projects/${projectName}`;
      const folderRef = ref(storage, folderPath);
      const res = await listAll(folderRef);

      const imagePromises = res.items.map(async (itemRef) => {
        // Only treat it as image if extension matches
        if (isImageExtension(itemRef.name)) {
          const url = await getDownloadURL(itemRef);
          return {
            id: itemRef.name,
            name: itemRef.name,
            src: url,
            type: "image",
          };
        }
        return null;
      });

      const allImages = await Promise.all(imagePromises);
      setExistingImages(allImages.filter(Boolean));
    } catch (error) {
      console.error("Error fetching existing images:", error);
    }
  };

  /**
   * 2) Check actual dimension
   */
  const fetchImageDimensions = (src) => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      setImageWidth(img.width + "px");
      setImageHeight(img.height + "px");
    };
    img.src = src;
  };

  /**
   * 3) Replace or upload new image
   */
  const handleReplaceImage = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    setImageSize(fileSizeMB);

    if (!projectName || projectName.trim() === "") {
      alert("Please set a project name before uploading images.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storagePath = `usersProjectData/${userId}/projects/${projectName}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setIsUploading(false);
        },
        async () => {
          // On successful upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);
          setImageSrc(downloadURL);

          // Update selected element
          if (selectedElement) {
            updateElementProperties(selectedElement.id, {
              src: downloadURL,
              content: downloadURL,
            });
            localStorage.setItem(`image-${selectedElement.id}`, downloadURL);
            setSelectedElement({ ...selectedElement, src: downloadURL });
          }

          // Save metadata in Firestore (optional)
          try {
            await addDoc(collection(db, "images"), {
              userId,
              projectName,
              fileName: file.name,
              imageUrl: downloadURL,
              createdAt: new Date(),
            });
            console.log("Uploaded metadata to Firestore");
          } catch (firestoreError) {
            console.error("Firestore error:", firestoreError);
          }

          // Optionally add to media panel
          if (window.addToMediaPanel) {
            window.addToMediaPanel({
              id: Date.now(),
              type: "image",
              name: file.name,
              src: downloadURL,
            });
          }

          setIsUploading(false);
          setUploadProgress(0);

          // Re-fetch existing images so new one appears in the gallery
          fetchExistingImages();
        }
      );
    } catch (err) {
      console.error("Error uploading file:", err);
      setIsUploading(false);
    }
  };

  /**
   * 4) dimension/alt text changes
   */
  const handleDimensionChange = (e, dimensionType) => {
    const rawValue = e.target.value.trim();
    if (!rawValue) return;
    const value = rawValue.endsWith("px") ? rawValue : `${rawValue}px`;
    if (dimensionType === "width") {
      setImageWidth(value);
    } else if (dimensionType === "height") {
      setImageHeight(value);
    }
  };
  const handleAltTextChange = (e) => {
    setAltText(e.target.value);
  };

  /**
   * 5) Remove from Firebase (for existing images)
   */
  const handleRemoveClick = async (itemId) => {
    const img = existingImages.find((x) => x.id === itemId);
    if (!img) return;

    try {
      const itemRef = ref(
        storage,
        `usersProjectData/${userId}/projects/${projectName}/${img.name}`
      );
      await deleteObject(itemRef);
      console.log("Deleted from Firebase:", img.name);

      // Update local state
      setExistingImages((prev) => prev.filter((x) => x.id !== itemId));
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }
  };

  /**
   * 6) Preview an existing image from gallery
   */
  const handlePreviewClick = (item) => {
    setPreviewItem(item);
  };
  const closePreviewModal = () => setPreviewItem(null);

  /**
   * 7) Rename logic (optional) - only local rename in this example
   */
  const handleNameDoubleClick = (item) => {
    setEditingItemId(item.id);
    setEditingName(item.name || "");
  };
  const handleNameChange = (e) => setEditingName(e.target.value);
  const handleNameBlur = () => {
    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === editingItemId ? { ...img, name: editingName } : img
      )
    );
    setEditingItemId(null);
    setEditingName("");
  };
  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameBlur();
    }
  };

  return (
    // Wrap with DndProvider if you want drag-and-drop to work here
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
            {/* ==== Image Preview & Upload Progress ==== */}
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
                <button onClick={handleReplaceImage} className="replace-image-button">
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

            {/* ==== Dimension Inputs ==== */}
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

        {/* ==== Gallery of Existing Images (structured like your MediaItem) ==== */}
        {existingImages.length > 0 && (
          <CollapsibleSection title={"Select Existing Image"}>
            <div className="media-grid">
              {existingImages.map((item) => (
                <ExistingImageItem
                  key={item.id}
                  item={item}
                  editingItemId={editingItemId}
                  editingName={editingName}
                  onNameDoubleClick={handleNameDoubleClick}
                  onNameChange={handleNameChange}
                  onNameBlur={handleNameBlur}
                  onNameKeyDown={handleNameKeyDown}
                  onRemoveClick={handleRemoveClick}
                  onPreviewClick={handlePreviewClick}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Preview Modal for existing images */}
        {previewItem && (
          <div className="preview-modal" onClick={closePreviewModal}>
            <div className="preview-content" onClick={(e) => e.stopPropagation()}>
              <img src={previewItem.src} alt={previewItem.name} />
              <button className="close-button" onClick={closePreviewModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
  );
};

export default ImageSettings;
