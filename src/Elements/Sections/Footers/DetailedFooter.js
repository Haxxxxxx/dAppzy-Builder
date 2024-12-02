import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import RemovableWrapper from '../../../utils/RemovableWrapper';
const DetailedFooter = ({ uniqueId, children }) => {
  if (!children || children.length === 0) {
    console.warn('No children provided for DetailedFooter');
    return null;
  }

  return (
    <footer
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: '#444',
        color: '#eee',
      }}
    >
      {/* Left Section: Company Info */}
      <div>
        {children
          .filter((child) => child.type === 'span')
          .map((child) => (
          <RemovableWrapper id={child.id}>
            <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />
          </RemovableWrapper>
          ))}
      </div>

      {/* Center Section: Policies */}
      <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
        {children
          .filter((child) => child.type === 'span' && child.content.includes('Policy'))
          .map((child) => (
            <li key={child.id}>            
            <RemovableWrapper id={child.id}>
              <Span id={child.id} content={child.content} styles={child.styles} />
            </RemovableWrapper>
            </li>
          ))}
      </ul>

      {/* Right Section: Social Media */}
      <div>
        {children
          .filter((child) => child.type === 'span' && child.content.includes('Follow'))
          .map((child) => (
            <RemovableWrapper id={child.id}>
              <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />
            </RemovableWrapper>
          ))}
        {children
          .filter((child) => child.type === 'button')
          .map((child) => (
            <RemovableWrapper id={child.id}>
              <Button key={child.id} id={child.id} content={child.content} styles={child.styles} />
            </RemovableWrapper>

          ))}
      </div>
    </footer>
  );
};

export default DetailedFooter;

