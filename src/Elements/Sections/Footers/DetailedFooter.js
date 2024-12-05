import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import withSelectable from '../../../utils/withSelectable';

const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);

const DetailedFooter = ({ uniqueId, children }) => (
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
          <SelectableSpan
            key={child.id}
            id={child.id}
            content={child.content}
            styles={child.styles}
          />
        ))}
    </div>

    {/* Center Section: Policies */}
    <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
      {children
        .filter((child) => child.type === 'span' && child.content.includes('Policy'))
        .map((child) => (
          <li key={child.id}>
            <SelectableSpan
              id={child.id}
              content={child.content}
              styles={child.styles}
            />
          </li>
        ))}
    </ul>

    {/* Right Section: Social Media */}
    <div>
      {children
        .filter((child) => child.type === 'span' && child.content.includes('Follow'))
        .map((child) => (
          <SelectableSpan
            key={child.id}
            id={child.id}
            content={child.content}
            styles={child.styles}
          />
        ))}
      {children
        .filter((child) => child.type === 'button')
        .map((child) => (
          <SelectableButton
            key={child.id}
            id={child.id}
            content={child.content}
            styles={child.styles}
          />
        ))}
    </div>
  </footer>
);

export default DetailedFooter;
