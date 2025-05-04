import React, { useRef, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, LinkBlock } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import { DeFiFooterStyles } from './defaultFooterStyles';

const DeFiFooter = ({
  handleSelect,
  uniqueId,
  contentListWidth,
  children,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const navRef = useRef(null);
  const { elements, updateStyles } = useContext(EditableContext);

  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: navRef,
    onDropItem,
  });

  const footerElement = elements.find((el) => el.id === uniqueId);

  useEffect(() => {
    if (!footerElement) return;
    const noCustomStyles = !footerElement.styles || Object.keys(footerElement.styles).length === 0;

    if (noCustomStyles) {
      updateStyles(footerElement.id, {
        ...DeFiFooterStyles.footer,
      });
    }
  }, [footerElement, updateStyles]);

  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src);
    }
  };

  return (
    <footer
      ref={(node) => {
        navRef.current = node;
        drop(node);
      }}
      style={{
        ...DeFiFooterStyles.footer,
        ...(footerElement?.styles || {}),
        borderTop: isOverCurrent ? '2px solid blue' : '1px solid #333',
      }}
      onClick={(e) => handleSelect(e)}
    >
      <div style={DeFiFooterStyles.logoContainer}>
        {(children || [])[0]?.type === 'image' && (
          <Image
            key={children[0].id}
            id={children[0].id}
            src={children[0].content}
            styles={{
              ...DeFiFooterStyles.logo,
              ...children[0].styles,
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}
          />
        )}
        {(children || [])[1]?.type === 'span' && (
          <Span
            key={children[1].id}
            id={children[1].id}
            content={children[1].content}
            styles={{
              ...DeFiFooterStyles.copyright,
              ...children[1].styles,
            }}
          />
        )}
      </div>
      <div style={DeFiFooterStyles.linksContainer}>
        {(children || [])[2]?.type === 'link' && (
          <LinkBlock
            key={children[2].id}
            id={children[2].id}
            content={children[2].content}
            styles={{
              ...DeFiFooterStyles.link,
              ...children[2].styles,
            }}
          />
        )}
        {(children || [])[3]?.type === 'link' && (
          <LinkBlock
            key={children[3].id}
            id={children[3].id}
            content={children[3].content}
            styles={{
              ...DeFiFooterStyles.link,
              ...children[3].styles,
            }}
          />
        )}
      </div>
      <div style={DeFiFooterStyles.rightLinksContainer}>
        {(children || [])[4]?.type === 'link' && (
          <LinkBlock
            key={children[4].id}
            id={children[4].id}
            content={children[4].content}
            styles={{
              ...DeFiFooterStyles.link,
              ...children[4].styles,
            }}
          />
        )}
        {(children || [])[5]?.type === 'link' && (
          <LinkBlock
            key={children[5].id}
            id={children[5].id}
            content={children[5].content}
            styles={{
              ...DeFiFooterStyles.link,
              ...children[5].styles,
            }}
          />
        )}
        {(children || [])[6]?.type === 'link' && (
          <LinkBlock
            key={children[6].id}
            id={children[6].id}
            content={children[6].content}
            styles={{
              ...DeFiFooterStyles.link,
              ...children[6].styles,
            }}
          />
        )}
      </div>
    </footer>
  );
};

export default DeFiFooter; 