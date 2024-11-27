import React, { useEffect, useState } from 'react';
import Span from '../../Texts/Span';
import Image from '../../Media/Image';

const TemplateFooter = ({ uniqueId, contentListWidth, children }) => {
  const [isCompact, setIsCompact] = useState(false);

  // Update `isCompact` state based on `contentListWidth`
  useEffect(() => {
    if (typeof contentListWidth === 'number' && !isNaN(contentListWidth)) {
      setIsCompact(contentListWidth < 768); // Adjust breakpoint as needed
    }
  }, [contentListWidth]);

  const logo = children?.find((child) => child.id === `${uniqueId}-logo`);
  const sections = children?.filter((child) => child.id.includes('section'));
  const rights = children?.find((child) => child.id === `${uniqueId}-template-rights`);
  const title = children?.find((child) => child.id === `${uniqueId}-template-title`);
  const socialIcons = children?.filter((child) => child.id.includes('-social-'));

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
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            {sections?.map((section) => (
              <Span key={section.id} id={section.id} content={section.content} />
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
            {logo && <Image id={logo.id} src={logo.content} styles={logo.styles} />}
            {title && <Span id={title.id} content={title.content} styles={title.styles} />}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            {socialIcons?.map((icon) => (
              <Image key={icon.id} id={icon.id} src={icon.content} styles={{ width: '24px', height: '24px' }} />
            ))}
          </div>

          {rights && <Span id={rights.id} content={rights.content} styles={rights.styles} />}
        </>
      ) : (
        // Normal Display Layout
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '32px' }}>
              {sections?.map((section) => (
                <Span key={section.id} id={section.id} content={section.content} />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {logo && <Image id={logo.id} src={logo.content} styles={logo.styles} />}
                {title && <Span id={title.id} content={title.content} styles={title.styles} />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {socialIcons?.map((icon) => (
                <Image key={icon.id} id={icon.id} src={icon.content} styles={{ width: '24px', height: '24px' }} />
              ))}
            </div>
          </div>

          {rights && (
            <Span
              id={rights.id}
              content={rights.content}
              styles={{ marginTop: '16px', fontSize: '0.875rem', alignSelf: 'center' }}
            />
          )}
        </>
      )}
    </footer>
  );
};

export default TemplateFooter;
