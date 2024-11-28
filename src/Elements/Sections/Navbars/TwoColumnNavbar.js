import React, { useContext, useRef } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button'; // Assuming you have a Button component
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const TwoColumnNavbar = ({ uniqueId, children, onDropItem }) => {
  const navRef = useRef(null);
  const { removeElementById } = useContext(EditableContext);

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

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
                onClick={() => removeElementById(child.id)}
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
                    borderRadius: '50%',
                  }}
                  onClick={() => removeElementById(child.id)}
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
                  borderRadius: '50%',
                }}
                onClick={() => removeElementById(child.id)}
              >
                ✕
              </button>
            </div>
          ))}
      </div>

      {isOverCurrent && canDrop && <div className="drop-indicator">Drop here</div>}
    </nav>
  );
};

export default TwoColumnNavbar;
