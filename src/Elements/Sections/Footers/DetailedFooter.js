import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const DetailedFooter = ({ uniqueId, children }) => (
  <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#444', color: '#eee' }}>
    <div>
      {children
        .filter((child) => child.id === `${uniqueId}-company-info`)
        .map((child) => (
          <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />
        ))}
      <div style={{ marginTop: '8px' }}>
        {children
          .filter((child) => child.id === `${uniqueId}-contact`)
          .map((child) => (
            <Button key={child.id} id={child.id} content={child.content} styles={child.styles} />
          ))}
      </div>
    </div>
    <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
      {children
        .filter((child) => child.type === 'span' && child.id.includes('policy'))
        .map((child) => (
          <li key={child.id}>
            <Span id={child.id} content={child.content} styles={child.styles} />
          </li>
        ))}
    </ul>
    <div>
      {children
        .filter((child) => child.id === `${uniqueId}-social-media`)
        .map((child) => (
          <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />
        ))}
    </div>
  </footer>
);

export default DetailedFooter;
