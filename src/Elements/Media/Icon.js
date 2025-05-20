import React, { useContext, useEffect, useState } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";

const Icon = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => {} }) => {
  const { elements, updateElementProperties, setSelectedElement } = useContext(EditableContext);
  const iconElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = iconElement;

  const defaultSrc = "https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7";
  const [currentSrc, setCurrentSrc] = useState(iconElement.src || defaultSrc);
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
    <>
      <img
        id={id}
        ref={drop}
        onClick={handleSelect}
        src={currentSrc}
        alt={styles.alt || "Editable icon"}
        style={{
          width: styles.width || customStyles.width || "auto",
          height: styles.height || customStyles.height || "auto",
          objectFit: styles.objectFit || "contain",
          borderRadius: styles.borderRadius || customStyles.borderRadius || "none",
          maxWidth: "40px",
          maxHeight: "40px",
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
