import React, { useContext, forwardRef, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { EditableContext } from '../context/EditableContext';
import ResizeHandles from '../components/ResizeHandles';
import ElementContextMenu from '../components/ElementContextMenu';
import { INLINE_TYPES } from '../core/elementRegistry';
import { DIV } from '../constants/elementTypes';
import { generateUniqueId } from './LeftBarUtils/elementUtils';
import { saveBlock } from '../services/blockService';
import { authStorage } from './storageManager';
const toKebabCase = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Fixed-position toolbar that escapes all overflow:hidden parents.
 * Uses getBoundingClientRect to position relative to the viewport.
 * Flips below the element if there's no room above.
 */
const FixedToolbar = ({ containerRef, id, toolbarBtnStyle, onEdit, onDuplicate, onCopyStyles, onPasteStyles, hasCopiedStyles, onMoveUp, onMoveDown, canMoveUp, canMoveDown, onDelete }) => {
  const toolbarRef = React.useRef(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    const updatePos = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const toolbarH = 32;
      const gap = 4;
      // Default: above the element
      let top = rect.top - toolbarH - gap;
      let left = rect.left;
      // Flip below if no room above
      if (top < 4) top = rect.bottom + gap;
      // Clamp to right edge
      const toolbarW = toolbarRef.current?.offsetWidth || 300;
      if (left + toolbarW > window.innerWidth - 8) left = window.innerWidth - toolbarW - 8;
      if (left < 4) left = 4;
      setPos({ top, left });
    };
    updatePos();
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.addEventListener('scroll', updatePos, { passive: true });
    window.addEventListener('resize', updatePos);
    return () => {
      if (mainContent) mainContent.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
    };
  }, [containerRef]);

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: '#1a1a2e',
        borderRadius: '6px',
        padding: '3px 6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', padding: '0 4px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '24px' }} title={id}>{id}</span>
      <span className="material-symbols-outlined" onClick={onEdit} style={toolbarBtnStyle} title="Edit">edit</span>
      <span className="material-symbols-outlined" onClick={onDuplicate} style={toolbarBtnStyle} title="Duplicate">content_copy</span>
      <span className="material-symbols-outlined" onClick={onCopyStyles} style={toolbarBtnStyle} title="Copy styles">palette</span>
      <span className="material-symbols-outlined" onClick={onPasteStyles} style={{ ...toolbarBtnStyle, opacity: hasCopiedStyles ? 1 : 0.35, cursor: hasCopiedStyles ? 'pointer' : 'default' }} title="Paste styles">format_paint</span>
      <span className="material-symbols-outlined" onClick={onMoveUp} style={{ ...toolbarBtnStyle, opacity: canMoveUp ? 1 : 0.35, cursor: canMoveUp ? 'pointer' : 'default' }} title="Move up">arrow_upward</span>
      <span className="material-symbols-outlined" onClick={onMoveDown} style={{ ...toolbarBtnStyle, opacity: canMoveDown ? 1 : 0.35, cursor: canMoveDown ? 'pointer' : 'default' }} title="Move down">arrow_downward</span>
      <span className="material-symbols-outlined" onClick={onDelete} style={{ ...toolbarBtnStyle, color: 'var(--error-red, #ff6b6b)' }} title="Delete">delete</span>
    </div>
  );
};

/**
 * Generates a CSS rule string from a camelCase style object.
 * e.g. { backgroundColor: '#000', color: '#fff' } => "background-color: #000; color: #fff;"
 */
function generateCSSBlock(styles) {
  if (!styles || typeof styles !== 'object') return '';
  return Object.entries(styles)
    .filter(([, v]) => v != null && v !== '')
    .map(([key, value]) => `${toKebabCase(key)}: ${value} !important`)
    .join('; ');
}

