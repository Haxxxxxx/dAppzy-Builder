// SimpleFooter.js
import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const SimpleFooter = ({ uniqueId }) => (
  <footer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Span id={`${uniqueId}-simple-message`} content="Simple Footer - © 2024 My Company" />
    <div style={{ marginLeft: '16px' }}>
      <Button id={`${uniqueId}-simple-cta`} content="Subscribe" />
    </div>
  </footer>
);

export default SimpleFooter;