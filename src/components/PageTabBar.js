import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/PageTabBar.css';

/**
 * Converts a page name into a URL-safe slug.
 * e.g. "About Us" -> "/about-us"
 */
const nameToSlug = (name) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `/${slug}`;
};

const PageTabBar = () => {
  const {
    pages,
    activePageIndex,
    switchPage,
    addPage,
    removePage,
    renamePage,
  } = useContext(EditableContext);

  const [contextMenu, setContextMenu] = useState(null); // { x, y, pageIndex }
  const [isRenaming, setIsRenaming] = useState(null); // pageIndex being renamed
  const [renameValue, setRenameValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const renameInputRef = useRef(null);
  const addInputRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Focus rename input when it appears
  useEffect(() => {
    if (isRenaming !== null && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  // Focus add input when it appears
  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

  const handleTabClick = useCallback((index) => {
    if (index !== activePageIndex) {
      switchPage(index);
    }
  }, [activePageIndex, switchPage]);

  const handleContextMenu = useCallback((e, index) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, pageIndex: index });
  }, []);

  const handleStartRename = useCallback((index) => {
    setContextMenu(null);
    setRenameValue(pages[index].name);
    setIsRenaming(index);
  }, [pages]);

  const handleConfirmRename = useCallback(() => {
    if (isRenaming === null) return;
    const name = renameValue.trim();
    if (name) {
      const page = pages[isRenaming];
      const slug = isRenaming === 0 ? '/' : nameToSlug(name);
      renamePage(page.id, name, slug);
    }
    setIsRenaming(null);
    setRenameValue('');
  }, [isRenaming, renameValue, pages, renamePage]);

  const handleDeletePage = useCallback((index) => {
    setContextMenu(null);
    if (pages.length <= 1) return;
    removePage(pages[index].id);
  }, [pages, removePage]);

  const handleAddPage = useCallback(() => {
    setIsAdding(true);
    setNewPageName('');
  }, []);

  const handleConfirmAdd = useCallback(() => {
    const name = newPageName.trim();
    if (name) {
      const slug = nameToSlug(name);
      addPage(name, slug);
      // Switch to the new page after it's created (it will be the last page)
      // Use setTimeout to ensure state has updated
      setTimeout(() => {
        switchPage(pages.length); // new page is at the end
      }, 0);
    }
    setIsAdding(false);
    setNewPageName('');
  }, [newPageName, addPage, switchPage, pages.length]);

  const handleCancelAdd = useCallback(() => {
    setIsAdding(false);
    setNewPageName('');
  }, []);

  return (
    <div className="page-tab-bar">
      <div className="page-tabs">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`page-tab ${index === activePageIndex ? 'page-tab--active' : ''}`}
            onClick={() => handleTabClick(index)}
            onContextMenu={(e) => handleContextMenu(e, index)}
            title={`${page.name} (${page.slug})`}
          >
            {isRenaming === index ? (
              <input
                ref={renameInputRef}
                className="page-tab-rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmRename();
                  if (e.key === 'Escape') { setIsRenaming(null); setRenameValue(''); }
                }}
                onBlur={handleConfirmRename}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="page-tab-name">{page.name}</span>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="page-tab page-tab--adding">
            <input
              ref={addInputRef}
              className="page-tab-rename-input"
              value={newPageName}
              placeholder="Page name"
              onChange={(e) => setNewPageName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmAdd();
                if (e.key === 'Escape') handleCancelAdd();
              }}
              onBlur={() => {
                if (newPageName.trim()) {
                  handleConfirmAdd();
                } else {
                  handleCancelAdd();
                }
              }}
            />
          </div>
        ) : (
          <button
            className="page-tab-add"
            onClick={handleAddPage}
            title="Add new page"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          </button>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="page-tab-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="page-tab-context-item"
            onClick={() => handleStartRename(contextMenu.pageIndex)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
            Rename
          </button>
          {pages.length > 1 && (
            <button
              className="page-tab-context-item page-tab-context-item--danger"
              onClick={() => handleDeletePage(contextMenu.pageIndex)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageTabBar;
