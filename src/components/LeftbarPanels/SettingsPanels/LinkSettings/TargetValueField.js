// src/components/LeftbarPanels/TargetValueField.js
import React, { useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../firebase";

const TargetValueField = ({
  actionType,
  targetValue,
  onChange,
  updateStyles,
  settings = {}
}) => {
  // Video analysis for external URLs (optional)
  const analyzeURL = (url) => {
    if (!url) return;
    try {
      const parsedURL = new URL(url);
      const hostname = parsedURL.hostname;
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        return "YouTube";
      } else if (hostname.includes("vimeo.com")) {
        return "Vimeo";
      } else if (hostname.includes("dailymotion.com")) {
        return "Dailymotion";
      } else {
        return "Unknown";
      }
    } catch (error) {
      return null;
    }
  };

  // Render field based on actionType.
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
              {/* Assuming you pass pageSections somehow */}
            </select>
          </div>
        );
      case "URL":
        const videoPlatform = analyzeURL(targetValue);
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
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type === "application/pdf") {
                  // Instead of a local preview URL, upload to Storage.
                  const downloadURL = await uploadFile(file);
                  if (downloadURL) {
                    onChange({ target: { name: "targetValue", value: downloadURL } });
                  }
                }
              }}
            >
              Drag and drop a PDF file here, or click to select
              <input
                type="file"
                accept="application/pdf"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file && file.type === "application/pdf") {
                    const downloadURL = await uploadFile(file);
                    if (downloadURL) {
                      onChange({ target: { name: "targetValue", value: downloadURL } });
                    }
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
          </div>
        );
      default:
        return null;
    }
  };

  // Helper: Upload file to Firebase Storage using the same folder as images.
  // Assumes that the userId is in sessionStorage and websiteSettings contains siteTitle.
  const uploadFile = async (file) => {
    try {
      const userId = sessionStorage.getItem("userAccount");
      const websiteSettings = JSON.parse(localStorage.getItem("websiteSettings") || "{}");
      const projectName = websiteSettings.siteTitle || "DefaultProject";
      const storagePath = `usersProjectData/${userId}/projects/${projectName}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Optional: track progress if needed.
          },
          (error) => {
            console.error("Error uploading file:", error);
            reject(null);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error in uploadFile:", error);
      return null;
    }
  };

  return <div className="settings-group">{renderField()}</div>;
};

export default TargetValueField;
