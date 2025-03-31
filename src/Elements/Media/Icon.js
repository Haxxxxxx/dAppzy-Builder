import React, { useContext, useEffect, useState } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";

const Icon = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => {} }) => {
  const { elements, updateElementProperties, setSelectedElement } = useContext(EditableContext);
  const iconElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = iconElement;

  // Default image source (used if none provided)
  const defaultSrc =
    "https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7";
  const [currentSrc, setCurrentSrc] = useState(iconElement.src || defaultSrc);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (iconElement.src && iconElement.src !== currentSrc) {
      setCurrentSrc(iconElement.src);
    }
  }, [iconElement.src, currentSrc]);

  // For now, accept both "icon" and "image" media types.
  const isValidIcon = (item) => {
    if (!item || !item.src) return false;
    return item.mediaType === "icon" || item.mediaType === "image";
  };

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
        updateElementProperties(id, { src: item.src });
        setCurrentSrc(item.src);
        setSelectedElement({ id, type: "icon", src: item.src, styles });
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
    setSelectedElement({ id, type: "icon", src: currentSrc, ...styles });
  };

  // Render the image; if a link is provided in the icon element, wrap it in an <a> tag.
  const renderImage = () => {
    const imageElement = (
      <img
        src={currentSrc}
        alt={styles.alt || "Editable icon"}
        style={{
          width: styles.width || customStyles.width || "auto",
          height: styles.height || customStyles.height || "auto",
          objectFit: styles.objectFit || "contain",
          borderRadius: styles.borderRadius || customStyles.borderRadius || "none",
          maxWidth: "40px",
          maxHeight: "40px",
        }}
      />
    );

    if (iconElement.link && iconElement.link.trim() !== "") {
      return (
        <a
          href={iconElement.link}
          target={iconElement.openInNewTab ? "_blank" : "_self"}
          onClick={(e) => {
            // Prevent the click from triggering the selection if that's not desired.
            e.stopPropagation();
          }}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          {imageElement}
        </a>
      );
    }
    return imageElement;
  };

  return (
    <>
      <div
        id={id}
        ref={drop}
        onClick={handleSelect}
        style={{
          border: isOver ? "2px dashed green" : "none",
          position: "relative",
          cursor: "pointer",
          display: "inline-flex",
        }}
        aria-label="Editable icon"
      >
        {renderImage()}
      </div>

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
