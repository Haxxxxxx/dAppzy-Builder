import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";

const Image = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => { }, handleDrop }) => {
  const { elements, updateStyles, setSelectedElement } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = imageElement;
  const defaultSrc = "https://picsum.photos/150"; // Fallback placeholder
  const [currentSrc, setCurrentSrc] = useState(styles.src || defaultSrc);

  useEffect(() => {
    setCurrentSrc(styles.src || defaultSrc);
  }, [styles.src]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "mediaItem",
    drop: (item) => {
      if (item.src) {
        // Update the context with the new src
        updateStyles(id, { src: item.src });

        // Re-select this image with the newly updated styles
        setSelectedElement({
          id,
          type: "image",
          // If needed, you could also pass in the updated styles directly:
          // styles: { src: item.src, ...styles }
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));


  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: "image" });
    handleOpenMediaPanel();
  };

  return (
    <div
      id={id}
      ref={drop}
      onClick={handleSelect}
      style={{
        ...customStyles,
        border: isOver ? "2px dashed green" : "none",
        position: "relative",
        cursor: "pointer",
        display: "inline-block",
      }}
      aria-label="Editable image"
    >
      <img
        src={currentSrc}
        alt={styles.alt || "Editable element"}
        style={{
          width: styles.width || "auto",
          height: styles.height || "auto",
          objectFit: styles.objectFit || "cover",
          borderRadius: styles.borderRadius || "0",
        }}
      />
    </div>
  );
};

export default Image;
