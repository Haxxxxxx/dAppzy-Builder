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
            const { id, src, width, height, alt } = selectedElement;
    
            setElementId(id || "");
    
            // ✅ Check if the image is in LocalStorage
            const storedImage = localStorage.getItem(`image-${id}`);
            setImageSrc(storedImage || src || "https://picsum.photos/150");
    
            setImageWidth(width || "auto"); // ✅ Set width
            setImageHeight(height || "auto"); // ✅ Set height
            setAltText(alt || "My image"); // ✅ Set alt text
    
            fetchImageProperties(storedImage || src || "https://picsum.photos/150");
        }
    }, [selectedElement]); // ✅ Ensures updates on selection change
    

    console.log(selectedElement);
    const handleDimensionChange = (e, dimensionType) => {
        const value = e.target.value.endsWith("px") ? e.target.value : `${e.target.value}px`;
    
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
            const reader = new FileReader();
            reader.onloadend = () => {
                const newSrc = reader.result; // Base64 Data URL
                setImageSrc(newSrc);
    
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
                setImageSize(fileSizeMB);
    
                // ✅ Ensure updateStyles updates the global context
                if (selectedElement) {
                    updateStyles(selectedElement.id, { src: newSrc });
    
                    // ✅ Save in LocalStorage
                    localStorage.setItem(`image-${selectedElement.id}`, newSrc);
                }
    
                // ✅ Update Media Panel
                if (window.addToMediaPanel) {
                    window.addToMediaPanel({
                        id: Date.now(),
                        type: "image",
                        name: file.name,
                        src: newSrc,
                    });
                }
            };
    
            reader.readAsDataURL(file); // Convert image to Base64
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
                            <img
                                src={imageSrc}
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
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default ImageSettings;
