import React, { useContext, useEffect, useState } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";
import { PLACEHOLDER_IMAGES } from "../../configs/assetUrls";

const Icon = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => {} }) => {
  const { elements, updateElementProperties, setSelectedElement } = useContext(EditableContext);
  const iconElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = iconElement;

  const defaultSrc = PLACEHOLDER_IMAGES.builder;
  const [currentSrc, setCurrentSrc] = useState(iconElement.src || defaultSrc);
  const [errorMessage, setErrorMessage] = useState("");

  // Determine if this is a Material Symbol (text content) or an image icon
  const materialIconName = iconElement.content || '';
  const isMaterialIcon = materialIconName && !materialIconName.startsWith('http') && !materialIconName.startsWith('data:') && !materialIconName.startsWith('blob:');

  useEffect(() => {
    if (iconElement.src && iconElement.src !== currentSrc) {
      setCurrentSrc(iconElement.src);
    }
  }, [iconElement.src, currentSrc]);

  // Only allow icons and images
  const isValidIcon = (item) => {
    if (!item || !item.src) return false;
    return item.mediaType === "icon" || item.mediaType === "image";
  };

  // Custom error messages
  const getFileErrorMessage = (mediaType) => {
    switch (mediaType) {
      case "video":
        return "Videos cannot be used as icons.";
      case "file":
        return "Document files cannot be used as icons.";
      default:
        return "Only icon files are allowed.";
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "mediaItem",
    drop: (item) => {
      if (isValidIcon(item)) {
        updateElementProperties(id, { src: item.src, content: '' });
        setCurrentSrc(item.src);
        setSelectedElement({ ...iconElement, id, type: "icon", src: item.src, content: '' });
        setErrorMessage("");
      } else {
        setErrorMessage(getFileErrorMessage(item.mediaType));
        setTimeout(() => setErrorMessage(""), 5000);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ ...iconElement, id, type: "icon", src: currentSrc });
  };

  // Render a Material Symbol span
  if (isMaterialIcon) {
    return (
      <>
        <span
          id={id}
          ref={drop}
          onClick={handleSelect}
          className="material-symbols-outlined"
          style={{
            fontSize: styles.maxWidth ? parseInt(styles.maxWidth, 10) + 'px' : (styles.fontSize || customStyles.fontSize || '40px'),
            color: styles.color || customStyles.color || 'inherit',
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: styles.maxWidth || customStyles.width || 'auto',
            height: styles.maxHeight || customStyles.height || 'auto',
            borderRadius: styles.borderRadius || customStyles.borderRadius || 'none',
            border: isOver ? "2px dashed green" : "none",
            userSelect: "none",
          }}
        >
          {materialIconName}
        </span>
        {errorMessage && (
          <div
            style={{
              position: "absolute",
              bottom: -30,
              background: "rgba(255, 0, 0, 0.8)",
              color: "white",
              fontSize: "12px",
              padding: "6px",
              borderRadius: "4px",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {errorMessage}
          </div>
        )}
      </>
    );
  }

  // Render as an image icon (original behavior)
  return (
    <>
      <img
        id={id}
        ref={drop}
        onClick={handleSelect}
        src={currentSrc}
        alt={styles.alt || "Editable icon"}
        loading="lazy"
        style={{
          width: styles.width || customStyles.width || "auto",
          height: styles.height || customStyles.height || "auto",
          objectFit: styles.objectFit || "contain",
          borderRadius: styles.borderRadius || customStyles.borderRadius || "none",
          maxWidth: styles.maxWidth || "40px",
          maxHeight: styles.maxHeight || "40px",
          border: isOver ? "2px dashed green" : "none",
          position: "relative",
          cursor: "pointer",
          display: "inline-flex"
        }}
      />

      {errorMessage && (
        <div
          style={{
            position: "absolute",
            bottom: -30,
            background: "rgba(255, 0, 0, 0.8)",
            color: "white",
            fontSize: "12px",
            padding: "6px",
            borderRadius: "4px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {errorMessage}
        </div>
      )}
    </>
  );
};

export default Icon;
