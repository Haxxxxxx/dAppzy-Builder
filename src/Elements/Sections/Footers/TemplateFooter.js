import React, { useEffect, useState } from 'react';
import Span from '../../Texts/Span';
import Image from '../../Media/Image';
import RemovableWrapper from '../../../utils/RemovableWrapper';

const TemplateFooter = ({ uniqueId, contentListWidth, children }) => {
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
        flexDirection: 'column',
        gap: '16px',
        alignItems: isCompact ? 'center' : 'stretch',
        textAlign: isCompact ? 'center' : 'left',
      }}
    >
      {isCompact ? (
        // Compact Display Layout
        <>
          {/* Sections */}
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
              ?.filter((child) => child.type === 'span')
              .map((child) => (
                <RemovableWrapper key={child.id} id={child.id}>
                  <Span id={child.id} content={child.content} styles={child.styles} />
                </RemovableWrapper>
              ))}
          </div>

          {/* Logo and Title */}
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
              ?.filter((child) => child.type === 'image' && child.content.includes('logo'))
              .map((logo) => (
                <RemovableWrapper key={logo.id} id={logo.id}>
                  <Image id={logo.id} src={logo.content} styles={logo.styles} />
                </RemovableWrapper>
              ))}
            {children
              ?.filter((child) => child.type === 'span' && child.content.includes('Template'))
              .map((title) => (
                <RemovableWrapper key={title.id} id={title.id}>
                  <Span id={title.id} content={title.content} styles={title.styles} />
                </RemovableWrapper>
              ))}
          </div>

          {/* Social Icons */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            {children
              ?.filter((child) => child.type === 'image' && child.styles?.social)
              .map((icon) => (
                <RemovableWrapper key={icon.id} id={icon.id}>
                  <Image id={icon.id} src={icon.content} styles={{ width: '24px', height: '24px' }} />
                </RemovableWrapper>
              ))}
          </div>

          {/* Rights */}
          {children
            ?.filter((child) => child.content.includes('rights'))
            .map((rights) => (
              <RemovableWrapper key={rights.id} id={rights.id}>
                <Span id={rights.id} content={rights.content} styles={rights.styles} />
              </RemovableWrapper>
            ))}
        </>
      ) : (
        // Normal Display Layout
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Sections */}
            <div style={{ display: 'flex', gap: '32px' }}>
              {children
                ?.filter((child) => child.type === 'span')
                .map((child) => (
                  <RemovableWrapper key={child.id} id={child.id}>
                    <Span id={child.id} content={child.content} styles={child.styles} />
                  </RemovableWrapper>
                ))}
            </div>

            {/* Logo and Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {children
                  ?.filter((child) => child.type === 'image' && child.content.includes('logo'))
                  .map((logo) => (
                    <RemovableWrapper key={logo.id} id={logo.id}>
                      <Image id={logo.id} src={logo.content} styles={logo.styles} />
                    </RemovableWrapper>
                  ))}
                {children
                  ?.filter((child) => child.type === 'span' && child.content.includes('Template'))
                  .map((title) => (
                    <RemovableWrapper key={title.id} id={title.id}>
                      <Span id={title.id} content={title.content} styles={title.styles} />
                    </RemovableWrapper>
                  ))}
              </div>
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {children
                ?.filter((child) => child.type === 'image' && child.styles?.social)
                .map((icon) => (
                  <RemovableWrapper key={icon.id} id={icon.id}>
                    <Image id={icon.id} src={icon.content} styles={{ width: '24px', height: '24px' }} />
                  </RemovableWrapper>
                ))}
            </div>
          </div>

          {/* Rights */}
          {children
            ?.filter((child) => child.content.includes('rights'))
            .map((rights) => (
              <RemovableWrapper key={rights.id} id={rights.id}>
                <Span id={rights.id} content={rights.content} styles={{ marginTop: '16px', fontSize: '0.875rem', alignSelf: 'center' }} />
              </RemovableWrapper>
            ))}
        </>
      )}
    </footer>
  );
};

export default TemplateFooter;
