// src/components/EditableElements/Image.js
import React, { useContext, useEffect, useState } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";

const Image = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => {} }) => {
  const { elements, updateElementProperties, setSelectedElement } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = imageElement;

  const defaultSrc = "https://picsum.photos/150";
  const [currentSrc, setCurrentSrc] = useState(imageElement.src || defaultSrc);

  useEffect(() => {
    if (imageElement.src && imageElement.src !== currentSrc) {
      setCurrentSrc(imageElement.src);
    }
  }, [imageElement.src, currentSrc]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "mediaItem",
    drop: (item) => {
      if (item.src) {
        updateElementProperties(id, { src: item.src });
        setCurrentSrc(item.src);
        setSelectedElement({
          id,
          type: "image",
          src: item.src,
          styles, // keep existing styles (but don’t store src here)
        });
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
  );
};

export default Image;
