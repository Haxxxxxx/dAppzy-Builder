import React, { useContext, useRef, useState } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button'; // Assuming you have a Button component
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const TwoColumnNavbar = ({ uniqueId, children, onDropItem }) => {
  const navRef = useRef(null);
  const { handleRemoveElement, addNewElement } = useContext(EditableContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  const handleAddSection = (format) => {
    addNewElement('section', 1, null, uniqueId, format);
    setIsMenuOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <nav
        ref={(node) => {
          navRef.current = node;
          drop(node);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen((prev) => !prev);
          
        }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          border: isOverCurrent ? '2px solid blue' : '1px solid transparent',
          borderRadius: '4px',
          backgroundColor: isOverCurrent ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          cursor: 'pointer',
        }}
      >
        {/* Logo Section */}
        <div>
          {children
            .filter((child) => child?.type === 'image')
            .map((child) => (
              <div key={child.id} style={{ position: 'relative' }}>
                <Image id={child.id} styles={child.styles} />
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveElement(child.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>

        {/* Links and Button Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Links */}
          <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
            {children
              .filter((child) => child?.type === 'span')
              .map((child) => (
                <li key={child.id} style={{ position: 'relative' }}>
                  <Span id={child.id} content={child.content} styles={child.styles} />
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(child.id);
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
          </ul>

          {/* Buttons */}
          {children
            .filter((child) => child?.type === 'button')
            .map((child) => (
              <div key={child.id} style={{ position: 'relative' }}>
                <Button id={child.id} content={child.content} styles={child.styles} />
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveElement(child.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      </nav>

      {isMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'white',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            padding: '10px',
            zIndex: 10,
            borderRadius: '4px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ marginBottom: '8px' }}>Select a Section Format:</p>
          <button
            onClick={() => handleAddSection('twoColumn')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '4px',
              cursor: 'pointer',
            }}
          >
            Two Column
          </button>
          <button
            onClick={() => handleAddSection('threeColumn')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '4px',
              cursor: 'pointer',
            }}
          >
            Three Column
          </button>
          <button
            onClick={() => handleAddSection('customTemplate')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              cursor: 'pointer',
            }}
          >
            Custom Template
          </button>
        </div>
      )}

      {isOverCurrent && canDrop && <div className="drop-indicator">Drop here</div>}
    </div>
  );
};

export default TwoColumnNavbar;
