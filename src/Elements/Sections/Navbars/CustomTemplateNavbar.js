import React, { useContext, useState, useEffect, useRef } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const CustomTemplateNavbar = ({ uniqueId, contentListWidth, children, onDropItem }) => {
  const navRef = useRef(null);
  const { handleRemoveElement } = useContext(EditableContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  // Adjust compact mode based on contentListWidth
  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust the breakpoint as needed
    }
  }, [contentListWidth]);

  // Toggle menu visibility in compact mode
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#ffffff',
        flexWrap: 'wrap',
        position: 'relative',
        border: isOverCurrent ? '2px solid blue' : '1px solid transparent',
        borderRadius: '4px',
      }}
    >
      {/* Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <div key={child.id} style={{ position: 'relative' }}>
              <Image id={child.id} styles={{ ...child.styles, width: '40px', height: '40px', borderRadius: '50%' }} />
              <button
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  border: 'none',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
                onClick={() => handleRemoveElement(child.id)}
              >
                ✕
              </button>
            </div>
          ))}
        {children
          .filter((child) => child?.type === 'span' && child?.content === '3S.Template')
          .map((child) => (
            <div key={child.id} style={{ marginLeft: '8px', position: 'relative' }}>
              <Span id={child.id} content={child.content} styles={{ fontSize: '1.5rem', cursor: 'pointer' }} />
              <button
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  border: 'none',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
                onClick={() => handleRemoveElement(child.id)}
              >
                ✕
              </button>
            </div>
          ))}
      </div>

      {/* Hamburger Menu Icon for Compact View */}
      {isCompact && (
        <div
          style={{
            display: 'flex',
            cursor: 'pointer',
            marginLeft: 'auto',
            fontSize: '1.5rem',
            color: '#000',
          }}
          onClick={toggleMenu}
        >
          ☰
        </div>
      )}

      {/* Compact Menu */}
      {isCompact && isMenuOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
            marginTop: '16px',
            backgroundColor: '#ffffff',
            padding: '16px',
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: '10',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {children
            .filter((child) => child?.type === 'span' && child?.content !== '3S.Template')
            .map((child) => (
              <div key={child.id} style={{ position: 'relative' }}>
                <Span id={child.id} content={child.content} styles={{ fontSize: '1rem', cursor: 'pointer' }} />
                <button
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    border: 'none',
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleRemoveElement(child.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          {children
            .filter((child) => child?.type === 'button')
            .map((child) => (
              <div key={child.id} style={{ position: 'relative' }}>
                <Button
                  id={child.id}
                  content={child.content}
                  styles={{
                    ...child.styles,
                    border: 'none',
                    padding: '12px 20px',
                    fontFamily: 'Roboto, sans-serif',
                    backgroundColor: child.styles?.backgroundColor || '#ffffff',
                    color: child.styles?.color || '#000',
                  }}
                />
                <button
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    border: 'none',
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleRemoveElement(child.id)}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Desktop Links and Buttons */}
      {!isCompact && (
        <>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {children
              .filter((child) => child?.type === 'span' && child?.content !== '3S.Template')
              .map((child) => (
                <div key={child.id} style={{ position: 'relative' }}>
                  <Span id={child.id} content={child.content} styles={{ fontSize: '1rem', cursor: 'pointer' }} />
                  <button
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      border: 'none',
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleRemoveElement(child.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {children
              .filter((child) => child?.type === 'button')
              .map((child) => (
                <div key={child.id} style={{ position: 'relative' }}>
                  <Button
                    id={child.id}
                    content={child.content}
                    styles={{
                      ...child.styles,
                      border: 'none',
                      padding: '16px 28px',
                      backgroundColor: child.styles?.backgroundColor || '#334155',
                      color: child.styles?.color || '#fff',
                    }}
                  />
                  <button
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      border: 'none',
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleRemoveElement(child.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        </>
      )}

      {isOverCurrent && canDrop && <div className="drop-indicator">Drop here</div>}
    </nav>
  );
};

export default CustomTemplateNavbar;
