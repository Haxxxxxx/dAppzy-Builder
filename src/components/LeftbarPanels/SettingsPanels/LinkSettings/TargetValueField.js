import React, { useEffect, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../../../../firebase";

const TargetValueField = ({
  actionType,
  targetValue,
  onChange,
  updateStyles,
  settings = {}
}) => {
  const [pdfFiles, setPdfFiles] = useState([]);

  /**
   * Fetch all existing PDF files from Firebase in the same folder
   * that you’re using for images/media.
   */
  const fetchExistingPDFFiles = async () => {
    try {
      const userId = sessionStorage.getItem("userAccount");
      if (!userId) return;
      const websiteSettings = JSON.parse(localStorage.getItem("websiteSettings") || "{}");
      const projectName = websiteSettings.siteTitle || "DefaultProject";

      // Path to your user’s project folder
      const folderPath = `usersProjectData/${userId}/projects/${projectName}`;
      const folderRef = ref(storage, folderPath);

      // List all files in the project folder
      const res = await listAll(folderRef);

      // For each item, get a download URL and check if the file extension is PDF
      const pdfPromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const fileName = itemRef.name.toLowerCase();
        if (fileName.endsWith(".pdf")) {
          return {
            name: itemRef.name,
            src: url,
          };
        }
        return null;
      });

      const pdfResults = await Promise.all(pdfPromises);

      // Filter out nulls (non-PDF files)
      const actualPDFs = pdfResults.filter(Boolean);
      setPdfFiles(actualPDFs);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    }
  };

  /**
   * Upload file to Firebase Storage in the same folder as images.
   * Return the `downloadURL`.
   */
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
          () => {
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

  /**
   * If `actionType` is "file", load existing PDFs
   */
  useEffect(() => {
    if (actionType === "file") {
      fetchExistingPDFFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionType]);

  // Helper: Analyze the external URL and detect known social platforms.
  const analyzeURL = (url) => {
    if (!url) return;
    try {
      const parsedURL = new URL(url);
      const hostname = parsedURL.hostname.toLowerCase();
      if (hostname.includes("twitter.com")) {
        return "Twitter";
      } else if (hostname.includes("instagram.com")) {
        return "Instagram";
      }else if (hostname.includes("X.com")) {
        return "X";
      } else if (hostname.includes("facebook.com")) {
        return "Facebook";
      } else if (hostname.includes("linkedin.com")) {
        return "LinkedIn";
      } else if (hostname.includes("pinterest.com")) {
        return "Pinterest";
      } else {
        return "Unknown";
      }
    } catch (error) {
      return null;
    }
  };

  /**
   * Render different fields based on `actionType`.
   */
  
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
              {/* If you have pageSections, map them here */}
            </select>
          </div>
        );

      case "URL": {
        const platform = analyzeURL(targetValue);
        return (
          <>
            <input
              type="text"
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              placeholder="Enter external URL"
              className="settings-input"
            />
            {platform && (
              <p className="platform-info">
                {platform === "Unknown"
                  ? "Unrecognized platform."
                  : `Detected platform: ${platform}`}
              </p>
            )}
          </>
        );
      }

      case "file":
        return (
          <>
            {/* 1) Dropdown for existing PDF files */}
            <label>Select Existing PDF:</label>
            <select
              name="targetValue"
              value={targetValue}
              onChange={(e) => onChange(e)}
              className="settings-input"
              style={{ width: "100%", marginBottom: "8px" }}
            >
              <option value="">-- None --</option>
              {pdfFiles.map((pdf) => (
                <option key={pdf.src} value={pdf.src}>
                  {pdf.name}
                </option>
              ))}
            </select>

            {/* 2) Drag-and-drop / file selector for new PDFs */}
            <div
              style={{
                border: "2px dashed #ccc",
                padding: "16px",
                textAlign: "center",
                marginBottom: "8px",
                cursor: "pointer"
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type === "application/pdf") {
                  const downloadURL = await uploadFile(file);
                  if (downloadURL) {
                    onChange({ target: { name: "targetValue", value: downloadURL } });
                    // Refresh PDF list after upload
                    fetchExistingPDFFiles();
                  }
                }
              }}
            >
              Drag and drop a PDF file here
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label
                htmlFor="pdfUploadInput"
                style={{
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                }}
              >
                Or click to Browse Files
              </label>
              <input
                id="pdfUploadInput"
                type="file"
                accept="application/pdf"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file && file.type === "application/pdf") {
                    const downloadURL = await uploadFile(file);
                    if (downloadURL) {
                      onChange({ target: { name: "targetValue", value: downloadURL } });
                      fetchExistingPDFFiles();
                    }
                  }
                }}
                style={{ display: "none" }}
              />
            </div>

            {/* 3) Preview for the selected PDF file */}
            {targetValue && (
              <div style={{ marginTop: "8px" }}>
                <embed
                  src={targetValue}
                  type="application/pdf"
                  width="100%"
                  height="200px"
                />
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return <div className="settings-group">{renderField()}</div>;
};

export default TargetValueField;
