import React, { useContext, useMemo } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/CanvasBreadcrumb.css';

/** Maximum ancestors shown before truncating with "..." */
const MAX_VISIBLE_SEGMENTS = 4;

/**
 * CanvasBreadcrumb — floating breadcrumb bar fixed to the bottom of the canvas
 * viewport. Shows the full element hierarchy path (Root > Parent > ... > Current)
 * with clickable segments to select ancestors.
 */
const CanvasBreadcrumb = () => {
  const { selectedElement, elementsMap, setSelectedElement } = useContext(EditableContext);

  // Walk up the parent chain to build the ancestor path
  const breadcrumbPath = useMemo(() => {
    if (!selectedElement?.id) return [];

    const path = [];
    let current = elementsMap.get(selectedElement.id);
    const visited = new Set(); // guard against circular references

    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift({
        id: current.id,
        type: current.type,
        label: current.label || current.type || current.id,
      });
      if (!current.parentId) break;
      current = elementsMap.get(current.parentId);
    }

    return path;
  }, [selectedElement?.id, elementsMap]);

  if (breadcrumbPath.length === 0) return null;

  // Truncation logic: show first segment + "..." + last (MAX_VISIBLE_SEGMENTS - 1) segments
  let displaySegments;
  if (breadcrumbPath.length > MAX_VISIBLE_SEGMENTS) {
    const first = breadcrumbPath[0];
    const tail = breadcrumbPath.slice(-(MAX_VISIBLE_SEGMENTS - 1));
    displaySegments = [first, { id: '__ellipsis', label: '...' }, ...tail];
  } else {
    displaySegments = breadcrumbPath;
  }

  const handleSegmentClick = (segment, e) => {
    e.stopPropagation();
    if (segment.id === '__ellipsis') return;
    const el = elementsMap.get(segment.id);
    if (el) {
      setSelectedElement(el);
    }
  };

  return (
    <div className="canvas-breadcrumb">
      {displaySegments.map((segment, idx) => {
        const isCurrent = segment.id === selectedElement.id;
        const isEllipsis = segment.id === '__ellipsis';
        return (
          <React.Fragment key={segment.id}>
            {idx > 0 && <span className="canvas-breadcrumb-separator">&rsaquo;</span>}
            <span
              className={`canvas-breadcrumb-segment${isCurrent ? ' canvas-breadcrumb-current' : ''}${isEllipsis ? ' canvas-breadcrumb-ellipsis' : ''}`}
              onClick={isEllipsis ? undefined : (e) => handleSegmentClick(segment, e)}
              title={isEllipsis ? 'Path truncated' : `${segment.type} — ${segment.id}`}
            >
              {segment.label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CanvasBreadcrumb;
