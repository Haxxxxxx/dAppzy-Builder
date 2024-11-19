import React from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const ThreeColumnNavbar = ({ uniqueId }) => (
  <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <Image id={`${uniqueId}-logo`} width="100px" height="50px" />
    </div>
    <div>
      <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
        <li><Span id={`${uniqueId}-home`} content="Home" /></li>
        <li><Span id={`${uniqueId}-services`} content="Services" /></li>
        <li><Span id={`${uniqueId}-contact`} content="Contact" /></li>
      </ul>
    </div>
    <div>
      <Button id={`${uniqueId}-cta`} content="Call to Action" />
    </div>
  </nav>
);

export default ThreeColumnNavbar;
