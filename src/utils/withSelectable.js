import React, { useContext, forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import ResizeHandles from '../components/ResizeHandles';

const withSelectable = (WrappedComponent) => {
  const WithSelectable = forwardRef((props, ref) => {
    const { id, type } = props;
    const {
      selectedElement,
      setSelectedElement,
      handleRemoveElement,
      updateStyles,
      elements,
    } = useContext(EditableContext);

    const isSelected = selectedElement?.id === id;
    const elementData = elements?.find(el => el.id === id);
    const isLocked = elementData?.settings?.locked || elementData?.configuration?.locked;
    const containerRef = useRef(null);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStart = useRef(null);
    const [resizeTooltip, setResizeTooltip] = useState(null);

    const handleSelect = (e) => {
      if (isResizing || isLocked) return;
      e.stopPropagation();
      setSelectedElement({ id, type });
    };

    const handleRemove = (e) => {
      if (isLocked) return;
      e.stopPropagation();
      handleRemoveElement(id);
    };

    const handleResizeMouseDown = useCallback((position, e) => {
      e.stopPropagation();
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setIsResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
        position,
      };
      setResizeTooltip({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }, []);

    useEffect(() => {
      if (!isResizing) return;

      const handleMouseMove = (e) => {
        const start = resizeStart.current;
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        let newWidth = start.width;
        let newHeight = start.height;

        if (start.position.includes('e')) newWidth = Math.max(20, start.width + dx);
        if (start.position.includes('w')) newWidth = Math.max(20, start.width - dx);
        if (start.position.includes('s')) newHeight = Math.max(20, start.height + dy);
        if (start.position.includes('n')) newHeight = Math.max(20, start.height - dy);

        setResizeTooltip({ width: Math.round(newWidth), height: Math.round(newHeight) });
        updateStyles(id, {
          width: Math.round(newWidth) + 'px',
          height: Math.round(newHeight) + 'px',
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        resizeStart.current = null;
        setResizeTooltip(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isResizing, id, updateStyles]);

    // When selected, force a blue outline border.
    const forcedSelectedStyle = isSelected
      ? { outline: '2px solid var(--purple, #5C4EFA)', borderInline: '0.5px solid var(--purple, #5C4EFA)' }
      : {};

    return (
      <div
        ref={containerRef}
        onClick={handleSelect}
        style={{
          position: 'relative',
          ...forcedSelectedStyle,
          boxSizing: 'border-box',
        }}
      >
        {isSelected && (
          <>
            <div
              style={{
                position: 'absolute',
                zIndex: 1000,
                pointerEvents: 'none',
                backgroundColor: 'var(--purple)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                maxWidth: '1500px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '-25px',
              }}
            >
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={id}
              >
                {id}
              </span>
              <span
                className="material-symbols-outlined"
                onClick={handleRemove}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1rem',
                  marginLeft: '8px',
                }}
                title="Remove element"
              >
                delete
              </span>
            </div>
            <ResizeHandles onMouseDown={handleResizeMouseDown} />
            {resizeTooltip && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--purple, #5C4EFA)',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  zIndex: 1001,
                  pointerEvents: 'none',
                }}
              >
                {resizeTooltip.width} x {resizeTooltip.height}
              </div>
            )}
          </>
        )}
        <WrappedComponent {...props} ref={ref} />
      </div>
    );
  });

  WithSelectable.displayName = `WithSelectable(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithSelectable;
};

export default withSelectable;
