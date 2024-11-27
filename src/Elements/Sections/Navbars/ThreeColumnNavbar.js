import React, { useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';

const ThreeColumnNavbar = ({ uniqueId, children }) => {
  const { findElementById, elements } = useContext(EditableContext);

  // Find relevant child elements
  const logo = children?.find((child) => child.id === `${uniqueId}-logo`);
  const links = children?.filter((child) => child.id.includes('-link'));
  const cta = children?.find((child) => child.id === `${uniqueId}-cta`);

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
      }}
    >
      <div>
        {logo && <Image id={logo.id} src={logo.content} styles={logo.styles} />}
      </div>
      <div>
        <ul
          style={{
            display: 'flex',
            listStyleType: 'none',
            gap: '16px',
            padding: 0,
            margin: 0,
          }}
        >
          {links?.map((link) => (
            <li key={link.id}>
              <Span id={link.id} content={link.content} styles={link.styles} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        {cta && <Button id={cta.id} content={cta.content} styles={cta.styles} />}
      </div>
    </nav>
  );
};

export default ThreeColumnNavbar;
