import React, { useState, useContext, useEffect, useRef } from "react";
import { EditableContext } from "../../../context/EditableContext";
import "./css/ImageSettings.css";
import CollapsibleSection from "./LinkSettings/CollapsibleSection";

const ImageSettings = () => {
    const { selectedElement, updateStyles } = useContext(EditableContext);
    const [elementId, setElementId] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const [imageWidth, setImageWidth] = useState("");
    const [imageHeight, setImageHeight] = useState("");
    const [altText, setAltText] = useState("");
    const [imageSize, setImageSize] = useState("0 MB");
    const fileInputRef = useRef(null);

    const fetchImageProperties = (src) => {
        if (!src) return;

        const img = new Image();
        img.onload = () => {
            setImageWidth(img.width + "px");
            setImageHeight(img.height + "px");
            setImageSize(((img.fileSize || img.size || 0) / (1024 * 1024)).toFixed(2) + " MB");
        };
        img.src = src;
    };

    useEffect(() => {
        if (selectedElement?.type === "image") {
            const { id, styles = {} } = selectedElement;
            setElementId(id || "");
            setImageSrc(styles.src || "https://picsum.photos/150");
            setAltText(styles.alt || "My image");
            fetchImageProperties(styles.src || "https://picsum.photos/150");
        }
    }, [selectedElement, selectedElement?.styles?.src]);

    const handleDimensionChange = (e, dimensionType) => {
        const value = e.target.value.endsWith("px") ? e.target.value : e.target.value + "px";

        if (dimensionType === "width") {
            setImageWidth(value);
            if (selectedElement) {
                updateStyles(selectedElement.id, { width: value });
            }
        } else if (dimensionType === "height") {
            setImageHeight(value);
            if (selectedElement) {
                updateStyles(selectedElement.id, { height: value });
            }
        }
    };

    const handleAltTextChange = (e) => {
        const newAlt = e.target.value;
        setAltText(newAlt);

        if (selectedElement) {
            updateStyles(selectedElement.id, { alt: newAlt });
        }
    };

    const handleSrcChange = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newSrc = URL.createObjectURL(file);
            setImageSrc(newSrc);

            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
            setImageSize(fileSizeMB);

            // Update the image styles in the context
            if (selectedElement) {
                updateStyles(selectedElement.id, { src: newSrc });
            }

            // Add the uploaded image to the Media Panel
            if (window.addToMediaPanel) {
                window.addToMediaPanel({
                    id: Date.now(),
                    type: "image",
                    name: file.name,
                    src: newSrc,
                });
            }
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
                <div className="image-preview-section">
                    <div className="image-preview-wrapper">
                        <img
                            src={imageSrc || "https://picsum.photos/150"}
                            alt="Preview"
                            className="image-preview"
                        />
                    </div>
                    <div className="image-info">
                        <p>{(imageSrc || "placeholder.png").split("/").pop()}</p>
                        <p>{imageWidth} x {imageHeight}</p>
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
            </CollapsibleSection>
        </div>
    );
};

export default ImageSettings;
