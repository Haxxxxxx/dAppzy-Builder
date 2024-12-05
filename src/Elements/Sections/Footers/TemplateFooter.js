import React, { useEffect, useState } from 'react';
import Span from '../../Texts/Span';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';

const SelectableSpan = withSelectable(Span);
const SelectableImage = withSelectable(Image);

const TemplateFooter = ({ uniqueId, contentListWidth, children, handleOpenMediaPanel }) => {
  const [isCompact, setIsCompact] = useState(false);

  // Update `isCompact` state based on `contentListWidth`
  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust breakpoint as needed
    }
  }, [contentListWidth]);

  return (
    <footer
      style={{
        backgroundColor: '#4B5563',
        color: '#D1D5DB',
        padding: '24px',
        display: 'flex',
        flexDirection: isCompact ? 'column' : 'row',
        alignItems: isCompact ? 'center' : 'stretch',
        gap: '16px',
        textAlign:'center',
        alignContent:'center',
      }}
    >
      {isCompact ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
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

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {children
              .filter((child) => child.type === 'image')
              .map((logo) => (
                <SelectableImage
                  key={logo.id}
                  id={logo.id}
                  src={logo.content}
                  styles={logo.styles}
                  handleOpenMediaPanel={handleOpenMediaPanel}
                />
              ))}
          </div>
        </>
      ) : (
        <>
            <div style={{ display: 'flex', gap: '32px' }}>
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {children
                .filter((child) => child.type === 'image')
                .map((icon) => (
                  <SelectableImage
                    key={icon.id}
                    id={icon.id}
                    src={icon.content}
                    styles={icon.styles}
                  />
                ))}
            </div>
        </>
      )}
    </footer>
  );
};

export default TemplateFooter;
