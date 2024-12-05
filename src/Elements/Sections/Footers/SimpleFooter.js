import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import withSelectable from '../../../utils/withSelectable';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const SimpleFooter = ({ uniqueId, children }) => (
  <footer
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#333',
      color: '#fff',
    }}
  >
    {children.map((child) => {
      switch (child.type) {
        case 'span':
          return (
            <SelectableSpan
              key={child.id}
              id={child.id}
              content={child.content}
              styles={child.styles}
            />
          );
        case 'button':
          return (
            <SelectableButton
              key={child.id}
              id={child.id}
              content={child.content}
              styles={child.styles}
            />
          );
        default:
          return null;
      }
    })}
  </footer>
);

export default SimpleFooter;
