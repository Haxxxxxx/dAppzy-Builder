import React, { useCallback } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const DEFAULT_CONTENT = {
  totalPages: 5,
  currentPage: 1,
  showPrevNext: true,
};

const Pagination = ({ id }) => {
  const { data: rawData, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'pagination');

  const data = rawData || DEFAULT_CONTENT;
  const { totalPages, currentPage, showPrevNext } = { ...DEFAULT_CONTENT, ...data };

  const goToPage = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    const updated = { ...data, currentPage: page };
    updateData(updated);
  }, [data, totalPages, updateData]);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const accentColor = styles.accentColor || '#5C4EFA';

  const btnBase = {
    border: '1px solid #d0d0d0',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: styles.fontSize || '14px',
    fontFamily: styles.fontFamily || 'inherit',
    background: '#fff',
    color: '#333',
    minWidth: '36px',
    textAlign: 'center',
    lineHeight: 1.4,
    transition: 'all 0.15s ease',
  };

  const activeBtn = {
    ...btnBase,
    background: accentColor,
    color: '#fff',
    borderColor: accentColor,
    fontWeight: '600',
  };

  const disabledBtn = {
    ...btnBase,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <nav
      id={id}
      onClick={handleSelect}
      aria-label="Pagination"
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        padding: styles.padding || '8px 0',
        ...styles,
        outline: isSelected ? '2px solid #5C4EFA' : undefined,
      }}
    >
      {showPrevNext && (
        <button
          onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1); }}
          style={currentPage <= 1 ? disabledBtn : btnBase}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          &lsaquo;
        </button>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={(e) => { e.stopPropagation(); goToPage(page); }}
          style={page === currentPage ? activeBtn : btnBase}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      {showPrevNext && (
        <button
          onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1); }}
          style={currentPage >= totalPages ? disabledBtn : btnBase}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          &rsaquo;
        </button>
      )}
    </nav>
  );
};

export default Pagination;
