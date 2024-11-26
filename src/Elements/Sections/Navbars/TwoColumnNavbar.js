import React from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';

const TwoColumnNavbar = ({ uniqueId, children }) => {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        {/* Render the logo */}
        {children
          .filter((child) => child?.type === 'image')
          .map((child) => (
            <Image key={child.id} id={child.id} styles={child.styles} />
          ))}
      </div>
      <div>
        {/* Render the links */}
        <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
          {children
            .filter((child) => child?.type === 'span')
            .map((child) => (
              <li key={child.id}>
                <Span id={child.id} content={child.content} styles={child.styles} />
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
};

export default TwoColumnNavbar;
