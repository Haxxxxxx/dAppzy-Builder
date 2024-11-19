// DetailedFooter.js
import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const DetailedFooter = ({ uniqueId }) => (
  <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <div>
      <Span id={`${uniqueId}-company-info`} content="Company Name, Address Line 1, Address Line 2" />
      <div style={{ marginTop: '8px' }}>
        <Button id={`${uniqueId}-contact`} content="Contact Us" />
      </div>
    </div>
    <div>
      <ul style={{ display: 'flex', flexDirection: 'column', listStyleType: 'none', padding: 0 }}>
        <li><Span id={`${uniqueId}-privacy`} content="Privacy Policy" /></li>
        <li><Span id={`${uniqueId}-terms`} content="Terms of Service" /></li>
        <li><Span id={`${uniqueId}-support`} content="Support" /></li>
      </ul>
    </div>
    <div style={{ textAlign: 'right' }}>
      <Span id={`${uniqueId}-social-media`} content="Follow us: [Social Links]" />
    </div>
  </footer>
);

export default DetailedFooter;