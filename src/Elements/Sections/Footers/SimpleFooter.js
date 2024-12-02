import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import RemovableWrapper from '../../../utils/RemovableWrapper';
const SimpleFooter = ({ uniqueId, children }) => (
  <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#333', color: '#fff' }}>
    {children.map((child) => {
      switch (child.type) {
        case 'span':
          return <RemovableWrapper id={child.id}>
            <Span key={child.id} id={child.id} content={child.content} styles={child.styles} />            
            </RemovableWrapper>
            ;
        case 'button':
          return <RemovableWrapper id={child.id}>
            <Button key={child.id} id={child.id} content={child.content} styles={child.styles} />            
            </RemovableWrapper>
            ;
        default:
          return null;
      }
    })}
  </footer>
);


export default SimpleFooter;
