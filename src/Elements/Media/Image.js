import React, { useContext, useEffect, useState } from "react";
import { EditableContext } from "../../context/EditableContext";
import { useDrop } from "react-dnd";

const Image = ({ id, styles: customStyles = {}, handleOpenMediaPanel = () => { }, handleDrop }) => {
  const { elements, updateStyles, setSelectedElement } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { styles = {} } = imageElement;

  const defaultSrc = "https://picsum.photos/150"; // Fallback placeholder
  const [currentSrc, setCurrentSrc] = useState(styles.src || defaultSrc);

  useEffect(() => {
    const storedImage = localStorage.getItem(`image-${id}`);

    if (storedImage) {
      setCurrentSrc(storedImage); // ✅ Fetch from LocalStorage first
    } else if (styles.src && styles.src !== currentSrc) {
      setCurrentSrc(styles.src); // ✅ Update from context if necessary
    }
  }, [styles.src, id, elements]); // ✅ Ensure re-renders when context updates



  const [{ isOver }, drop] = useDrop(() => ({
    accept: "mediaItem",
    drop: (item) => {
      if (item.src) {
        updateStyles(id, { src: item.src });
        setCurrentSrc(item.src);
        setSelectedElement({
          id,
          type: "image",
          styles: { src: item.src, ...styles },
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: "image", src: currentSrc, width: styles.width, height: styles.height, alt: styles.alt });
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
          width: styles.width || customStyles.width || "auto", // ✅ Ensures proper width
          height: styles.height || customStyles.height || "auto", // ✅ Ensures proper height
          objectFit: styles.objectFit || "cover", // ✅ Applies object-fit correctly
          borderRadius: styles.borderRadius || customStyles.borderRadius || "50%", // ✅ Ensures borderRadius applies
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
    </div>
  );
};

export default Image;
