import React, { useContext, useEffect, useState } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";

const Image = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => {} }) => {
  const { elements, updateElementProperties, setSelectedElement } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = imageElement;

  const defaultSrc = "https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7";
  const [currentSrc, setCurrentSrc] = useState(imageElement.src || defaultSrc);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (imageElement.src && imageElement.src !== currentSrc) {
      setCurrentSrc(imageElement.src);
    }
  }, [imageElement.src, currentSrc]);

  // Only allow images
  const isValidImage = (item) => {
    if (!item || !item.src) return false;
    return item.mediaType === "image"; // Accept only images
  };

  // Custom error messages
  const getFileErrorMessage = (mediaType) => {
    switch (mediaType) {
      case "video":
        return "Videos cannot be used as images.";
      case "file":
        return "PDFs and other document files cannot be used as images.";
      default:
        return "Only image files are allowed.";
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "mediaItem",
    drop: (item) => {
      if (isValidImage(item)) {
        updateElementProperties(id, { src: item.src });
        setCurrentSrc(item.src);
        setSelectedElement({ id, type: "image", src: item.src, styles });
        setErrorMessage(""); // Clear previous errors
      } else {
        setErrorMessage(getFileErrorMessage(item.mediaType));
        setTimeout(() => setErrorMessage(""), 5000); // Hide error after 5s
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: "image", src: currentSrc, ...styles });
  };

  return (
    <>
      <img
        id={id}
        ref={drop}
        onClick={handleSelect}
        src={currentSrc}
        alt={styles.alt || "Editable element"}
        style={{
          width: styles.width || customStyles.width || "auto",
          height: styles.height || customStyles.height || "auto",
          objectFit: styles.objectFit || "cover",
          borderRadius: styles.borderRadius || customStyles.borderRadius || "0",
          maxWidth: styles.maxWidth || customStyles.maxWidth || "100%",
          maxHeight: styles.maxHeight || customStyles.maxHeight || "100%",
          border: isOver ? "2px dashed green" : "none",
          position: styles.position || customStyles.position || "relative",
          cursor: styles.cursor || customStyles.cursor || "pointer",
          display: styles.display || customStyles.display || "block"
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

export default Image;
