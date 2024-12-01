import React, { useContext, useRef, useState } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button'; // Assuming you have a Button component
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const ThreeColumnNavbar = ({ uniqueId, children, onDropItem }) => {
  const navRef = useRef(null);
  const { handleRemoveElement, setSelectedElements } = useContext(EditableContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

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
        padding: '10px',
        border: isOverCurrent ? '2px solid blue' : '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: isOverCurrent ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        position: 'relative',
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
                  borderRadius: '50%',
                }}
                onClick={() => handleRemoveElement(child.id)}
              >
                ✕
              </button>
            </div>
          ))}
      </div>

      {/* Links Section */}
      <div
        style={{
          display: isMobileMenuOpen ? 'block' : 'flex',
          alignItems: 'center',
          gap: '16px',
          flexDirection: isMobileMenuOpen ? 'column' : 'row',
        }}
      >
        <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px', padding: 0, margin: 0 }}>
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
                    borderRadius: '50%',
                  }}
                  onClick={() => handleRemoveElement(child.id)}
                >
                  ✕
                </button>
              </li>
            ))}
        </ul>
      </div>

      {/* Call-to-Action Button Section */}
      <div>
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
                  borderRadius: '50%',
                }}
                onClick={() => handleRemoveElement(child.id)}
              >
                ✕
              </button>
            </div>
          ))}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        style={{
          display: 'none',
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '8px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={toggleMobileMenu}
      >
        ☰
      </button>

      {isOverCurrent && canDrop && <div className="drop-indicator">Drop here</div>}
    </nav>
  );
};

export default ThreeColumnNavbar;
