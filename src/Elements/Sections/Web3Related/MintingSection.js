import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, DateComponent } from '../../SelectableElements';
import { mintingSectionStyles } from './DefaultWeb3Styles';
import useElementDrop from '../../../utils/useElementDrop';

const MintingSection = ({
  handleSelect,
  uniqueId,
  onDropItem,
  handleOpenMediaPanel,
  // you can remove `children` if you don't need it anymore
}) => {
  const { elements } = useContext(EditableContext);
  
  const sectionRef = useRef(null);
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // 1) Filter out the child elements from context
  const childElements = elements.filter((el) => el.parentId === uniqueId);

  // 2) Grab each element by type
  const getChildByType = (type) => childElements.find((child) => child.type === type);
  const getChildrenByType = (type) => childElements.filter((child) => child.type === type);

  const logo          = getChildByType('image');
  const timer         = getChildByType('timer');
  const remaining     = getChildByType('remaining');
  const value         = getChildByType('value');
  const currency      = getChildByType('currency');
  const quantity      = getChildByType('quantity');
  const totalPrice    = getChildByType('price');
  const title         = getChildByType('title');
  const description   = getChildByType('description');
  const mintButton    = getChildByType('button');
  const rareItemsTitle= getChildByType('rareItemsTitle');
  const docItemsTitle = getChildByType('docItemsTitle');
  const rareItems     = getChildrenByType('rare-item');
  const documentItems = getChildrenByType('document-item');

  // 3) UseEffect just to see them in console
  useEffect(() => {
    console.log('MintingSection: childElements =', childElements);
  }, [childElements]);

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={{
        ...mintingSectionStyles.section,
        border: isOverCurrent ? '2px dashed blue' : 'none',
      }}
      onClick={handleSelect}
    >
      {/* Left Section */}
      <div style={mintingSectionStyles.leftSection}>
        {logo && (
          <Image
            id={logo.id}
            src={logo.content}
            styles={mintingSectionStyles.logo}
            handleOpenMediaPanel={handleOpenMediaPanel}
            // handleDrop if you have custom dropping
          />
        )}
        
        {timer && (
          <DateComponent
            id={timer.id}
            content={timer.content}
            label={timer.label}
            styles={mintingSectionStyles.timer}
          />
        )}

        <div style={mintingSectionStyles.details}>
          {remaining && (
            <Span
              id={remaining.id}
              label={remaining.label}
              content={remaining.content}
              styles={mintingSectionStyles.remaining}
            />
          )}
          {value && currency && (
            <Span
              id={`${value.id}-${currency.id}`}
              content={`${value.content} ${currency.content}`}
              label={value.label}
              styles={mintingSectionStyles.price}
            />
          )}
          {quantity && totalPrice && (
            <Span
              id={quantity.id}
              content={`${quantity.content} (${totalPrice.label}: ${totalPrice.content})`}
              label={quantity.label}
              styles={mintingSectionStyles.quantity}
            />
          )}
        </div>

        {mintButton && (
          <Button
            id={mintButton.id}
            content={mintButton.content}
            styles={mintingSectionStyles.mintButton}
          />
        )}
      </div>

      {/* Right Section */}
      <div style={mintingSectionStyles.rightSection}>
        <div style={mintingSectionStyles.rightSectionHeader}>
          {title && (
            <Span
              id={title.id}
              content={title.content}
              styles={mintingSectionStyles.title}
            />
          )}
          {description && (
            <Span
              id={description.id}
              content={description.content}
              styles={mintingSectionStyles.description}
            />
          )}
          {rareItemsTitle && (
            <Span
              id={rareItemsTitle.id}
              content={rareItemsTitle.content}
              styles={mintingSectionStyles.sectionTitle}
            />
          )}
        </div>

        <div style={mintingSectionStyles.itemsContainer}>
          {rareItems.map((item) => (
            <Image
              key={item.id}
              id={item.id}
              src={item.content}
              styles={mintingSectionStyles.itemImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
            />
          ))}
        </div>

        {docItemsTitle && (
          <Span
            id={docItemsTitle.id}
            content={docItemsTitle.content}
            styles={mintingSectionStyles.sectionTitle}
          />
        )}

        <div style={mintingSectionStyles.itemsContainer}>
          {documentItems.map((item) => (
            <Image
              key={item.id}
              id={item.id}
              src={item.content}
              styles={mintingSectionStyles.itemImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
