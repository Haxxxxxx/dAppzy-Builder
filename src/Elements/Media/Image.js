import React, { useContext, useEffect, useState } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";

const Image = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => {} }) => {
  const { elements, updateElementProperties, setSelectedElement } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = imageElement;

  const defaultSrc = "https://picsum.photos/150";
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
        aria-label="Editable image"
      >
        <img
          src={currentSrc}
          alt={styles.alt || "Editable element"}
          style={{
            width: styles.width || customStyles.width || "auto",
            height: styles.height || customStyles.height || "auto",
            objectFit: styles.objectFit || "cover",
            borderRadius: styles.borderRadius || customStyles.borderRadius || "50%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
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

export default Image;
