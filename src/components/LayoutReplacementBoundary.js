import React, { useState, useCallback } from 'react';
import './LayoutReplacementBoundary.css';

const LayoutReplacementBoundary = ({ 
  children, 
  layoutId, 
  layoutType,
  onReplace,
  isPreviewMode,
  layoutData,
  elementIndex
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [dropIndicator, setDropIndicator] = useState(null);

  const handleDragStart = useCallback((e) => {
    e.stopPropagation();
    // Set the dragged layout's data
    const dragData = {
      id: layoutId,
      type: layoutType,
      sourceIndex: elementIndex,
      ...layoutData
    };
    console.log('Starting drag for element:', {
      id: layoutId,
      type: layoutType,
      index: elementIndex
    });
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  }, [layoutId, layoutType, layoutData, elementIndex]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPreviewMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate distances to edges
    const distanceToTop = y;
    const distanceToBottom = rect.height - y;
    const distanceToLeft = x;
    const distanceToRight = rect.width - x;
    
    // Find the closest edge (using 50px threshold)
    const threshold = 50;
    const distances = [
      { edge: 'top', distance: distanceToTop },
      { edge: 'bottom', distance: distanceToBottom },
      { edge: 'left', distance: distanceToLeft },
      { edge: 'right', distance: distanceToRight }
    ];
    
    const closestEdge = distances.reduce((closest, current) => 
      current.distance < closest.distance ? current : closest
    );

    if (closestEdge.distance < threshold) {
      setDropIndicator(closestEdge.edge);
      setIsHovering(true);
      e.dataTransfer.dropEffect = "move";
      
      // Log the potential drop position
      console.log('Potential drop at element:', {
        targetId: layoutId,
        targetIndex: elementIndex,
        edge: closestEdge.edge
      });
    } else {
      setDropIndicator(null);
      setIsHovering(false);
      e.dataTransfer.dropEffect = "none";
    }

    setHoverPosition({ x, y });
  }, [isPreviewMode, layoutId, elementIndex]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsHovering(false);
    setDropIndicator(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPreviewMode || !dropIndicator) return;

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Don't allow dropping onto itself
      if (dragData.id === layoutId) {
        return;
      }

      console.log('Drop event:', {
        sourceId: dragData.id,
        sourceIndex: dragData.sourceIndex,
        targetId: layoutId,
        targetIndex: elementIndex,
        edge: dropIndicator
      });

      onReplace({
        oldLayoutId: dragData.id,
        sourceIndex: dragData.sourceIndex,
        targetIndex: elementIndex,
        newLayout: {
          ...dragData,
          id: layoutId,  // Ensure target ID overrides source ID
          type: dragData.type
        },
        position: {
          edge: dropIndicator,
          x: hoverPosition.x,
          y: hoverPosition.y
        }
      });
    } catch (err) {
      console.error('Error handling layout drop:', err);
    }

    setIsHovering(false);
    setDropIndicator(null);
  }, [layoutId, elementIndex, dropIndicator, hoverPosition, onReplace, isPreviewMode]);

  return (
    <div 
      className={`layout-replacement-boundary ${isHovering ? 'hovering' : ''} ${layoutType}`}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!isPreviewMode}
      data-layout-id={layoutId}
      data-layout-type={layoutType}
      data-element-index={elementIndex}
    >
      {dropIndicator && (
        <div className={`drop-indicator ${dropIndicator}`} />
      )}
      {children}
    </div>
  );
};

export default LayoutReplacementBoundary; 