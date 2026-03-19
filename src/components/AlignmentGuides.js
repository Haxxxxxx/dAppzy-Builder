import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/AlignmentGuides.css';

const SNAP_THRESHOLD = 5; // px tolerance for alignment detection
const FADE_DELAY = 1500; // ms before guides fade out

/**
 * AlignmentGuides — renders visual snap lines on the canvas when the selected
 * element's edges or center align with sibling elements.
 *
 * Lines appear on selection change and fade after FADE_DELAY ms.
 * Rendered as a portal-like overlay inside the canvas area (main-content).
 */
const AlignmentGuides = () => {
  const { selectedElement, elementsMap } = useContext(EditableContext);
  const [guides, setGuides] = useState([]);
  const [visible, setVisible] = useState(false);
  const fadeTimer = useRef(null);
  const prevSelectedId = useRef(null);

  const computeGuides = useCallback(() => {
    if (!selectedElement?.id) return [];

    const selectedNode = document.querySelector(`[data-element-id="${selectedElement.id}"]`);
    if (!selectedNode) return [];

    // Find the content-list container to compute relative positions
    const canvas = selectedNode.closest('.content-list');
    if (!canvas) return [];
    const canvasRect = canvas.getBoundingClientRect();

    const selectedRect = selectedNode.getBoundingClientRect();

    // Selected element edges and centers relative to canvas
    const sel = {
      left: selectedRect.left - canvasRect.left,
      right: selectedRect.right - canvasRect.left,
      top: selectedRect.top - canvasRect.top,
      bottom: selectedRect.bottom - canvasRect.top,
      centerX: (selectedRect.left + selectedRect.right) / 2 - canvasRect.left,
      centerY: (selectedRect.top + selectedRect.bottom) / 2 - canvasRect.top,
    };

    // Find siblings: elements with the same parentId
    const element = elementsMap.get(selectedElement.id);
    if (!element) return [];

    const parentId = element.parentId;
    const siblingIds = [];
    for (const [id, el] of elementsMap) {
      if (id !== selectedElement.id && el.parentId === parentId) {
        siblingIds.push(id);
      }
    }

    const newGuides = [];

    for (const sibId of siblingIds) {
      const sibNode = document.querySelector(`[data-element-id="${sibId}"]`);
      if (!sibNode) continue;

      const sibRect = sibNode.getBoundingClientRect();
      const sib = {
        left: sibRect.left - canvasRect.left,
        right: sibRect.right - canvasRect.left,
        top: sibRect.top - canvasRect.top,
        bottom: sibRect.bottom - canvasRect.top,
        centerX: (sibRect.left + sibRect.right) / 2 - canvasRect.left,
        centerY: (sibRect.top + sibRect.bottom) / 2 - canvasRect.top,
      };

      // Vertical alignment checks (produce vertical lines)
      const verticalChecks = [
        { selEdge: sel.left, sibEdge: sib.left, label: 'left-left' },
        { selEdge: sel.right, sibEdge: sib.right, label: 'right-right' },
        { selEdge: sel.centerX, sibEdge: sib.centerX, label: 'centerX' },
        { selEdge: sel.left, sibEdge: sib.right, label: 'left-right' },
        { selEdge: sel.right, sibEdge: sib.left, label: 'right-left' },
      ];

      for (const check of verticalChecks) {
        if (Math.abs(check.selEdge - check.sibEdge) <= SNAP_THRESHOLD) {
          const x = check.sibEdge;
          const minY = Math.min(sel.top, sib.top);
          const maxY = Math.max(sel.bottom, sib.bottom);
          newGuides.push({
            type: 'vertical',
            x,
            y1: minY,
            y2: maxY,
            key: `v-${sibId}-${check.label}`,
          });
        }
      }

      // Horizontal alignment checks (produce horizontal lines)
      const horizontalChecks = [
        { selEdge: sel.top, sibEdge: sib.top, label: 'top-top' },
        { selEdge: sel.bottom, sibEdge: sib.bottom, label: 'bottom-bottom' },
        { selEdge: sel.centerY, sibEdge: sib.centerY, label: 'centerY' },
        { selEdge: sel.top, sibEdge: sib.bottom, label: 'top-bottom' },
        { selEdge: sel.bottom, sibEdge: sib.top, label: 'bottom-top' },
      ];

      for (const check of horizontalChecks) {
        if (Math.abs(check.selEdge - check.sibEdge) <= SNAP_THRESHOLD) {
          const y = check.sibEdge;
          const minX = Math.min(sel.left, sib.left);
          const maxX = Math.max(sel.right, sib.right);
          newGuides.push({
            type: 'horizontal',
            y,
            x1: minX,
            x2: maxX,
            key: `h-${sibId}-${check.label}`,
          });
        }
      }
    }

    // Deduplicate guides that are essentially at the same position
    const seen = new Set();
    return newGuides.filter((g) => {
      const roundKey =
        g.type === 'vertical'
          ? `v-${Math.round(g.x)}`
          : `h-${Math.round(g.y)}`;
      if (seen.has(roundKey)) return false;
      seen.add(roundKey);
      return true;
    });
  }, [selectedElement, elementsMap]);

  useEffect(() => {
    // Only recompute when the selected element changes (not on every render)
    if (selectedElement?.id === prevSelectedId.current) return;
    prevSelectedId.current = selectedElement?.id ?? null;

    if (fadeTimer.current) clearTimeout(fadeTimer.current);

    if (!selectedElement?.id) {
      setGuides([]);
      setVisible(false);
      return;
    }

    // Small delay to let the DOM settle after selection
    const raf = requestAnimationFrame(() => {
      const newGuides = computeGuides();
      setGuides(newGuides);
      if (newGuides.length > 0) {
        setVisible(true);
        fadeTimer.current = setTimeout(() => setVisible(false), FADE_DELAY);
      } else {
        setVisible(false);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [selectedElement?.id, computeGuides]);

  if (guides.length === 0) return null;

  return (
    <div className={`alignment-guides-overlay ${visible ? 'alignment-guides-visible' : 'alignment-guides-hidden'}`}>
      {guides.map((guide) =>
        guide.type === 'vertical' ? (
          <div
            key={guide.key}
            className="alignment-guide alignment-guide-vertical"
            style={{
              left: `${guide.x}px`,
              top: `${guide.y1}px`,
              height: `${guide.y2 - guide.y1}px`,
            }}
          />
        ) : (
          <div
            key={guide.key}
            className="alignment-guide alignment-guide-horizontal"
            style={{
              top: `${guide.y}px`,
              left: `${guide.x1}px`,
              width: `${guide.x2 - guide.x1}px`,
            }}
          />
        )
      )}
    </div>
  );
};

export default AlignmentGuides;
