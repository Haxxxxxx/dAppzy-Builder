import React, { useContext, useCallback } from 'react';
import { EditableContext } from '../../context/EditableContext';

const DEFAULT_CONTENT = { html: '', css: '', js: '' };

const CodeInject = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content, styles = {} } = element || {};

  let data;
  try {
    data = typeof content === 'string' ? JSON.parse(content) : (content || DEFAULT_CONTENT);
  } catch {
    data = DEFAULT_CONTENT;
  }

  const { html = '', css = '', js = '' } = { ...DEFAULT_CONTENT, ...data };
  const isEmpty = !html && !css && !js;

  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'codeInject' });
  }, [element, id, setSelectedElement]);

  const isSelected = selectedElement?.id === id;

  // Truncate preview to first 5 lines
  const previewCode = [html, css, js].filter(Boolean).join('\n');
  const previewLines = previewCode.split('\n').slice(0, 5);
  const truncated = previewLines.join('\n');
  const hasMore = previewCode.split('\n').length > 5;

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        backgroundColor: '#1e1e2e',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '80px',
        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        fontSize: '12px',
        color: '#cdd6f4',
        border: isSelected ? '2px solid #5C4EFA' : '1px solid #313244',
        cursor: 'pointer',
        overflow: 'hidden',
        ...styles,
      }}
    >
      {isEmpty ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: 0.6,
          minHeight: '60px',
        }}>
          <span style={{ fontSize: '24px', color: '#89b4fa' }}>&lt;/&gt;</span>
          <span style={{ fontSize: '13px', color: '#a6adc8' }}>Custom Code</span>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {html && <span style={{ color: '#fab387', padding: '2px 6px', background: 'rgba(250,179,135,0.1)', borderRadius: '4px' }}>HTML</span>}
            {css && <span style={{ color: '#89b4fa', padding: '2px 6px', background: 'rgba(137,180,250,0.1)', borderRadius: '4px' }}>CSS</span>}
            {js && <span style={{ color: '#a6e3a1', padding: '2px 6px', background: 'rgba(166,227,161,0.1)', borderRadius: '4px' }}>JS</span>}
          </div>
          <pre style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            lineHeight: 1.5,
            color: '#bac2de',
          }}>
            {truncated}
            {hasMore && <span style={{ color: '#6c7086' }}>{'\n...'}</span>}
          </pre>
        </>
      )}
    </div>
  );
};

export default CodeInject;