const withSelectable = (WrappedComponent) => {
  const WithSelectable = forwardRef((props, ref) => {
    const { id, type } = props;
    const {
      selectedElement,
      setSelectedElement,
      handleRemoveElement,
      updateStyles,
      elements,
      setElements,
      copyElement,
      pasteElement,
      duplicateElement,
      copiedElement,
      elementsMap,
      copyStyles,
      pasteStyles,
      copiedStyles,
      toggleElementSelection,
      selectedElementIds,
      clearSelection,
      previewMode,
      serializeElementTree,
    } = useContext(EditableContext);
    const [contextMenu, setContextMenu] = useState(null);

    const isSelected = selectedElement?.id === id;
    const isMultiSelected = selectedElementIds?.includes(id);
    const elementData = elementsMap?.get(id);
    const resolvedType = type || elementData?.type;
    const isLocked = elementData?.settings?.locked || elementData?.configuration?.locked;
    const containerRef = useRef(null);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStart = useRef(null);
    const [resizeTooltip, setResizeTooltip] = useState(null);

    // Build hover/focus CSS for this element using a stable data attribute selector
    const stateStyleCSS = useMemo(() => {
      const hoverStyles = elementData?.hoverStyles;
      const focusStyles = elementData?.focusStyles;
      if (!hoverStyles && !focusStyles) return null;

      let css = '';
      const selector = `[data-element-id="${id}"]`;
      if (hoverStyles && Object.keys(hoverStyles).length > 0) {
        css += `${selector}:hover { ${generateCSSBlock(hoverStyles)}; }\n`;
      }
      if (focusStyles && Object.keys(focusStyles).length > 0) {
        css += `${selector}:focus-within { ${generateCSSBlock(focusStyles)}; }\n`;
      }
      return css || null;
    }, [id, elementData?.hoverStyles, elementData?.focusStyles]);

    const handleSelect = (e) => {
      if (previewMode || isResizing || isLocked) return;
      e.stopPropagation();
      // Shift+Click for multi-select
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        toggleElementSelection(id);
        return;
      }
      // Pass the full element object so settings panels get moduleType, content, etc.
      const el = elementsMap?.get(id);
      setSelectedElement(el || { id, type });
    };

    const handleRemove = (e) => {
      if (isLocked) return;
      e.stopPropagation();
      handleRemoveElement(id);
    };

    const handleContextMenu = (e) => {
      if (previewMode) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedElement({ id, type });
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const reorderElement = (direction) => {
      setElements((prev) => {
        const el = prev.find(e => e.id === id);
        if (!el) return prev;
        const parent = prev.find(e => e.id === el.parentId);
        if (!parent?.children) return prev;
        const idx = parent.children.indexOf(id);
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= parent.children.length) return prev;
        const newChildren = [...parent.children];
        [newChildren[idx], newChildren[newIdx]] = [newChildren[newIdx], newChildren[idx]];
        return prev.map(e => e.id === parent.id ? { ...e, children: newChildren } : e);
      });
    };

    const getMenuItems = () => {
      const el = elements.find(e => e.id === id);
      const siblings = el ? elements.filter(e => e.parentId === el.parentId) : [];
      const idx = siblings.findIndex(e => e.id === id);
      const isFirst = idx === 0;
      const isLast = idx === siblings.length - 1;

      return [
        { label: 'Copy', icon: 'content_copy', action: () => copyElement(id) },
        {
          label: 'Paste', icon: 'content_paste',
          disabled: !copiedElement,
          action: () => pasteElement(el?.parentId || null, idx >= 0 ? idx + 1 : 0),
        },
        {
          label: 'Duplicate', icon: 'copy_all',
          action: () => duplicateElement(id, el?.parentId || null, idx >= 0 ? idx + 1 : 0),
        },
        'divider',
        { label: 'Copy Styles', icon: 'content_copy', action: () => copyStyles(id) },
        {
          label: 'Paste Styles', icon: 'content_paste',
          disabled: !copiedStyles,
          action: () => pasteStyles(id),
        },
        'divider',
        {
          label: 'Select Parent', icon: 'vertical_align_top',
          disabled: !el?.parentId,
          action: () => {
            const parent = elements.find(e => e.id === el.parentId);
            if (parent) setSelectedElement(parent);
          },
        },
        {
          label: 'Wrap in Div', icon: 'wrap_text',
          action: () => {
            const parentId = el?.parentId || null;
            const newDivId = generateUniqueId(DIV);
            // Single setElements call: create the wrapper div and reparent in one history entry
            setElements((prev) => {
              const newDiv = {
                id: newDivId,
                type: DIV,
                styles: {},
                content: '',
                children: [id],
                parentId,
                settings: {},
                configuration: {},
              };
              const insertIdx = idx >= 0 ? prev.findIndex(e => e.id === id) : prev.length;
              const updated = [...prev];
              updated.splice(insertIdx >= 0 ? insertIdx : updated.length, 0, newDiv);
              return updated.map(e => {
                // Remove the element from its old parent's children, add new div in its place
                if (e.id === parentId && e.children) {
                  return { ...e, children: e.children.map(cid => cid === id ? newDivId : cid) };
                }
                // Update the element's parentId to the new div
                if (e.id === id) {
                  return { ...e, parentId: newDivId };
                }
                return e;
              });
            });
          },
        },
        'divider',
        { label: 'Move Up', icon: 'arrow_upward', disabled: isFirst || !el?.parentId, action: () => reorderElement(-1) },
        { label: 'Move Down', icon: 'arrow_downward', disabled: isLast || !el?.parentId, action: () => reorderElement(1) },
        // Group Selection — only visible when multiple elements are selected
        ...(selectedElementIds && selectedElementIds.length > 1 ? [
          'divider',
          {
            label: 'Group Selection',
            icon: 'group_work',
            action: () => {
              const ids = selectedElementIds;
              const allEls = elements;
              // Find the selected elements in order
              const selectedEls = ids.map(eid => allEls.find(e => e.id === eid)).filter(Boolean);
              if (selectedEls.length < 2) return;

              // Use the first selected element to determine position
              const firstEl = selectedEls[0];
              const gpParentId = firstEl.parentId || null;
              const newGroupId = generateUniqueId(DIV);

              // Single setElements call: create group div and reparent in one history entry
              setElements((prev) => {
                const newGroup = {
                  id: newGroupId,
                  type: DIV,
                  styles: {},
                  content: '',
                  children: [...ids],
                  parentId: gpParentId,
                  settings: {},
                  configuration: {},
                };
                // Insert the group div at the position of the first selected element
                const firstIdx = prev.findIndex(e => e.id === firstEl.id);
                const updated = [...prev];
                updated.splice(firstIdx >= 0 ? firstIdx : updated.length, 0, newGroup);
                return updated.map(e => {
                  // Remove selected elements from their old parent's children, insert group id
                  if (e.children && e.id !== newGroupId) {
                    const hasSelected = e.children.some(cid => ids.includes(cid));
                    if (hasSelected) {
                      const filtered = e.children.filter(cid => !ids.includes(cid));
                      // Insert the group id where the first selected element was
                      const firstChildIdx = e.children.indexOf(firstEl.id);
                      if (firstChildIdx >= 0) {
                        const insertPos = Math.min(firstChildIdx, filtered.length);
                        filtered.splice(insertPos, 0, newGroupId);
                      } else {
                        filtered.push(newGroupId);
                      }
                      return { ...e, children: filtered };
                    }
                  }
                  // Update each selected element's parentId
                  if (ids.includes(e.id)) {
                    return { ...e, parentId: newGroupId };
                  }
                  return e;
                });
              });

              // Clear multi-selection and select the new group
              clearSelection();
              const groupEl = { id: newGroupId, type: DIV };
              setSelectedElement(groupEl);
            },
          },
        ] : []),
        'divider',
        {
          label: 'Save as Block',
          icon: 'bookmark_add',
          action: async () => {
            const name = window.prompt('Block name:');
            if (!name) return;
            const userId = authStorage.getUserAccount();
            if (!userId) { alert('You must be logged in to save blocks.'); return; }
            const tree = serializeElementTree(id);
            if (!tree || tree.length === 0) return;
            try {
              await saveBlock(userId, name, tree);
              alert(`Block "${name}" saved!`);
            } catch (err) {
              if (import.meta.env.DEV) console.error('[SaveBlock]', err);
              alert('Failed to save block.');
            }
          },
        },
        'divider',
        { label: 'Delete', icon: 'delete', disabled: isLocked, action: () => handleRemoveElement(id) },
      ];
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

    // Toolbar button shared style
    const toolbarBtnStyle = {
      fontSize: '16px',
      color: '#fff',
      cursor: 'pointer',
      padding: '3px',
      borderRadius: '4px',
      lineHeight: 1,
      transition: 'background 0.15s',
    };

    // Compute move-up / move-down availability for the toolbar
    const currentEl = elements.find(e => e.id === id);
    const siblingsList = currentEl ? elements.filter(e => e.parentId === currentEl.parentId) : [];
    const siblingIdx = siblingsList.findIndex(e => e.id === id);
    const canMoveUp = currentEl?.parentId && siblingIdx > 0;
    const canMoveDown = currentEl?.parentId && siblingIdx >= 0 && siblingIdx < siblingsList.length - 1;

    // When selected, force a blue outline border. Multi-selected gets dashed.
    // In preview mode, never show selection outlines.
    const forcedSelectedStyle = previewMode
      ? {}
      : isSelected
        ? { outline: '2px solid var(--purple, #5C4EFA)', outlineOffset: '-2px' }
        : isMultiSelected
          ? { outline: '2px dashed var(--purple, #5C4EFA)', outlineOffset: '-2px' }
          : {};

    return (
      <div
        ref={containerRef}
        data-element-id={id}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        style={{
          position: 'relative',
          ...(INLINE_TYPES.has(resolvedType)
            ? { display: 'inline-block', maxWidth: '100%' }
            : {}),
          ...forcedSelectedStyle,
          boxSizing: 'border-box',
          ...(isLocked && !previewMode ? { cursor: 'not-allowed' } : {}),
        }}
      >
        {stateStyleCSS && <style dangerouslySetInnerHTML={{ __html: stateStyleCSS }} />}
        {isSelected && !previewMode && (
          <>
            <FixedToolbar containerRef={containerRef} id={id} toolbarBtnStyle={toolbarBtnStyle}
              onEdit={(e) => { e.stopPropagation(); setSelectedElement(elementData || { id, type }); }}
              onDuplicate={(e) => {
                e.stopPropagation();
                const el = elements.find(el => el.id === id);
                const siblings = el ? elements.filter(e => e.parentId === el.parentId) : [];
                const idx = siblings.findIndex(e => e.id === id);
                duplicateElement(id, el?.parentId || null, idx >= 0 ? idx + 1 : 0);
              }}
              onCopyStyles={(e) => { e.stopPropagation(); copyStyles(id); }}
              onPasteStyles={(e) => { e.stopPropagation(); if (copiedStyles) pasteStyles(id); }}
              hasCopiedStyles={!!copiedStyles}
              onMoveUp={(e) => { e.stopPropagation(); reorderElement(-1); }}
              onMoveDown={(e) => { e.stopPropagation(); reorderElement(1); }}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onDelete={handleRemove}
            />
            {resizeTooltip && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--purple, #5C4EFA)',
                  color: 'var(--white, #fff)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  zIndex: 12,
                  pointerEvents: 'none',
                }}
              >
                {resizeTooltip.width} x {resizeTooltip.height}
              </div>
            )}
          </>
        )}
        <WrappedComponent {...props} ref={ref} />
        {isLocked && !previewMode && (
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              fontSize: '16px',
              color: 'var(--purple, #5C4EFA)',
              background: 'rgba(255,255,255,0.85)',
              borderRadius: '4px',
              padding: '2px',
              pointerEvents: 'none',
              zIndex: 11,
              lineHeight: 1,
            }}
            title="Locked"
          >
            lock
          </span>
        )}
        {contextMenu && !previewMode && (
          <ElementContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            items={getMenuItems()}
          />
        )}
      </div>
    );
  });

  WithSelectable.displayName = `WithSelectable(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithSelectable;
};

export default withSelectable;
