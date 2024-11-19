import React from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';

const TwoColumnNavbar = ({ uniqueId }) => (
  <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <Image id={`${uniqueId}-logo`} width="100px" height="50px" src="" />
    </div>
    <div>
      <ul style={{ display: 'flex', listStyleType: 'none', gap: '16px' }}>
        <li><Span id={`${uniqueId}-home`} content="Home" /></li>
        <li><Span id={`${uniqueId}-about`} content="About" /></li>
        <li><Span id={`${uniqueId}-contact`} content="Contact" /></li>
      </ul>
    </div>
  </nav>
);

export default TwoColumnNavbar;
