import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const SimpleFooter = ({ uniqueId, children }) => (
  <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#333', color: '#fff' }}>
    {children
      .filter((child) => child.id === `${uniqueId}-simple-message`)
      .map((child) => (
        <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />
      ))}
    {children
      .filter((child) => child.id === `${uniqueId}-simple-cta`)
      .map((child) => (
        <Button key={child.id} id={child.id} content={child.content} styles={child.styles} />
      ))}
  </footer>
);

export default SimpleFooter;
